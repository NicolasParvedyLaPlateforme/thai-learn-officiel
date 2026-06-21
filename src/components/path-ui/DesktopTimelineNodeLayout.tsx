import React, { ReactNode } from 'react';

interface DesktopTimelineNodeLayoutProps {
  isLeft: boolean;
  cardContent: ReactNode;
  centerNode: ReactNode;
  imageNode?: ReactNode;
}

export function DesktopTimelineNodeLayout({
  isLeft,
  cardContent,
  centerNode,
  imageNode
}: DesktopTimelineNodeLayoutProps) {
  return (
    <>
      <div className={`w-1/2 flex ${isLeft ? 'justify-end pr-12 xl:pr-20' : 'justify-start pl-12 xl:pl-20'}`}>
        <div className="w-full max-w-[360px]">
          {cardContent}
        </div>
      </div>

      {/* Center icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        {centerNode}
      </div>

      {/* Side Image */}
      {imageNode && (
        <div className={`absolute top-1/2 -translate-y-1/2 w-1/2 flex items-center ${isLeft ? 'right-0 justify-start pl-12 xl:pl-20' : 'left-0 justify-end pr-12 xl:pr-20'} z-0`}>
           {imageNode}
        </div>
      )}
    </>
  );
}
