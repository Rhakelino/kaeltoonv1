import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Menu, Home, Loader2 } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { comicApi } from "@/services/api"

export default function ReadChapter() {
  const { chapterId } = useParams()
  const [searchParams] = useSearchParams()
  const mangaId = searchParams.get('manga')
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const [showNav, setShowNav] = useState(true)
  const [data, setData] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterId) return;
      setLoading(true);
      if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
      try {
        const responseData = await comicApi.readChapter(chapterId);
        setData(responseData);
        setImages(responseData?.images || []);
      } catch (error) {
        console.error("Failed to fetch chapter images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Top Navbar */}
      <div 
        className={`bg-card/95 backdrop-blur border-b h-14 flex items-center justify-between px-2 md:px-4 shrink-0 transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" render={<Link to={mangaId ? `/manga/${mangaId}` : "/"} />}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{chapterId?.replace(/-/g, ' ')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" render={<Link to="/" />}>
            <Home className="h-4 w-4" />
          </Button>
          {mangaId && (
             <Button variant="outline" size="sm" className="hidden sm:flex" render={<Link to={`/manga/${mangaId}`} />}>
                <Menu className="h-4 w-4 mr-2" /> Chapter List
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
                <img 
                  key={i} 
                  src={src} 
                  alt={`Page ${i + 1}`} 
                  loading="lazy"
                  className="w-full h-auto block select-none pointer-events-none" 
                />
             ))
          ) : !loading ? (
             <div className="flex items-center justify-center flex-1 h-[80vh] text-muted-foreground">
                Failed to load images.
             </div>
          ) : null}

          {/* Bottom Navigation inside scroll */}
          {!loading && images.length > 0 && (
             <div className="w-full p-4 flex gap-4 justify-between items-center mt-8" onClick={(e) => e.stopPropagation()}>
               <Button variant="secondary" className="flex-1 max-w-xs" disabled={!data?.prev_chapter?.chapter_id} render={<Link to={data?.prev_chapter?.chapter_id ? `/read/${data.prev_chapter.chapter_id}?manga=${mangaId}` : "#"} />}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Prev Chapter
               </Button>
               <Button className="flex-1 max-w-xs" disabled={!data?.next_chapter?.chapter_id} render={<Link to={data?.next_chapter?.chapter_id ? `/read/${data.next_chapter.chapter_id}?manga=${mangaId}` : "#"} />}>
                  Next Chapter <ChevronRight className="h-4 w-4 ml-2" />
               </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Mobile Navigation */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t p-2 flex justify-between gap-2 transition-transform duration-300 ${showNav ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <Button variant="outline" className="flex-1 h-12" disabled={!data?.prev_chapter?.chapter_id} render={<Link to={data?.prev_chapter?.chapter_id ? `/read/${data.prev_chapter.chapter_id}?manga=${mangaId}` : "#"} />}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Prev
        </Button>
        {mangaId ? (
          <Button variant="secondary" className="flex-none w-12 h-12 p-0" render={<Link to={`/manga/${mangaId}`} />}>
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
           <Button variant="secondary" className="flex-none w-12 h-12 p-0" disabled>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Button className="flex-1 h-12" disabled={!data?.next_chapter?.chapter_id} render={<Link to={data?.next_chapter?.chapter_id ? `/read/${data.next_chapter.chapter_id}?manga=${mangaId}` : "#"} />}>
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
