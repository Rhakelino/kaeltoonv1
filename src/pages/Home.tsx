import { Card, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { comicApi } from "@/services/api"
import type { MangaItem } from "@/services/api"

export default function Home() {
  const [data, setData] = useState<{
    latest: MangaItem[];
    recommended: MangaItem[];
    popular: MangaItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await comicApi.getHome();
        if (response.status === 'success') {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const featured = data?.popular?.[0] || null;

  return (
    <div>
      {/* Featured */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured</h2>
        {loading ? (
          <Skeleton className="w-full h-64 sm:h-80 md:h-96 rounded-xl bg-muted" />
        ) : featured ? (
          <Link to={`/manga/${featured.manga_id}`}>
            <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden bg-muted group cursor-pointer border shadow-sm">
               <img src={featured.cover || featured.thumbnail} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt={featured.title} />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 md:p-6">
                  <h3 className="text-white text-xl md:text-3xl font-bold mb-2">{featured.title}</h3>
                  <p className="text-white/80 line-clamp-2 max-w-2xl text-xs md:text-sm" dangerouslySetInnerHTML={{ __html: featured.description || '' }}></p>
               </div>
            </div>
          </Link>
        ) : null}
      </div>

      {/* Recommended */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Recommended</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={`rec-skel-${i}`} className="bg-card flex flex-col gap-2 rounded-xl border pb-2 shadow-sm overflow-hidden">
                <Skeleton className="w-full aspect-[2/3] rounded-md" />
                <CardContent className="p-0 pt-2 px-2 flex flex-col gap-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : data?.recommended?.slice(0, 5).map((manga) => (
            <Link to={`/manga/${manga.manga_id}`} key={`rec-${manga.manga_id}`}>
              <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm overflow-hidden group pb-2 h-full">
                <div className="w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0 border-b">
                  <img src={manga.thumbnail || manga.cover} alt={manga.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <CardContent className="p-2 pt-1 flex flex-col gap-1 flex-1">
                  <h3 className="font-semibold line-clamp-2 text-sm leading-tight flex-1" title={manga.title}>{manga.title}</h3>
                  {manga.latest_chapter && <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1 mt-auto">Ch {manga.latest_chapter}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Comics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Popular Comics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={`pop-skel-${i}`} className="bg-card flex flex-col gap-2 rounded-xl border pb-2 shadow-sm overflow-hidden">
                <Skeleton className="w-full aspect-[2/3] rounded-md" />
                <CardContent className="p-0 pt-2 px-2 flex flex-col gap-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : data?.popular?.slice(1, 6).map((manga) => (
            <Link to={`/manga/${manga.manga_id}`} key={`pop-${manga.manga_id}`}>
               <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm overflow-hidden group pb-2 h-full">
                <div className="w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0 border-b">
                  <img src={manga.thumbnail || manga.cover} alt={manga.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <CardContent className="p-2 pt-1 flex flex-col gap-1 flex-1">
                  <h3 className="font-semibold line-clamp-2 text-sm leading-tight flex-1" title={manga.title}>{manga.title}</h3>
                  {manga.latest_chapter && <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1 mt-auto">Ch {manga.latest_chapter}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Updates */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Updates</h2>
          <Link to="/latest" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {loading ? (
            Array(10).fill(0).map((_, i) => (
              <Card key={`lat-skel-${i}`} className="bg-card flex flex-col gap-2 rounded-xl border pb-2 shadow-sm overflow-hidden">
                <Skeleton className="w-full aspect-[2/3] rounded-md" />
                <CardContent className="p-0 pt-2 px-2 flex flex-col gap-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : data?.latest?.slice(0, 10).map((manga) => (
            <Link to={`/manga/${manga.manga_id}`} key={`lat-${manga.manga_id}`}>
              <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm overflow-hidden group pb-2 h-full">
                <div className="w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0 border-b">
                  <img src={manga.thumbnail || manga.cover} alt={manga.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <CardContent className="p-2 pt-1 flex flex-col gap-1 flex-1">
                  <h3 className="font-semibold line-clamp-2 text-sm leading-tight flex-1" title={manga.title}>{manga.title}</h3>
                  {manga.latest_chapter && <p className="text-[10px] md:text-xs text-primary font-medium mt-auto">Ch {manga.latest_chapter}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
