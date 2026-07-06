export function PathDesktopSkeleton() {
  return (
    <div className="flex flex-row w-full items-start relative min-h-screen">
      <div className="flex-1 flex justify-center w-full pt-8 pb-32 px-6 lg:px-8 pr-8 xl:pr-12">
        <div className="flex flex-col gap-10 w-full max-w-4xl">
          <div className="flex flex-col gap-8 w-full">
            <div className="p-8 md:p-10 bg-slate-200 border-b-[6px] border-slate-300 rounded-3xl h-[300px] w-full flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-64 h-10 bg-slate-300 rounded-lg animate-pulse mb-4" />
                <div className="w-96 h-6 bg-slate-300 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col relative w-full pl-6 md:pl-10 mt-4 pb-32">
              <div className="absolute left-[calc(3.5rem-5px)] md:left-[calc(5rem-5px)] top-[5rem] bottom-[8rem] w-[10px] bg-slate-200 rounded-full z-0 animate-pulse"></div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="relative flex items-center w-full z-10 gap-6 md:gap-8 min-h-[8.5rem] py-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white border-2 border-slate-200 border-b-[6px] flex items-center justify-center"></div>
                  <div className="flex-1 rounded-[1.5rem] border-2 border-slate-100 h-[8.5rem] bg-white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
