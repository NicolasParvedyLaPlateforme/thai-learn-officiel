'use client';

import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { DetectiveLevel, DetectiveObject } from '../../types';
import Image from 'next/image';

interface Props {
  level: DetectiveLevel;
}

export default function DetectiveDevMode({ level }: Props) {
  const [objects, setObjects] = useState<DetectiveObject[]>(level.objects || []);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentCircle, setCurrentCircle] = useState<{ x: number, y: number, r: number } | null>(null);

  // For the form
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ th: '', fr: '', en: '' });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLayout, setImgLayout] = useState({ width: 100, height: 100, offsetX: 0, offsetY: 0 });
  const [layoutTrigger, setLayoutTrigger] = useState(0);

  useEffect(() => {
    if (!imgRef.current || !containerRef.current) return;

    const updateLayout = () => {
      if (!imgRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const natW = imgRef.current.naturalWidth || 1;
      const natH = imgRef.current.naturalHeight || 1;

      const containerRatio = rect.width / rect.height;
      const imgRatio = natW / natH;

      let renderedW = rect.width;
      let renderedH = rect.height;
      let offX = 0;
      let offY = 0;

      if (imgRatio > containerRatio) {
        // Image is wider, letterboxed top/bottom
        renderedH = rect.width / imgRatio;
        offY = (rect.height - renderedH) / 2;
      } else {
        renderedW = rect.height * imgRatio;
        offX = (rect.width - renderedW) / 2;
      }

      setImgLayout({ width: renderedW, height: renderedH, offsetX: offX, offsetY: offY });
    };

    updateLayout();
    const observer = new ResizeObserver(() => updateLayout());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [layoutTrigger]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editingIndex !== null) return; // Don't draw if editing
    
    // e.nativeEvent.offsetX/Y gives the exact pixel coordinate inside the overlay div
    let clickX = (e.nativeEvent as any).offsetX;
    let clickY = (e.nativeEvent as any).offsetY;
    
    // Fallback if missing
    if (clickX === undefined) {
       const rect = e.currentTarget.getBoundingClientRect();
       clickX = e.clientX - rect.left;
       clickY = e.clientY - rect.top;
    }
    
    // Convert to percentage of visual image
    const xPct = (clickX / imgLayout.width) * 100;
    const yPct = (clickY / imgLayout.height) * 100;

    setIsDrawing(true);
    setCurrentCircle({ x: xPct, y: yPct, r: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentCircle) return;
    
    let clickX = (e.nativeEvent as any).offsetX;
    let clickY = (e.nativeEvent as any).offsetY;
    
    if (clickX === undefined) {
       const rect = e.currentTarget.getBoundingClientRect();
       clickX = e.clientX - rect.left;
       clickY = e.clientY - rect.top;
    }
    
    const startXPixel = (currentCircle.x / 100) * imgLayout.width;
    const startYPixel = (currentCircle.y / 100) * imgLayout.height;
    
    const dx = clickX - startXPixel;
    const dy = clickY - startYPixel;
    const radiusPixel = Math.sqrt(dx*dx + dy*dy);
    
    const rPct = (radiusPixel / imgLayout.width) * 100;
    
    setCurrentCircle({ ...currentCircle, r: rPct });
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentCircle) return;
    setIsDrawing(false);

    if (currentCircle.r > 1) { // Minimum size to avoid accidental clicks
      setEditingIndex(-1); // -1 means new object
      setFormData({ th: '', fr: '', en: '' });
    } else {
      setCurrentCircle(null);
    }
  };

  const handleCircleClick = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    setEditingIndex(index);
    setFormData({
      th: objects[index].th,
      fr: objects[index].fr,
      en: objects[index].en
    });
    setCurrentCircle({
      x: objects[index].x,
      y: objects[index].y,
      r: objects[index].radius
    });
  };

  const saveObject = () => {
    if (!currentCircle) return;

    const newObj: DetectiveObject = {
      id: editingIndex !== null && editingIndex >= 0 ? objects[editingIndex].id : Math.random().toString(36).substr(2, 9),
      x: Number(currentCircle.x.toFixed(2)),
      y: Number(currentCircle.y.toFixed(2)),
      radius: Number(currentCircle.r.toFixed(2)),
      th: formData.th,
      fr: formData.fr,
      en: formData.en
    };

    if (editingIndex === -1) {
      setObjects([...objects, newObj]);
    } else if (editingIndex !== null) {
      const newObjects = [...objects];
      newObjects[editingIndex] = newObj;
      setObjects(newObjects);
    }

    closeModal();
  };

  const deleteObject = () => {
    if (editingIndex !== null && editingIndex >= 0) {
      const newObjects = [...objects];
      newObjects.splice(editingIndex, 1);
      setObjects(newObjects);
    }
    closeModal();
  };

  const closeModal = () => {
    setEditingIndex(null);
    setCurrentCircle(null);
    setFormData({ th: '', fr: '', en: '' });
  };

  const generateJson = () => {
    const jsonStr = JSON.stringify(objects, null, 2);
    navigator.clipboard.writeText(jsonStr);
    alert('JSON copié dans le presse-papier !');
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="bg-slate-800 text-white p-4 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="font-bold">Outil Détective</h2>
          <p className="text-sm text-slate-300">Cliquez et glissez pour créer une zone</p>
        </div>
        <button
          onClick={generateJson}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          Générer JSON
        </button>
      </div>

      <div className="w-full bg-slate-200 shadow-inner flex-1 flex items-center justify-center overflow-hidden min-h-0 rounded-xl">
        <div 
          className="relative w-full h-full flex items-center justify-center select-none"
          ref={containerRef}
        >
          {level.imageUrl ? (
            <img
              ref={imgRef}
              src={level.imageUrl}
              alt="Level"
              className="block w-full h-full pointer-events-none object-contain"
              onLoad={() => setLayoutTrigger(t => t + 1)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              Aucune image (Ajoutez l'URL dans le JSON)
            </div>
          )}

          <div 
            className="absolute"
            style={{
              left: `${imgLayout.offsetX}px`,
              top: `${imgLayout.offsetY}px`,
              width: `${imgLayout.width}px`,
              height: `${imgLayout.height}px`,
              pointerEvents: 'auto',
              cursor: 'crosshair',
              touchAction: 'none'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Existing objects */}
            {objects.map((obj, i) => (
              <div
                key={obj.id}
                className={`absolute border-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-colors cursor-pointer hover:bg-emerald-500/20 hover:z-10 ${editingIndex === i ? 'border-amber-400 bg-amber-400/20 z-20' : 'border-emerald-400'}`}
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  width: `${obj.radius * 2}%`,
                  paddingTop: `${obj.radius * 2}%`,
                  pointerEvents: 'auto', // override pointer-events-none from parent
                }}
                onMouseDown={(e) => handleCircleClick(e, i)}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white text-[10px] px-1 rounded whitespace-nowrap pointer-events-none">
                  {obj.th || '?'}
                </div>
              </div>
            ))}

            {/* Current drawing circle */}
            {isDrawing && currentCircle && (
              <div
                className="absolute border-2 border-amber-400 bg-amber-400/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${currentCircle.x}%`,
                  top: `${currentCircle.y}%`,
                  width: `${currentCircle.r * 2}%`,
                  paddingTop: `${currentCircle.r * 2}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal / Form */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              {editingIndex === -1 ? 'Nouvel objet' : 'Modifier l\'objet'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mot en Thaï</label>
                <input
                  type="text"
                  value={formData.th}
                  onChange={e => setFormData({ ...formData, th: e.target.value })}
                  className="w-full border-2 border-slate-200 rounded-lg p-2 focus:border-emerald-500 outline-none"
                  placeholder="ex: แมว"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mot en Français</label>
                <input
                  type="text"
                  value={formData.fr}
                  onChange={e => setFormData({ ...formData, fr: e.target.value })}
                  className="w-full border-2 border-slate-200 rounded-lg p-2 focus:border-emerald-500 outline-none"
                  placeholder="ex: chat"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mot en Anglais</label>
                <input
                  type="text"
                  value={formData.en}
                  onChange={e => setFormData({ ...formData, en: e.target.value })}
                  className="w-full border-2 border-slate-200 rounded-lg p-2 focus:border-emerald-500 outline-none"
                  placeholder="ex: cat"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={deleteObject}
                className="text-rose-500 font-bold px-4 py-2 hover:bg-rose-50 rounded-lg transition-colors"
              >
                Supprimer
              </button>
              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveObject}
                  className="bg-emerald-500 text-white font-bold px-4 py-2 hover:bg-emerald-600 rounded-lg transition-colors"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
