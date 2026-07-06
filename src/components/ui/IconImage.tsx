'use client';

import Image from "next/image";
import { useState } from "react";
import emojiMappingData from "@/data/emoji_mapping.json";

interface IconImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  unoptimized?: boolean;
}

const emojiMapping = emojiMappingData as Record<string, { color: string; emoji: string }>;

export default function IconImage({ src, alt, className = "", fill, width, height, priority, sizes, referrerPolicy, unoptimized = false }: IconImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src) {
    return <span className="text-4xl">🐘</span>;
  }

  const mapping = emojiMapping[src];

  if (mapping) {
    const style: React.CSSProperties = {
      backgroundColor: mapping.color,
      containerType: "size",
    };

    if (!fill) {
      style.width = "100%";
      style.maxWidth = width ? `${width}px` : undefined;
      style.height = "100%";
      style.maxHeight = height ? `${height}px` : undefined;
      style.aspectRatio = width && height ? `${width} / ${height}` : "1 / 1";
    }

    return (
      <div
        className={`flex items-center justify-center shrink min-h-0 ${fill ? "absolute inset-0" : ""} ${className}`}
        style={style}
      >
        <span style={{ fontSize: "55cqmin", opacity: 0.95 }}>{mapping.emoji}</span>
      </div>
    );
  }

  const imageElement = (
    <Image
      src={src}
      alt={alt}
      className={`${className} ${priority ? '' : 'transition-opacity duration-300 ease-out'} z-10 ${!fill ? 'w-full h-full object-contain' : ''}`}
      style={{ opacity: priority || isLoaded ? undefined : 0 }}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      sizes={sizes || (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
      referrerPolicy={referrerPolicy}
      unoptimized={unoptimized}
      onLoad={() => setIsLoaded(true)}
    />
  );

  const skeletonElement = (
    <div
      className={`absolute inset-0 bg-slate-100 transition-opacity duration-300 z-0 rounded-[inherit] pointer-events-none ${isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'}`}
      aria-hidden="true"
    />
  );

  if (fill) {
    return (
      <>
        {skeletonElement}
        {imageElement}
      </>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden shrink min-h-0 w-full"
      style={{
        maxWidth: width ? `${width}px` : "100%",
        maxHeight: height ? `${height}px` : "100%",
        aspectRatio: width && height ? `${width} / ${height}` : undefined
      }}
    >
      {skeletonElement}
      {imageElement}
    </div>
  );
}