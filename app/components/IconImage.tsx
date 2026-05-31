import Image from "next/image";
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

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      referrerPolicy={referrerPolicy}
    />
  );
}
