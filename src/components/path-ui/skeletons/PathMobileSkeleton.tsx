export function PathMobileSkeleton() {
  return (
    <div className="md:hidden flex flex-col items-center w-full px-4 mt-2">
      <div className="w-full h-[180px] bg-slate-200 rounded-2xl animate-pulse mb-6" />
      <div className="flex flex-col relative w-full items-center mt-8 pb-20">
        <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 bg-slate-200 rounded-full z-0 animate-pulse"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="relative flex flex-col items-center w-full z-10 mb-8 sm:mb-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 animate-pulse mb-4 border-[6px] border-[#FAFAFA]" />
            <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-[1.5rem] h-32 bg-slate-200 animate-pulse border-2 border-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
