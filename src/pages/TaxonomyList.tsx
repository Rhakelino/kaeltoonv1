import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { comicApi } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { Compass, Sparkles } from "lucide-react"

export default function TaxonomyList({ title }: { title: string }) {
  const [items, setItems] = useState<{ id?: string, name: string, slug?: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        let data = [];
        if (title === 'Genres') {
           data = await comicApi.getGenres();
        } else if (title === 'Authors') {
           data = await comicApi.getAuthors();
        }
        setItems(data || []);
      } catch (error) {
        console.error(`Failed to fetch ${title}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchTaxonomy();
  }, [title]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-4">
        <Compass className="w-6 h-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {loading ? (
           Array(24).fill(0).map((_, i) => (
             <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted" />
           ))
        ) : items.length > 0 ? (
          items.map((item, i) => (
            <Link to={`/search?q=${encodeURIComponent(item.name)}`} key={item.id || i}>
              <Card className="cursor-pointer border border-border/50 hover:border-primary hover:bg-primary/10 transition-all bg-card rounded-xl group h-full shadow-sm">
                <CardContent className="p-4 flex items-center justify-between h-full">
                  <span className="font-semibold text-xs md:text-sm group-hover:text-primary transition-colors">{item.name}</span>
                  <Sparkles className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors opacity-60" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No {title.toLowerCase()} found.
          </div>
        )}
      </div>
    </div>
  )
}
