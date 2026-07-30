import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { comicApi } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function TaxonomyList({ title }: { title: string }) {
  const [items, setItems] = useState<{name: string, url: string}[]>([])
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
    <div className="space-y-4 md:space-y-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {loading ? (
           Array(24).fill(0).map((_, i) => (
             <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted" />
           ))
        ) : items.map((item, i) => (
          <Card key={i} className="cursor-pointer border-none shadow-none hover:bg-muted/50 transition-colors bg-muted/20 rounded-xl">
            <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center text-center h-full">
              <span className="font-semibold text-xs md:text-sm">{item.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
