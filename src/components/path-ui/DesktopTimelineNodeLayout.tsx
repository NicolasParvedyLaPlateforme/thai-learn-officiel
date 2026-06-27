import React, { ReactNode } from 'react';

interface DesktopTimelineNodeLayoutProps {
  cardContent: ReactNode;
  centerNode: ReactNode;
  imageNode?: ReactNode;
  isImageActive?: boolean;
}

export function DesktopTimelineNodeLayout({
  cardContent,
  centerNode,
}: DesktopTimelineNodeLayoutProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      <div className="z-20 mb-6 flex justify-center w-full">
        {centerNode}
      </div>
      <div className="w-full max-w-2xl px-4 lg:px-0 z-10">
        {cardContent}
      </div>
    </div>
  );
}
