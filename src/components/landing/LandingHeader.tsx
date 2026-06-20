import { BookOpen } from 'lucide-react';
import PWAInstallButton from '../ui/PWAInstallButton';
import { useEffect, useState } from 'react';

export default function LandingHeader() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-6xl mx-auto z-10 w-full">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md border-b-4 border-emerald-700">
          <BookOpen size={28} />
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-800">ThaiLearn</span>
      </div>
      <div className="flex items-center gap-2">
        {mounted && <PWAInstallButton />}
      </div>
    </header>
  );
}
