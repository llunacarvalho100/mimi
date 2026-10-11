import React from 'react';

interface UserAvatarProps {
  src: string;
  type?: 'image' | 'video';
  alt?: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  type,
  alt = 'Avatar',
  className = 'w-10 h-10 rounded-full',
  fallbackIcon,
}) => {
  const isVideo =
    type === 'video' ||
    (typeof src === 'string' &&
      (src.startsWith('data:video') ||
        src.endsWith('.mp4') ||
        src.endsWith('.webm') ||
        src.includes('blob:video')));

  if (!src) {
    return (
      <div
        className={`bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 ${className}`}
      >
        {fallbackIcon || <span className="text-xs font-semibold">?</span>}
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`object-cover pointer-events-none select-none ${className}`}
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Fallback for broken links
        e.currentTarget.onerror = null;
        e.currentTarget.src =
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
      }}
    />
  );
};
