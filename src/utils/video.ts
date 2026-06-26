import type { PortfolioVideo } from './landing';

export interface ResolvedEmbed {
  kind: 'embed';
  provider: 'youtube' | 'vimeo';
  url: string; // iframe src
  title?: string;
}

export interface ResolvedFile {
  kind: 'file';
  src: string;
  poster?: string;
}

export type ResolvedVideo = ResolvedEmbed | ResolvedFile;

// Pull the 11-char video id out of any common YouTube URL shape.
function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

// Vimeo ids are numeric; unlisted videos carry a privacy hash as a second segment.
function vimeoRef(url: string): { id: string; hash?: string } | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
  return m ? { id: m[1], hash: m[2] } : null;
}

/**
 * Normalize a portfolio video entry into either a self-hosted file or an
 * external embed. YouTube/Vimeo watch URLs are detected automatically; any
 * other `src` is treated as a local <video> file.
 */
export function resolveVideo(v: PortfolioVideo): ResolvedVideo {
  const src = typeof v === 'string' ? v : v.src;
  const poster = typeof v === 'object' && v ? v.poster : undefined;
  const title = typeof v === 'object' && v ? v.title : undefined;

  const yt = youTubeId(src);
  if (yt) {
    return { kind: 'embed', provider: 'youtube', title, url: `https://www.youtube-nocookie.com/embed/${yt}` };
  }

  const vimeo = vimeoRef(src);
  if (vimeo) {
    const query = vimeo.hash ? `?h=${vimeo.hash}` : '';
    return { kind: 'embed', provider: 'vimeo', title, url: `https://player.vimeo.com/video/${vimeo.id}${query}` };
  }

  return { kind: 'file', src, poster };
}
