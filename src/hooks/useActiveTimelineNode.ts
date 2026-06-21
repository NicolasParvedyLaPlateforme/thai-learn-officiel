import { useState, useEffect } from 'react';

export function useActiveTimelineNode(initialId: string | null = null, nodeSelector: string = '.group\\/node') {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(initialId);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const nodes = document.querySelectorAll(nodeSelector);
          let closestId: string | null = null;
          let minDistance = Infinity;
          const centerY = window.innerHeight * 0.45;

          nodes.forEach(node => {
            const rect = node.getBoundingClientRect();
            const nodeCenter = rect.top + rect.height / 2;
            const distance = Math.abs(centerY - nodeCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestId = node.id.replace('desktop-lesson-', '');
            }
          });

          if (closestId) {
            setActiveNodeId(prev => prev !== closestId ? closestId : prev);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [nodeSelector]);

  return [activeNodeId, setActiveNodeId] as const;
}
