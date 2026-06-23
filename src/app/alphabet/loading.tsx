export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] w-full flex flex-col md:flex-row items-start pt-[3.75rem] md:pt-8 px-0 md:px-8">
      
      {/* Mobile Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 h-[3.75rem] bg-[#FAFAFA]/95 border-b border-slate-200 md:hidden z-50 flex items-center justify-between px-4">
         <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-slate-200 rounded-xl animate-pulse" />
           <div className="w-32 h-6 bg-slate-200 rounded-md animate-pulse" />
         </div>
         <div className="flex items-center gap-2">
           <div className="w-16 h-9 bg-slate-200 rounded-full animate-pulse hidden sm:block" />
           <div className="w-9 h-9 bg-slate-200 rounded-xl animate-pulse" />
           <div className="w-9 h-9 bg-slate-200 rounded-xl animate-pulse" />
         </div>
      </div>

      {/* Mobile Timeline Skeleton */}
      <div className="md:hidden flex flex-col w-full px-4 mt-2">
        {/* Hero Card Mobile */}
        <div className="w-full h-[180px] bg-slate-200 rounded-2xl animate-pulse mb-6" />
        
        <div className="flex flex-col relative w-full pb-20 mt-8">
          <div className="absolute left-[1.25rem] sm:left-[1.5rem] top-0 bottom-0 w-[8px] -translate-x-1/2 bg-slate-200 rounded-full z-0 animate-pulse"></div>
          
          {[...Array(5)].map((_, i) => (
            <div key={i} className="relative flex flex-row items-center w-full z-10 mb-6 sm:mb-8 gap-3 sm:gap-4">
              <div className="relative shrink-0 z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 animate-pulse border-[4px] border-white shadow-sm" />
              </div>
              <div className="flex-1 rounded-[1.5rem] border-2 border-slate-100 p-4 sm:p-5 bg-white min-h-[8.5rem] flex flex-col justify-between z-10 shadow-sm">
                 <div className="flex flex-col gap-3 w-full max-w-[200px]">
                    <div className="w-32 h-6 bg-slate-200 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
                 </div>
                 <div className="w-full mt-4 flex flex-col gap-2">
                    <div className="flex justify-between w-full">
                       <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
                       <div className="w-8 h-3 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="flex justify-between gap-[2px] w-full">
                       {Array.from({ length: 4 }).map((_, j) => (
                         <div key={j} className="h-3 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full bg-slate-100 animate-pulse"></div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Timeline Skeleton (Desktop) */}
      <div className="hidden md:flex flex-1 justify-center w-full pt-8 pb-32 px-6 lg:px-8 pr-8 xl:pr-12">
        <div className="flex flex-col gap-10 w-full max-w-4xl">
           <div className="flex flex-col gap-8 w-full">
              {/* Header hero */}
              <div className="p-8 md:p-10 bg-slate-200 border-b-[6px] border-slate-300 rounded-3xl h-[280px] w-full flex flex-col justify-between overflow-hidden relative">
                 <div className="relative z-10">
                   <div className="w-64 h-10 bg-slate-300 rounded-lg animate-pulse mb-4" />
                   <div className="w-96 h-6 bg-slate-300 rounded-md animate-pulse" />
                 </div>
                 <div className="w-full mt-auto relative z-10">
                   <div className="flex justify-between w-full mb-3">
                      <div className="w-24 h-4 bg-slate-300 rounded animate-pulse" />
                      <div className="w-32 h-4 bg-slate-300 rounded animate-pulse" />
                   </div>
                   <div className="w-full h-4 bg-slate-300 rounded-full animate-pulse" />
                 </div>
              </div>

              <div className="flex flex-col relative w-full pl-6 md:pl-10 mt-4 pb-32">
                 <div className="absolute left-[3.25rem] md:left-[4.25rem] top-[5rem] bottom-[8rem] w-2.5 bg-slate-200 rounded-full z-0 animate-pulse"></div>

                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="relative flex items-center w-full z-10 gap-6 md:gap-8 min-h-[8.5rem] py-3">
                     <div className="relative shrink-0 py-6 z-10">
                       <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white border-2 border-slate-200 border-b-[6px] flex items-center justify-center">
                         <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                       </div>
                     </div>
                     <div className="flex-1 rounded-[1.5rem] border-2 border-slate-100 p-5 md:p-6 bg-white h-[8.5rem] flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shadow-sm">
                       <div className="flex flex-col items-start w-full max-w-[200px] gap-3">
                          <div className="w-32 h-6 bg-slate-200 rounded animate-pulse" />
                          <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
                       </div>
                       <div className="w-full md:w-48 shrink-0 mt-4 md:mt-0 flex flex-col justify-center gap-2">
                          <div className="flex justify-between w-full">
                            <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
                            <div className="w-8 h-3 bg-slate-200 rounded animate-pulse" />
                          </div>
                          <div className="flex justify-between gap-[2px] w-full">
                            {Array.from({ length: 4 }).map((_, j) => (
                              <div key={j} className="h-3 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full bg-slate-100 animate-pulse"></div>
                            ))}
                          </div>
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Desktop Sidebar Right Skeleton */}
      <div className="hidden xl:flex w-80 shrink-0 flex-col gap-6 sticky top-8">
         {/* Unités du Cours Skeleton */}
         <div className="w-full h-[72px] bg-white border-2 border-slate-100 rounded-2xl flex items-center px-4 gap-4">
           <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
           <div className="flex flex-col gap-2 flex-1">
             <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
             <div className="w-32 h-3 bg-slate-200 rounded animate-pulse" />
           </div>
         </div>
         
         {/* Quêtes journalières Skeleton */}
         <div className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
             <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
           </div>
           {[1, 2, 3].map(i => (
             <div key={i} className="w-full h-[60px] bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
           ))}
         </div>

         {/* Objectif d'histoire Skeleton */}
         <div className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
             <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
           </div>
           <div className="w-40 h-4 bg-slate-200 rounded animate-pulse mb-2" />
           <div className="w-full h-[80px] bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
           <div className="w-full h-12 bg-slate-200 rounded-xl animate-pulse mt-2" />
         </div>
      </div>
      
    </div>
  );
}
