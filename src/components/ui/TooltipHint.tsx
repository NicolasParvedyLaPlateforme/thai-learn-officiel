import React, { useState, useRef, useEffect } from 'react';

// A simple component to render tooltips with tap support for mobile
export function TooltipHint({ children, tooltipContent, className = '', audioText, tooltipPosition = 'top' }: { children: React.ReactNode, tooltipContent: React.ReactNode, className?: string, audioText?: string, tooltipPosition?: 'top' | 'bottom' }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<'center' | 'left' | 'right'>('center');

  const onOpen = () => {
    setIsOpen(true);
  };

  const handleTap = () => {
    onOpen();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isOpen || !spanRef.current) return;

    if (window.innerWidth >= 768) {
      timer = setTimeout(() => setPosition('center'), 0);
      return;
    }

    const rect = spanRef.current.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const threshold = window.innerWidth * 0.4;

    timer = setTimeout(() => {
      if (center < threshold) {
        setPosition('left');
      } else if (center > window.innerWidth - threshold) {
        setPosition('right');
      } else {
        setPosition('center');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <span 
      ref={spanRef}
      className={`relative cursor-help ${className}`} 
      onClick={handleTap}
      onMouseEnter={onOpen}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      {isOpen && (
        <div 
          className={`absolute ${tooltipPosition === 'top' ? 'bottom-full mb-1' : 'top-full -mt-4'} bg-white text-slate-800 px-3 py-2 rounded-xl text-sm whitespace-nowrap z-[120] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200
            ${position === 'left' ? 'left-0' : position === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'}
          `}
        >
          <div className="relative z-10 flex items-center gap-2">
            {tooltipContent}
          </div>
          <div 
            className={`absolute ${tooltipPosition === 'top' ? 'top-[100%] border-b border-r' : 'bottom-[100%] border-t border-l'} w-3 h-3 ${tooltipPosition === 'top' ? '-mt-1.5' : '-mb-1.5'} bg-white border-slate-200 rotate-45 rounded-sm z-0
             ${position === 'left' ? 'left-6' : position === 'right' ? 'right-6' : 'left-1/2 -translate-x-1/2'}
            `}
          ></div>
        </div>
      )}
    </span>
  );
}
