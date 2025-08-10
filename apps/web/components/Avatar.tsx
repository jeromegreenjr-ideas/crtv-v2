"use client";
import React from 'react';

export function Avatar({ name, url, size = 28 }: { name?: string; url?: string; size?: number }) {
  const initials = (name || '').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase() || 'U';
  return (
    <div
      className="rounded-full bg-gray-200 text-gray-700 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
      aria-label={name || 'User'}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-medium">{initials}</span>
      )}
    </div>
  );
}


