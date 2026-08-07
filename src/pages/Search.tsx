import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon, Loader2, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link, useSearchParams } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { comicApi } from "@/services/api"
import type { MangaItem } from "@/services/api"
import { formatTimeAgo } from "@/lib/utils"

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ""
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<MangaItem[]>([])
  const [loading, setLoading] = useState(false)
  const prevSearchRef = useRef("")

  useEffect(() => {
    const qParam = searchParams.get('q') || ""
    if (qParam === prevSearchRef.current) return
    prevSearchRef.current = qParam
    setQuery(qParam)
    if (qParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true)
      comicApi.search(qParam)
        .then(data => setResults(data.data || []))
        .catch(err => {
          console.error("Search failed:", err)
          setResults([])
        })
        .finally(() => setLoading(false))
    }
  }, [searchParams])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Search</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search manga titles..." 
          className="max-w-xl bg-muted border-none h-10" 
        />
        <Button type="submit" size="icon" className="md:hidden shrink-0 h-10 w-10" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
        </Button>
        <Button type="submit" className="hidden md:flex h-10" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <SearchIcon className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 mt-6 md:mt-8">
        {loading ? (
          <div className="col-span-full text-center py-10 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : results.length > 0 ? (
          results.map(result => (
            <div key={result.id || result.manga_id} className="flex flex-col h-full">
              <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border-none shadow-sm overflow-hidden group pb-2 flex-1">
                <Link to={`/manga/${result.id || result.manga_id}`} className="block relative">
                  <div className="w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0">
                     <img src={result.cover || result.thumbnail} alt={result.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                     {result.rating && (
                       <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-0.5 font-semibold text-[10px] md:text-xs pointer-events-none z-10 bg-background/80 backdrop-blur px-1.5 py-0.5">
                         <Star className="w-3 h-3 text-yellow-500 fill-current shrink-0" /> {result.rating}
                       </Badge>
                     )}
                     {result.format && (
                       <Badge variant="outline" className="absolute bottom-2 left-2 pointer-events-none z-10 bg-background/80 backdrop-blur text-[9px] uppercase font-bold tracking-wider px-1.5 py-0">
                         {typeof result.format === 'string' ? result.format : result.format[0]}
                       </Badge>
                     )}
                  </div>
                </Link>
                <CardContent className="p-2 pt-1 flex flex-col gap-1 flex-1">
                  <Link to={`/manga/${result.id || result.manga_id}`}>
                    <h3 className="font-semibold line-clamp-2 text-sm leading-tight flex-1 hover:text-primary transition-colors" title={result.title}>{result.title}</h3>
                  </Link>

                  {result.chapters && result.chapters.length > 0 ? (
                    <div className="flex flex-col gap-1 mt-auto pt-2">
                      {result.chapters.slice(0, 2).map((ch) => (
                        <Link
                          key={ch.id}
                          to={`/read/${ch.id}?manga=${result.id || result.manga_id}`}
                          state={{ mangaTitle: result.title, mangaCover: result.cover || result.thumbnail }}
                          className="flex items-center justify-between bg-muted/70 hover:bg-primary/15 hover:text-primary px-2 py-1 rounded-md text-[11px] font-medium transition-colors border border-border/40"
                        >
                          <span className="truncate">Ch. {ch.chapter_number}</span>
                          {ch.release_date && (
                            <span className="text-[9px] text-muted-foreground shrink-0 ml-1">{formatTimeAgo(ch.release_date)}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1 mt-auto">
                      {result.status || (result.release_year ? `Year ${result.release_year}` : '')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))
        ) : searchParams.has('q') ? (
           <div className="col-span-full text-center py-10 text-muted-foreground">No results found for "{searchParams.get('q')}".</div>
        ) : (
           <div className="col-span-full text-center py-10 text-muted-foreground">Enter a keyword to search.</div>
        )}
      </div>
    </div>
  )
}
