import { Link, useLocation } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Flame, Compass, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { comicApi } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function LatestManga() {
  const location = useLocation()
  
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/popular': return { title: 'Popular Manga', icon: Flame, fetch: comicApi.getPopular }
      case '/recommended': return { title: 'Recommended', icon: Compass, fetch: comicApi.getRecommended }
      default: return { title: 'Latest Updates', icon: Clock, fetch: comicApi.getLatest }
    }
  }

  const pageInfo = getPageInfo()
  const Icon = pageInfo.icon

  const [mangas, setMangas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await pageInfo.fetch(page)
        setMangas(res.data || [])
        if (res.pagination) {
          setTotalPages(res.pagination.total_pages)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [location.pathname, page])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icon className="w-6 h-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{pageInfo.title}</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
           {Array(10).fill(0).map((_, i) => (
             <Card key={`skel-${i}`} className="bg-card flex flex-col gap-2 rounded-xl border shadow-sm overflow-hidden pb-2">
                <Skeleton className="w-full aspect-[2/3] rounded-none" />
                <div className="px-2 pt-1 flex flex-col gap-2">
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-3 w-2/3" />
                </div>
             </Card>
           ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {mangas.map((manga) => (
              <Link to={`/manga/${manga.manga_id}`} key={manga.manga_id}>
                <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm overflow-hidden group pb-2 h-full">
                  <div className="w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0 border-b">
                    <img src={manga.cover} alt={manga.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    {manga.rating && (
                      <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-1 font-semibold text-xs pointer-events-none z-10 bg-background/80 backdrop-blur">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" /> {manga.rating}
                      </Badge>
                    )}
                    {manga.latest_chapter && (
                      <Badge className="absolute top-2 left-2 pointer-events-none line-clamp-1 max-w-[70%] z-10">Ch {manga.latest_chapter}</Badge>
                    )}
                  </div>
                  <div className="px-2 pt-1 flex flex-col justify-between flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {manga.title}
                    </h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8 justify-center">
              <PaginationContent>
                <PaginationItem>
                  <Button variant="ghost" onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="gap-1 pl-2.5">
                    <PaginationPrevious />
                  </Button>
                </PaginationItem>
                <PaginationItem className="hidden sm:inline-block">
                  <PaginationLink isActive>{page}</PaginationLink>
                </PaginationItem>
                <PaginationItem className="hidden sm:inline-block">
                  <span className="flex h-9 w-9 items-center justify-center text-sm">of</span>
                </PaginationItem>
                <PaginationItem className="hidden sm:inline-block">
                  <PaginationLink>{totalPages}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <Button variant="ghost" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="gap-1 pr-2.5">
                    <PaginationNext />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}
