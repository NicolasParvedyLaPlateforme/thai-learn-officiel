export default function NextLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 animate-pulse" />
        <div className="h-4 w-32 rounded-full bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}
