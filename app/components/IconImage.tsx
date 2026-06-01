'use client';

import Image from "next/image";
import { useState } from "react";
import emojiMappingData from "../data/emoji_mapping.json";

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
}

const emojiMapping = emojiMappingData as Record<string, { color: string; emoji: string }>;

export default function IconImage({ src, alt, className = "", fill, width, height, priority, sizes, referrerPolicy }: IconImageProps) {
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
      style.width = width ? `${width}px` : "100%";
      style.height = height ? `${height}px` : "100%";
      style.aspectRatio = "1 / 1";
    }

    return (
      <div
        className={`flex items-center justify-center ${fill ? "absolute inset-0" : ""
          } ${className}`}
        style={style}
      >
        <span style={{ fontSize: "65cqmin" }}>{mapping.emoji}</span>
      </div>
    );
  }

  const imageElement = (
    <Image
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300 ease-out z-10`}
      style={{ opacity: isLoaded ? undefined : 0 }}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes || (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
      referrerPolicy={referrerPolicy}
      onLoad={() => setIsLoaded(true)}
    />
  );

  const skeletonElement = (
    <div 
      className={`absolute inset-0 bg-slate-200 transition-opacity duration-300 z-0 rounded-[inherit] pointer-events-none ${isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'}`} 
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
    <div className={`relative flex items-center justify-center overflow-hidden`} style={{ width: width ? `${width}px` : "100%", height: height ? `${height}px` : "100%" }}>
      {skeletonElement}
      {imageElement}
    </div>
  );
}
