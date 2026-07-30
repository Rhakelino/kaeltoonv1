import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Star, Info, ListOrdered, Loader2, ChevronDown } from "lucide-react"
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
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

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
        const response = await comicApi.getChapterList(id, 1);
        setChapters(response.data || []);
        setHasMore(response.data?.length > 0);
        setPage(1);
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      } finally {
        setLoadingChapters(false);
      }
    }
    fetchInitialChapters()
  }, [id])

  const loadMoreChapters = async () => {
    if (!id || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const response = await comicApi.getChapterList(id, nextPage);
      const newChapters = response.data || [];
      if (newChapters.length === 0) {
        setHasMore(false);
      } else {
        setChapters(prev => [...prev, ...newChapters]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more chapters:", error);
    } finally {
      setLoadingMore(false);
    }
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
    <div className="space-y-6 md:space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 lg:w-72 shrink-0 rounded-lg overflow-hidden border mx-auto md:mx-0 max-w-[240px] md:max-w-none shadow-sm">
          <img src={data.cover || data.thumbnail} alt={data.title} className="w-full h-auto aspect-[2/3] object-cover" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 text-center md:text-left">{data.title}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
              {data.status && <Badge variant={data.status === 'Ongoing' ? 'default' : 'secondary'} className="text-xs">{String(data.status)}</Badge>}
              {data.type && <Badge variant="outline" className="text-xs">{String(data.type)}</Badge>}
              <span className="flex items-center text-sm font-medium text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {data.rating || 'N/A'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm bg-card p-4 rounded-lg border shadow-sm">
            <div>
              <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">Author</p>
              <p className="font-medium">{data.author || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">Artist</p>
              <p className="font-medium">{data.artist || 'Unknown'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.genres && Array.isArray(data.genres) && data.genres.map((genre: any, i) => (
              <span key={i} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-muted text-secondary-foreground hover:bg-muted font-normal">
                {typeof genre === 'object' ? genre.name || genre.id : genre}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            {chapters.length > 0 && chapters[chapters.length - 1] && (
               <Button className="flex-1 md:flex-none w-full md:w-auto font-bold h-12" render={<Link to={`/read/${chapters[chapters.length - 1].chapter_id}?manga=${id}`} className="flex items-center w-full justify-center" />}>
                  <BookOpen className="w-4 h-4 mr-2" /> Read First Chapter
               </Button>
            )}
            {chapters.length > 0 && chapters[0] && (
              <Button variant="outline" className="flex-1 md:flex-none w-full md:w-auto font-bold h-12" render={<Link to={`/read/${chapters[0].chapter_id}?manga=${id}`} className="flex items-center w-full justify-center" />}>
                Latest Chapter
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Synopsis */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" /> Synopsis
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-wrap">
          {data.description || 'No synopsis available.'}
        </p>
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-primary" /> Chapters {loadingChapters ? <Loader2 className="h-4 w-4 animate-spin inline ml-2" /> : `(${chapters.length})`}
          </h3>
        </div>
        
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map(chapter => (
            <Link key={chapter.chapter_id} to={`/read/${chapter.chapter_id}?manga=${id}`}>
              <Card className="hover:border-primary transition-colors bg-card shadow-sm h-full">
                <CardContent className="p-3 md:p-4 flex justify-between items-center h-full">
                  <span className="font-medium text-sm md:text-base line-clamp-1 mr-2">
                    {chapter.chapter_title || `Chapter ${chapter.chapter_number}`}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(chapter.release_date).toLocaleDateString()}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        {hasMore && !loadingChapters && chapters.length > 0 && (
          <Button 
            variant="secondary" 
            className="w-full mt-6" 
            onClick={loadMoreChapters}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
            ) : (
              <><ChevronDown className="mr-2 h-4 w-4" /> Load More</>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
