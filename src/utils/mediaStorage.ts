import { getSafeGeminiApiKey } from '../security/keysConfig';

// Media storage using browser IndexedDB for photos and videos (0 Tokens Cost)
const DB_NAME = 'melin_media_db';
const STORE_NAME = 'files_store';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB não suportado'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredMedia {
  id: string;
  name: string;
  type: 'image' | 'video';
  mimeType: string;
  dataUrl: string;
  sizeFormatted: string;
  createdAt: number;
}

export async function saveMediaFile(file: File): Promise<StoredMedia> {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (!isImage && !isVideo) {
    throw new Error('Formato não suportado. Envie uma foto ou vídeo.');
  }

  // Convert to DataURL for persistence and immediate rendering
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const sizeKb = (file.size / 1024).toFixed(1);
  const sizeFormatted = file.size > 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${sizeKb} KB`;

  const item: StoredMedia = {
    id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: file.name,
    type: isVideo ? 'video' : 'image',
    mimeType: file.type,
    dataUrl,
    sizeFormatted,
    createdAt: Date.now(),
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(item);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (err) {
    console.warn('Erro ao persistir no IndexedDB, mantendo em memória:', err);
  }

  return item;
}

export const DEFAULT_AVATAR_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

export const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=80';

export interface AvatarProcessingResult {
  dataUrl: string;
  type: 'image' | 'video';
  duration?: number;
  originalDuration?: number;
  originalSizeFormatted: string;
  sizeFormatted: string;
  reductionPercent: number;
  isClampedTo5s: boolean;
  resolution: string;
  infoMessage: string;
}

export interface CoverProcessingResult {
  dataUrl: string;
  type: 'image';
  originalSizeFormatted: string;
  sizeFormatted: string;
  reductionPercent: number;
}

/**
 * Process avatar media:
 * - Recognizes format, duration, dimensions and file size.
 * - For videos: clamps strictly to 5 seconds maximum, strips all audio, downscales
 *   to 200x200 square avatar canvas, suppresses bitrate to minimize storage.
 * - For images: crops to square avatar (280x280) and compresses to lightweight JPEG.
 */
export async function processAvatarMedia(file: File): Promise<AvatarProcessingResult> {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (!isImage && !isVideo) {
    throw new Error('Envie um arquivo de imagem ou vídeo compatível (JPG, PNG, MP4, WebM, MOV).');
  }

  const originalSizeBytes = file.size;
  const originalSizeFormatted =
    originalSizeBytes > 1024 * 1024
      ? `${(originalSizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(originalSizeBytes / 1024).toFixed(0)} KB`;

  // === 1. VIDEO AVATAR PROCESSING (MAX 5 SECONDS, STRIP AUDIO & HEAVY METADATA) ===
  if (isVideo) {
    const objectUrl = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = objectUrl;

      video.onloadedmetadata = async () => {
        const originalDuration = video.duration || 5;
        const clampedDuration = Math.min(5, Number(originalDuration.toFixed(1)));
        const isClamped = originalDuration > 5.05;
        const originalWidth = video.videoWidth || 640;
        const originalHeight = video.videoHeight || 480;

        // Canvas for avatar resolution (200x200 square)
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          // Fallback if canvas context fails
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              dataUrl: reader.result as string,
              type: 'video',
              duration: clampedDuration,
              originalDuration,
              originalSizeFormatted,
              sizeFormatted: originalSizeFormatted,
              reductionPercent: 0,
              isClampedTo5s: isClamped,
              resolution: `${originalWidth}x${originalHeight}`,
              infoMessage: `Vídeo de perfil (${clampedDuration}s).`,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
          return;
        }

        // Try compressing with MediaRecorder from canvas stream to achieve maximum data reduction
        try {
          const stream = canvas.captureStream(14); // 14 FPS is smooth for avatar loops while suppressing file size
          const mimeType =
            typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
              ? 'video/webm;codecs=vp8'
              : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm')
              ? 'video/webm'
              : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/mp4')
              ? 'video/mp4'
              : '';

          if (mimeType && typeof MediaRecorder !== 'undefined') {
            const recorder = new MediaRecorder(stream, {
              mimeType,
              videoBitsPerSecond: 200000, // 200 kbps (ultra lightweight)
            });

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) chunks.push(e.data);
            };

            const recordingFinished = new Promise<Blob>((res) => {
              recorder.onstop = () => {
                res(new Blob(chunks, { type: mimeType }));
              };
            });

            recorder.start();

            // Play video and draw frames to square canvas
            video.currentTime = 0;
            await video.play().catch(() => {});

            const startTime = performance.now();
            const targetDurationMs = clampedDuration * 1000;

            const drawLoop = () => {
              const elapsed = performance.now() - startTime;

              // Center crop calculation
              const vw = video.videoWidth || originalWidth;
              const vh = video.videoHeight || originalHeight;
              const size = Math.min(vw, vh);
              const sx = (vw - size) / 2;
              const sy = (vh - size) / 2;

              ctx.drawImage(video, sx, sy, size, size, 0, 0, 200, 200);

              if (elapsed < targetDurationMs && !video.ended) {
                requestAnimationFrame(drawLoop);
              } else {
                video.pause();
                recorder.stop();
              }
            };

            drawLoop();

            const compressedBlob = await recordingFinished;
            URL.revokeObjectURL(objectUrl);

            const reader = new FileReader();
            reader.onload = () => {
              const resultDataUrl = reader.result as string;
              const finalSizeBytes = compressedBlob.size;
              const finalSizeFormatted =
                finalSizeBytes > 1024 * 1024
                  ? `${(finalSizeBytes / (1024 * 1024)).toFixed(1)} MB`
                  : `${(finalSizeBytes / 1024).toFixed(0)} KB`;
              const reduction = Math.max(
                0,
                Math.round(((originalSizeBytes - finalSizeBytes) / originalSizeBytes) * 100)
              );

              resolve({
                dataUrl: resultDataUrl,
                type: 'video',
                duration: clampedDuration,
                originalDuration,
                originalSizeFormatted,
                sizeFormatted: finalSizeFormatted,
                reductionPercent: reduction,
                isClampedTo5s: isClamped,
                resolution: '200x200 (avatar otimizado)',
                infoMessage: isClamped
                  ? `Vídeo reprimido para ${clampedDuration}s. Áudio removido e comprimido com ${reduction}% de economia.`
                  : `Vídeo em loop de ${clampedDuration}s. Áudio removido e comprimido com ${reduction}% de economia.`,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(compressedBlob);
            return;
          }
        } catch (recorderError) {
          console.warn('Compressor MediaRecorder indisponível, usando fallback leve:', recorderError);
        }

        // Fallback: Read video file with duration clamp info
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            dataUrl: reader.result as string,
            type: 'video',
            duration: clampedDuration,
            originalDuration,
            originalSizeFormatted,
            sizeFormatted: originalSizeFormatted,
            reductionPercent: 0,
            isClampedTo5s: isClamped,
            resolution: `${originalWidth}x${originalHeight}`,
            infoMessage: isClamped
              ? `Vídeo reconhecido (${originalDuration.toFixed(1)}s) e ajustado para reproduzir em loop de 5s.`
              : `Vídeo de ${clampedDuration}s salvo como avatar em movimento.`,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Não foi possível ler o arquivo de vídeo. Verifique o formato.'));
      };
    });
  }

  // === 2. IMAGE AVATAR PROCESSING (SQUARE CROP & HIGH-RATIO COMPRESSION) ===
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetDim = 280; // High-DPI square avatar
        canvas.width = targetDim;
        canvas.height = targetDim;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            dataUrl: e.target?.result as string,
            type: 'image',
            originalSizeFormatted,
            sizeFormatted: originalSizeFormatted,
            reductionPercent: 0,
            isClampedTo5s: false,
            resolution: `${img.width}x${img.height}`,
            infoMessage: 'Foto carregada.',
          });
          return;
        }

        // Center crop to perfect square
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetDim, targetDim);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        const finalSizeBytes = Math.round((dataUrl.length * 3) / 4);
        const finalSizeFormatted = `${(finalSizeBytes / 1024).toFixed(0)} KB`;
        const reduction = Math.max(
          0,
          Math.round(((originalSizeBytes - finalSizeBytes) / originalSizeBytes) * 100)
        );

        resolve({
          dataUrl,
          type: 'image',
          originalSizeFormatted,
          sizeFormatted: finalSizeFormatted,
          reductionPercent: reduction,
          isClampedTo5s: false,
          resolution: '280x280 (perfil)',
          infoMessage: `Foto comprimida para ${finalSizeFormatted} (${reduction}% mais leve).`,
        });
      };
      img.onerror = () => reject(new Error('Erro ao processar imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Process cover image with banner ratio scaling and compression
 */
export async function processCoverMedia(file: File): Promise<CoverProcessingResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Envie uma imagem para a capa (JPG, PNG, WebP).');
  }

  const originalSizeBytes = file.size;
  const originalSizeFormatted =
    originalSizeBytes > 1024 * 1024
      ? `${(originalSizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(originalSizeBytes / 1024).toFixed(0)} KB`;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        let w = img.width;
        let h = img.height;

        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            dataUrl: e.target?.result as string,
            type: 'image',
            originalSizeFormatted,
            sizeFormatted: originalSizeFormatted,
            reductionPercent: 0,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

        const finalSizeBytes = Math.round((dataUrl.length * 3) / 4);
        const finalSizeFormatted = `${(finalSizeBytes / 1024).toFixed(0)} KB`;
        const reduction = Math.max(
          0,
          Math.round(((originalSizeBytes - finalSizeBytes) / originalSizeBytes) * 100)
        );

        resolve({
          dataUrl,
          type: 'image',
          originalSizeFormatted,
          sizeFormatted: finalSizeFormatted,
          reductionPercent: reduction,
        });
      };
      img.onerror = () => reject(new Error('Erro ao processar capa.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// AI Caption Generation - ONLY executed upon explicit user command to conserve tokens
export async function generateAiCaption(options: {
  mediaType: 'image' | 'video';
  contextTitle?: string;
  tags?: string;
}): Promise<string> {
  // Retrieve key via isolated security module
  const apiKey = getSafeGeminiApiKey();

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Escreva uma legenda poética, curta e estética em português para uma postagem de rede social com ${
        options.mediaType === 'video' ? 'vídeo' : 'foto'
      }. Tema: "${options.contextTitle || 'momentos especiais e memórias'}". Tags: "${options.tags || 'afeto, cotidiano'}". Seja sutil, sem clichês, no estilo de microblog reflexivo.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Erro ao chamar Gemini API:', err);
    }
  }

  // Fallback aesthetic suggestions if API key is not configured or offline
  const suggestions = options.mediaType === 'video'
    ? [
        'Pequenos instantes que ganham vida quando a gente aperta o play 🎞️✨',
        'O movimento sutil das horas boas que passam sem pressa.',
        'Gravando memórias que o tempo não apaga. Um pedaço bom do dia.',
      ]
    : [
        'A luz certa no momento exato. Guardando esse detalhe no coração 🌸',
        'Dias bonitos não precisam de grandes motivos, apenas de atenção.',
        'Colecionando pequenos recortes de paz no meio da rotina.',
      ];

  return suggestions[Math.floor(Math.random() * suggestions.length)];
}
