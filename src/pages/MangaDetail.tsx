import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Star, Info, ListOrdered, Loader2, ChevronDown, ChevronLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { comicApi } from "@/services/api"
import type { DetailManga } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function MangaDetail() {
  const { id } = useParams()
  const [data, setData] = useState<DetailManga | null>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingChapters, setLoadingChapters] = useState(true)
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const [firstChapterId, setFirstChapterId] = useState<string | null>(null);

  // Generate range tabs
  const pageSize = 50; // Assuming 50 per page based on generic logic or API
  
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const response = await comicApi.getDetail(id);
        setData(response);
      } catch (error) {
        console.error("Failed to fetch detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    const fetchInitialChapters = async () => {
      if (!id) return;
      setLoadingChapters(true);
      try {
        const response = await comicApi.getChapterList(id, page);
        setChapters(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.total_pages);
          
          // If we are on page 1, fetch the last page to get the true first chapter
          if (page === 1 && response.pagination.total_pages > 1) {
             const lastPageRes = await comicApi.getChapterList(id, response.pagination.total_pages);
             if (lastPageRes.data && lastPageRes.data.length > 0) {
               setFirstChapterId(lastPageRes.data[lastPageRes.data.length - 1].chapter_id);
             }
          } else if (response.data && response.data.length > 0) {
             // If only 1 page, the last item is the first chapter
             setFirstChapterId(response.data[response.data.length - 1].chapter_id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      } finally {
        setLoadingChapters(false);
      }
    }
    fetchInitialChapters()
  }, [id, page])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="w-full md:w-64 lg:w-72 h-[350px] md:h-[400px] shrink-0 rounded-lg mx-auto md:mx-0 max-w-[240px] md:max-w-none" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4 mx-auto md:mx-0" />
            <div className="flex justify-center md:justify-start gap-2 mb-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex gap-3 pt-4">
               <Skeleton className="h-12 w-full md:w-48" />
               <Skeleton className="h-12 w-full md:w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <div className="text-center py-20">Manga not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      
      {/* Back Button */}
      <Button variant="outline" size="sm" className="mb-6 rounded-lg bg-transparent border-white/20 hover:bg-white/10" render={<Link to="/" />}>
        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
      </Button>

      {/* Header Info - Card Style */}
      <div className="relative rounded-2xl overflow-hidden bg-card/40 border border-white/5 backdrop-blur-xl shadow-2xl mb-8">
        {/* Blurred Background */}
        <div className="absolute inset-0 z-0">
           <img src={data.cover || data.thumbnail} className="w-full h-full object-cover opacity-[0.15] blur-2xl" alt="background" />
           <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8">
          <div className="w-48 md:w-56 shrink-0 mx-auto md:mx-0 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <img src={data.cover || data.thumbnail} alt={data.title} className="w-full h-auto aspect-[2/3] object-cover" />
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center md:text-left">{data.title}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              {data.status && <Badge variant="outline" className="text-xs bg-black/40 border-white/10 text-white/90 px-3 py-1">{String(data.status)}</Badge>}
              
              {data.genres && Array.isArray(data.genres) && data.genres.slice(0, 4).map((genre: any, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-black/40 border-white/10 text-white/90 px-3 py-1">
                  {typeof genre === 'object' ? genre.name || genre.id : genre}
                </Badge>
              ))}
            </div>

            {firstChapterId && (
               <Button className="w-full md:w-auto font-semibold h-11 bg-white text-black hover:bg-gray-200 rounded-lg mb-8" render={<Link to={`/read/${firstChapterId}?manga=${id}`} state={{ mangaTitle: data.title, mangaCover: data.cover || data.thumbnail }} className="flex items-center w-full justify-center px-6" />}>
                  <BookOpen className="w-4 h-4 mr-2" /> Read First Chapter
               </Button>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/40 rounded-xl p-5 border border-white/5">
              <div>
                <p className="text-white/50 mb-1 text-[10px] md:text-xs font-semibold tracking-wider">AUTHOR</p>
                <p className="font-medium text-sm text-white/90">
                  {data.authors && data.authors.length > 0 
                    ? data.authors.map((a: any) => a.name).join(', ') 
                    : data.author || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-white/50 mb-1 text-[10px] md:text-xs font-semibold tracking-wider">TYPE</p>
                <p className="font-medium text-sm text-white/90">
                   {data.type && Array.isArray(data.type) ? data.type[0]?.name || data.type[0] : data.type || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-white/50 mb-1 text-[10px] md:text-xs font-semibold tracking-wider">STATUS</p>
                <p className="font-medium text-sm text-white/90">{data.status || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-white/50 mb-1 text-[10px] md:text-xs font-semibold tracking-wider">CHAPTERS</p>
                <p className="font-medium text-sm text-white/90">{chapters.length > 0 ? chapters[0]?.chapter_number || chapters.length : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis */}
      <div className="space-y-4 mb-10">
        <h3 className="text-xl font-bold">Synopsis</h3>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-wrap">
          {data.description || 'No synopsis available.'}
        </p>
      </div>

      {/* Chapters */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Chapters {loadingChapters ? <Loader2 className="h-4 w-4 animate-spin inline ml-2" /> : ''}
          </h3>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const start = (pageNum - 1) * pageSize + 1;
              const end = pageNum * pageSize;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="min-w-[40px] text-xs h-8"
                >
                  {start}-{end}
                </Button>
              );
            })}
          </div>
        )}
        
        <div className="grid gap-2 grid-cols-1">
          {chapters.map(chapter => (
            <Link key={chapter.chapter_id} to={`/read/${chapter.chapter_id}?manga=${id}`} state={{ mangaTitle: data.title, mangaCover: data.cover || data.thumbnail }}>
              <div className="hover:bg-muted/50 transition-colors bg-card shadow-sm border rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold text-sm md:text-base line-clamp-1 mr-2">
                  {chapter.chapter_title || `Chapter ${chapter.chapter_number}`}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(chapter.release_date).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
          {loadingChapters && (
             Array(10).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg bg-muted" />
             ))
          )}
        </div>
      </div>
    </div>
  )
}
