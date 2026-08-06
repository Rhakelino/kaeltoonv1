import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon, Loader2, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { comicApi } from "@/services/api"
import type { MangaItem } from "@/services/api"
import { formatTimeAgo } from "@/lib/utils"

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ""
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<MangaItem[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setSearchParams({ q: query })
    setLoading(true)
    try {
      const data = await comicApi.search(query)
      setResults(data.data || [])
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Run search on mount if query exists in URL
  useEffect(() => {
    if (initialQuery) {
      handleSearch()
    }
  }, [initialQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
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

      <div className="space-y-3 md:space-y-4 mt-6 md:mt-8">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : results.length > 0 ? (
          results.map(result => (
            <Link to={`/manga/${result.id || result.manga_id}`} key={result.id || result.manga_id}>
              <Card className="flex overflow-hidden bg-card border border-border/50 hover:border-primary transition-colors h-[120px] md:h-36 rounded-xl group">
                <div className="w-24 md:w-28 shrink-0 bg-muted relative overflow-hidden">
                   <img src={result.thumbnail || result.cover} alt={result.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                   {result.rating && (
                     <Badge variant="secondary" className="absolute top-1.5 left-1.5 flex items-center gap-0.5 font-semibold text-[10px] pointer-events-none z-10 bg-background/80 backdrop-blur px-1 py-0">
                       <Star className="w-2.5 h-2.5 text-yellow-500 fill-current shrink-0" /> {result.rating}
                     </Badge>
                   )}
                </div>
                <CardContent className="p-3 md:p-4 flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm md:text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">{result.title}</h3>
                      {result.status && (
                        <Badge variant={result.status === 'Ongoing' ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
                          {result.status}
                        </Badge>
                      )}
                    </div>
                    {result.format && <p className="text-xs text-muted-foreground mb-1 font-medium">{result.format}</p>}
                    <p className="text-xs line-clamp-2 text-muted-foreground hidden md:block">{result.description || 'No description available.'}</p>
                  </div>

                  {result.chapters && result.chapters.length > 0 && (
                    <div className="flex gap-2 mt-2 pt-1 border-t border-border/40 overflow-x-auto">
                      {result.chapters.slice(0, 2).map((ch) => (
                        <span key={ch.id} className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Ch. {ch.chapter_number} {ch.release_date ? `(${formatTimeAgo(ch.release_date)})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : searchParams.has('q') ? (
           <div className="text-center py-10 text-muted-foreground">No results found for "{searchParams.get('q')}".</div>
        ) : (
           <div className="text-center py-10 text-muted-foreground">Enter a keyword to search.</div>
        )}
      </div>
    </div>
  )
}
