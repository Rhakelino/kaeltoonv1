import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { comicApi } from "@/services/api"
import type { MangaItem } from "@/services/api"

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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
            <Link to={`/manga/${result.manga_id}`} key={result.manga_id}>
              <Card className="flex overflow-hidden bg-card border-none shadow-none hover:bg-muted/50 transition-colors h-[120px] md:h-auto rounded-xl">
                <div className="w-[80px] md:w-32 sm:w-48 shrink-0 bg-muted">
                   <img src={result.thumbnail || result.cover} alt={result.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-3 md:p-4 sm:p-6 flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2 md:gap-4 mb-1 md:mb-2">
                      <h3 className="text-sm md:text-xl font-bold line-clamp-1 md:line-clamp-2">{result.title}</h3>
                      {result.status && (
                        <Badge variant={result.status === 'Ongoing' ? 'default' : 'secondary'} className="shrink-0 text-[10px] md:text-xs">
                          {result.status}
                        </Badge>
                      )}
                    </div>
                    {result.type && <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-4">{result.type}</p>}
                    <p className="text-xs md:text-sm line-clamp-2 md:line-clamp-3 text-muted-foreground hidden md:block">{result.description || 'No description available.'}</p>
                  </div>
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
