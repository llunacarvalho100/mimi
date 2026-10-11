import { MediaEmbed } from '../types';

export function parseMediaUrl(inputUrl: string): MediaEmbed | null {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const url = inputUrl.trim();

  // Video embed parser
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const embedId = ytMatch[1];
    return {
      type: 'youtube',
      url,
      embedId,
      title: 'Vídeo / Clipe Compartilhado',
      artistOrChannel: 'Canal de Vídeo',
      thumbnail: `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`,
    };
  }

  // Audio stream parser
  const spotifyMatch = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    const kind = spotifyMatch[1];
    const id = spotifyMatch[2];
    return {
      type: 'spotify',
      url,
      embedId: `${kind}/${id}`,
      title: 'Música / Álbum Compartilhado',
      artistOrChannel: 'Faixa de Áudio',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    };
  }

  // Audio files (.mp3, .wav, .ogg, .m4a)
  if (url.match(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i)) {
    const fileName = url.split('/').pop()?.split('?')[0] || 'Áudio Compartilhado';
    return {
      type: 'audio',
      url,
      title: decodeURIComponent(fileName),
      artistOrChannel: 'Arquivo de Áudio',
      audioDuration: '3:45',
    };
  }

  // Generic music / video link
  return {
    type: 'link',
    url,
    title: 'Mídia / Conteúdo Interativo',
    artistOrChannel: new URL(url.startsWith('http') ? url : `https://${url}`).hostname,
  };
}

export const SAMPLE_SONGS: MediaEmbed[] = [
  {
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedId: 'jfKfPfyJRdk',
    title: 'Melodias Acústicas & Lo-fi para Leitura',
    artistOrChannel: 'Trilha Criativa',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
  },
  {
    type: 'audio',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_sound/engine_start.mp3',
    title: 'Acústico Nostálgico • Violão',
    artistOrChannel: 'Gravação Pessoal',
  },
];
