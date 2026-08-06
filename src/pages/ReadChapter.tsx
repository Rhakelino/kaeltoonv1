import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Menu, Home, Loader2 } from "lucide-react"
import { Link, useParams, useSearchParams, useLocation } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { comicApi } from "@/services/api"

export default function ReadChapter() {
  const { chapterId } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const mangaId = searchParams.get('manga')
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const [showNav, setShowNav] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [chapterList, setChapterList] = useState<any[]>([])
  const [navChapters, setNavChapters] = useState<{prev: string | null, next: string | null}>({prev: null, next: null})
  const [mangaTitle, setMangaTitle] = useState<string>((location.state as { mangaTitle?: string })?.mangaTitle || "")
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>("")

  useEffect(() => {
    const fetchMangaDetail = async () => {
      if (!mangaId) return;
      if (!mangaTitle) {
        try {
          const detail = await comicApi.getDetail(mangaId);
          if (detail?.title) {
            setMangaTitle(detail.title);
          }
        } catch (err) {}
      }
    };
    fetchMangaDetail();
  }, [mangaId, mangaTitle]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!mangaId) return;
      try {
        // Fetch page 1 to get total pages
        const res = await comicApi.getChapterList(mangaId, 1);
        if (res.data) {
          let allChapters = [...res.data];
          const totalPages = res.pagination?.total_pages || 1;
          
          if (totalPages > 1) {
            // Fetch remaining pages in parallel
            const promises = [];
            for (let i = 2; i <= totalPages; i++) {
              promises.push(comicApi.getChapterList(mangaId, i));
            }
            const results = await Promise.all(promises);
            results.forEach(r => {
              if (r.data) allChapters = allChapters.concat(r.data);
            });
          }
          setChapterList(allChapters);
        }
      } catch (err) {}
    };
    fetchChapters();
  }, [mangaId]);

  useEffect(() => {
    if (chapterList.length > 0 && chapterId) {
      const idx = chapterList.findIndex(c => c.id === chapterId);
      if (idx !== -1) {
        const cur = chapterList[idx];
        const titleText = cur.title || (cur.chapter_number ? `Chapter ${cur.chapter_number}` : "");
        setCurrentChapterTitle(titleText);
        setNavChapters({
          next: idx > 0 ? chapterList[idx - 1].id : null, // index 0 is latest
          prev: idx < chapterList.length - 1 ? chapterList[idx + 1].id : null
        });
      }
    }
  }, [chapterList, chapterId]);

  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterId) return;
      setLoading(true);
      if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
      try {
        const responseData = await comicApi.readChapter(chapterId);
        // The API returns the images array directly or inside the data wrapper
        const imgArray = Array.isArray(responseData) ? responseData : responseData?.data || responseData?.images || [];
        // Extract raw array if the inner Sanka format contains images
        const finalImages = Array.isArray(imgArray) ? imgArray : (imgArray?.images || []);
        
        setImages(finalImages);
        
        // Save to history
        if (mangaId) {
           const historyStr = localStorage.getItem('manga_history');
           const history = historyStr ? JSON.parse(historyStr) : [];
           
            const state = location.state as { mangaTitle?: string, mangaCover?: string } | null;
            
            const newHistory = history.filter((h: any) => h.manga_id !== mangaId);
            newHistory.unshift({
               manga_id: mangaId,
               title: state?.mangaTitle || `Chapter ${chapterId}`,
               cover: state?.mangaCover || imgArray[0] || '',
               chapter_id: chapterId,
               chapter_title: `Chapter ${chapterId}`, // The new API doesn't seem to return chapter title in the /read endpoint
               read_at: Date.now()
            });
           localStorage.setItem('manga_history', JSON.stringify(newHistory.slice(0, 50))); // Keep last 50
        }
      } catch (error) {
        console.error("Failed to fetch chapter images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId, mangaId, location.state]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Top Navbar */}
      <div 
        className={`bg-card/95 backdrop-blur border-b h-14 flex items-center justify-between px-2 md:px-4 shrink-0 transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={mangaId ? `/manga/${mangaId}` : "/"} className="flex items-center justify-center">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{mangaTitle || "Manga Reader"}</span>
            {currentChapterTitle && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-md">{currentChapterTitle}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" className="flex items-center justify-center">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
          {mangaId && (
             <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
               <Link to={`/manga/${mangaId}`} className="flex items-center">
                  <Menu className="h-4 w-4 mr-2" /> Chapter List
               </Link>
             </Button>
          )}
        </div>
      </div>

      {/* Reader Area */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-black w-full overflow-y-auto relative"
        onClick={() => setShowNav(!showNav)}
      >
        <div className="max-w-[800px] mx-auto w-full flex flex-col items-center min-h-full pb-20">
          {loading && (
             <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                <p className="font-medium animate-pulse">Loading chapter...</p>
             </div>
          )}
          
          {!loading && images.length > 0 ? (
             images.map((src, i) => (
               <div key={i} className="w-full relative min-h-[300px] flex items-center justify-center bg-muted/20">
                  <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
                  </div>
                  <img 
                    src={src} 
                    alt={`Page ${i + 1}`} 
                    loading="lazy"
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).parentElement?.classList.remove('min-h-[300px]', 'bg-muted/20');
                      (e.target as HTMLImageElement).previousElementSibling?.remove();
                    }}
                    className="w-full h-auto block select-none pointer-events-none" 
                  />
               </div>
             ))
          ) : !loading ? (
             <div className="flex items-center justify-center flex-1 h-[80vh] text-muted-foreground">
                Failed to load images.
             </div>
          ) : null}

          {/* Bottom Navigation inside scroll */}
          {!loading && images.length > 0 && (
             <div className="w-full p-4 flex gap-4 justify-between items-center mt-8" onClick={(e) => e.stopPropagation()}>
               <Button variant="secondary" className="flex-1 max-w-xs" disabled={!navChapters.prev} asChild>
                 <Link to={navChapters.prev ? `/read/${navChapters.prev}?manga=${mangaId}` : "#"} state={location.state} className="flex items-center justify-center">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Prev Chapter
                 </Link>
               </Button>
               <Button className="flex-1 max-w-xs" disabled={!navChapters.next} asChild>
                 <Link to={navChapters.next ? `/read/${navChapters.next}?manga=${mangaId}` : "#"} state={location.state} className="flex items-center justify-center">
                  Next Chapter <ChevronRight className="h-4 w-4 ml-2" />
                 </Link>
               </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Mobile & Desktop Navigation (Sticky) */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t p-2 md:px-6 flex justify-between md:justify-center gap-2 md:gap-4 transition-transform duration-300 z-50 ${showNav ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <Button variant="outline" className="flex-1 md:flex-none md:w-48 h-12" disabled={!navChapters.prev} asChild>
          <Link to={navChapters.prev ? `/read/${navChapters.prev}?manga=${mangaId}` : "#"} state={location.state} className="flex items-center justify-center">
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Link>
        </Button>
        {mangaId ? (
          <Button variant="secondary" className="md:hidden flex-none w-12 h-12 p-0" asChild>
            <Link to={`/manga/${mangaId}`} className="flex items-center justify-center">
              <Menu className="h-5 w-5" />
            </Link>
          </Button>
        ) : (
           <Button variant="secondary" className="md:hidden flex-none w-12 h-12 p-0" disabled>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Button className="flex-1 md:flex-none md:w-48 h-12" disabled={!navChapters.next} asChild>
          <Link to={navChapters.next ? `/read/${navChapters.next}?manga=${mangaId}` : "#"} state={location.state} className="flex items-center justify-center">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
