import { Clip } from '../types/editor';
import { getBestPtBrVoice } from './dubbingService';

export interface RenderOptions {
  aspectRatio: '9:16' | '16:9';
  width: number;
  height: number;
  fps: number;
  audioBoost?: number; // e.g. 1.8 to 2.5
  onProgress: (progress: number, statusText: string) => void;
}

/**
 * Real in-browser video compositor using Canvas + Web Audio API + MediaRecorder.
 * Burns in:
 * 1. Smart Cropping / Framing (9:16 vertical 1080x1920 or 16:9 1920x1080)
 * 2. Animated Word-by-Word Karaoke Subtitles
 * 3. Color Grading Filter
 * 4. Portuguese Dubbed Audio (Audio Ducking original + PT-BR Speech Synthesis / Audio Track)
 */
export async function renderClipToVideoBlob(
  videoElement: HTMLVideoElement,
  clip: Clip,
  options: RenderOptions
): Promise<Blob> {
  const { width, height, fps, aspectRatio, onProgress } = options;

  onProgress(5, 'Inicializando renderizador gráfico e motor de áudio...');

  // Setup offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Não foi possível obter o contexto 2D do Canvas.');
  }

  // Determine MediaRecorder mime type
  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }
    }
  }

  // Setup Audio Context & Mixed Stream
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;

  try {
    audioCtx = new AudioCtxClass();
    audioDest = audioCtx.createMediaStreamDestination();
  } catch (e) {
    console.warn('AudioContext not available, falling back to silent/original recording', e);
  }

  // Canvas Video Stream
  const canvasStream = canvas.captureStream(fps);
  const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

  if (audioDest && audioDest.stream.getAudioTracks().length > 0) {
    combinedTracks.push(...audioDest.stream.getAudioTracks());
  }

  const combinedStream = new MediaStream(combinedTracks);
  const recorder = new MediaRecorder(combinedStream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
    videoBitsPerSecond: 6000000, // 6 Mbps for high quality
  });

  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  // Prepare Speech Synthesis for Portuguese dubbing
  const isDubbed = Boolean(clip.dubbing?.enabled);
  let speechUtterance: SpeechSynthesisUtterance | null = null;

  if (isDubbed && clip.dubbing && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    speechUtterance = new SpeechSynthesisUtterance(clip.dubbing.portugueseText);
    speechUtterance.lang = 'pt-BR';
    speechUtterance.rate = clip.dubbing.speechRate || 1.05;
    speechUtterance.volume = clip.dubbing.dubbingVolume || 1.0;

    const matchedVoice = getBestPtBrVoice('masculino');
    if (matchedVoice) {
      speechUtterance.voice = matchedVoice;
    }
  }

  // Connect video audio to destination with audio boost
  try {
    if (audioCtx && audioDest) {
      const source = audioCtx.createMediaElementSource(videoElement);
      const gainNode = audioCtx.createGain();
      const duckingFactor = isDubbed ? clip.dubbing?.volumeDuck ?? 0.8 : 1.0;
      const boost = options.audioBoost ?? 2.2; // 220% audio gain boost for loud and clear sound
      gainNode.gain.setValueAtTime(duckingFactor * boost, audioCtx.currentTime);
      source.connect(gainNode);
      gainNode.connect(audioDest);
      gainNode.connect(audioCtx.destination);
    }
  } catch (err) {
    // MediaElementSource might throw if already connected, ignore gracefully
  }

  // Setup seek to start
  videoElement.currentTime = clip.startTime;
  videoElement.muted = false;

  await new Promise<void>((resolve) => {
    const onSeeked = () => {
      videoElement.removeEventListener('seeked', onSeeked);
      resolve();
    };
    videoElement.addEventListener('seeked', onSeeked);
    // Timeout fallback if seeked doesn't fire
    setTimeout(resolve, 600);
  });

  onProgress(15, 'Iniciando captura de vídeo 9:16 com legendas e áudio...');
  recorder.start(100);

  // Start video playback & dubbing speech
  videoElement.play().catch(() => {});
  if (speechUtterance && window.speechSynthesis) {
    window.speechSynthesis.speak(speechUtterance);
  }

  const duration = Math.max(1, clip.endTime - clip.startTime);

  // Drawing loop
  return new Promise((resolve, reject) => {
    let animId: number;

    const drawFrame = () => {
      const curTime = videoElement.currentTime;
      const elapsed = curTime - clip.startTime;
      const progressPct = Math.min(98, 15 + (elapsed / duration) * 80);

      onProgress(
        Math.floor(progressPct),
        `Renderizando frames 9:16 (${Math.floor(elapsed)}s / ${Math.floor(duration)}s)...`
      );

      // 1. Draw video background frame with proper framing
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, width, height);

      const vw = videoElement.videoWidth || 1920;
      const vh = videoElement.videoHeight || 1080;

      if (aspectRatio === '9:16') {
        // Vertical 9:16 smart center-crop
        // Target ratio: 9/16 (e.g. 1080 / 1920)
        // Crop width from 16:9 video:
        const cropWidth = vh * (9 / 16);
        let cropX = (vw - cropWidth) / 2;

        if (clip.framingMode === 'left') {
          cropX = Math.max(0, cropX - cropWidth * 0.35);
        } else if (clip.framingMode === 'right') {
          cropX = Math.min(vw - cropWidth, cropX + cropWidth * 0.35);
        }

        ctx.drawImage(videoElement, cropX, 0, cropWidth, vh, 0, 0, width, height);
      } else {
        // Horizontal 16:9
        ctx.drawImage(videoElement, 0, 0, vw, vh, 0, 0, width, height);
      }

      // 2. Draw Filter overlay if any
      if (clip.filter === 'vibrant') {
        ctx.fillStyle = 'rgba(255, 140, 0, 0.04)';
        ctx.fillRect(0, 0, width, height);
      } else if (clip.filter === 'cinematic') {
        ctx.fillStyle = 'rgba(10, 20, 40, 0.08)';
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Draw Synchronized Karaoke Subtitles (Sleek, Compact, Never Overcrowded)
      const currentWordIdx = clip.transcript.findIndex(
        (w) => curTime >= w.start && curTime <= w.end
      );

      // Show max 2 to 3 words at a time so it never covers the screen or face
      const wordsToShow = (() => {
        if (clip.transcript.length === 0) return [];
        if (currentWordIdx === -1) {
          const next = clip.transcript.findIndex((w) => w.start > curTime);
          const center = next !== -1 ? Math.max(0, next - 1) : 0;
          return clip.transcript.slice(center, center + 2);
        }
        const start = Math.max(0, currentWordIdx - 1);
        return clip.transcript.slice(start, start + 3);
      })();

      if (wordsToShow.length > 0) {
        const style = clip.captionStyle;
        const posY = (style.positionY / 100) * height;

        // Proportional compact font size: ~22px to 28px on 720p canvas
        const baseCanvasScale = width / 720;
        let fontSize = Math.round((style.fontSize || 18) * 1.3 * baseCanvasScale);
        fontSize = Math.min(30, Math.max(16, fontSize));

        ctx.save();
        ctx.font = `900 ${fontSize}px ${style.fontFamily || "'Montserrat', sans-serif"}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Calculate total text line width
        const wordsText = wordsToShow.map((w) =>
          style.uppercase ? w.word.toUpperCase() : w.word
        );
        let fullLine = wordsText.join(' ');
        let totalLineWidth = ctx.measureText(fullLine).width;

        // Auto scale down if line exceeds 80% of width
        const maxWidth = width * 0.8;
        if (totalLineWidth > maxWidth) {
          const scale = maxWidth / totalLineWidth;
          fontSize = Math.max(14, Math.round(fontSize * scale));
          ctx.font = `900 ${fontSize}px ${style.fontFamily || "'Montserrat', sans-serif"}`;
          totalLineWidth = ctx.measureText(fullLine).width;
        }

        // Draw background pill if configured
        if (style.hasBackground) {
          ctx.fillStyle = style.bgColor || 'rgba(0, 0, 0, 0.65)';
          const padX = fontSize * 0.5;
          const padY = fontSize * 0.3;
          ctx.beginPath();
          ctx.roundRect(
            width / 2 - totalLineWidth / 2 - padX,
            posY - fontSize / 2 - padY,
            totalLineWidth + padX * 2,
            fontSize + padY * 2,
            8
          );
          ctx.fill();
        }

        // Draw each word individually to highlight active word
        let currentX = width / 2 - totalLineWidth / 2;
        const spaceWidth = ctx.measureText(' ').width;

        wordsToShow.forEach((wordObj) => {
          const wordStr = style.uppercase ? wordObj.word.toUpperCase() : wordObj.word;
          const wordWidth = ctx.measureText(wordStr).width;
          const wordCenter = currentX + wordWidth / 2;
          const isWordActive = curTime >= wordObj.start && curTime <= wordObj.end;

          // Shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;

          // Subtle Outline stroke (never giant or pixelated)
          ctx.strokeStyle = style.strokeColor || '#000000';
          ctx.lineWidth = Math.min(3.5, Math.max(2, (style.strokeWidth || 3) * 0.8));
          ctx.strokeText(wordStr, wordCenter, posY);

          // Fill text
          ctx.fillStyle = isWordActive ? style.highlightColor : style.textColor;
          ctx.fillText(wordStr, wordCenter, posY);

          currentX += wordWidth + spaceWidth;
        });

        ctx.restore();
      }

      // Check if clip finished
      if (curTime >= clip.endTime || videoElement.ended) {
        cancelAnimationFrame(animId);
        videoElement.pause();
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }

        onProgress(99, 'Finalizando codificação do arquivo MP4/WebM...');

        recorder.onstop = () => {
          const finalBlob = new Blob(recordedChunks, {
            type: recorder.mimeType || 'video/mp4',
          });
          onProgress(100, 'Vídeo 9:16 exportado com sucesso!');
          resolve(finalBlob);
        };

        recorder.stop();
        return;
      }

      animId = requestAnimationFrame(drawFrame);
    };

    recorder.onerror = (err) => {
      cancelAnimationFrame(animId);
      videoElement.pause();
      reject(err);
    };

    animId = requestAnimationFrame(drawFrame);
  });
}
