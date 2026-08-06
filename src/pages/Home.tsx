import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState, useCallback } from "react"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { comicApi } from "@/services/api"
import type { MangaItem } from "@/services/api"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import PullToRefresh from "@/components/PullToRefresh"
import { Star } from "lucide-react"

export default function Home() {
  const [sliderRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])
  const isMobile = useMediaQuery("(max-width: 767px)")
  
  const [data, setData] = useState<{
    latest: MangaItem[];
    recommended: MangaItem[];
    popular: MangaItem[];
    slider: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = useCallback(async () => {
    try {
      const [homeRes, sliderRes] = await Promise.all([
        comicApi.getHome(),
        comicApi.getSlider()
      ]);
      
      setData({
        ...homeRes.data,
        slider: sliderRes.data || []
      });
    } catch (error) {
      console.error("Failed to fetch home data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  return (
    <PullToRefresh onRefresh={fetchHomeData}>
      <div>
        <h2 className="text-2xl font-bold mb-6">Kaeltoon</h2>
        
        {/* Featured Slider */}
        <div className="mb-12">
          {loading ? (
            <Skeleton className="w-full h-48 md:h-64 lg:h-80 rounded-2xl bg-muted" />
          ) : data?.slider && data.slider.length > 0 ? (
            <div className="overflow-hidden rounded-2xl" ref={sliderRef}>
              <div className="flex touch-pan-y">
                {data.slider.map((slide) => (
                  <div key={slide.id} className="min-w-0 flex-[0_0_100%] relative aspect-[21/9] md:aspect-[21/7] max-h-80 group overflow-hidden bg-black">
                    <Link to={`/manga/${slide.manga_id || slide.id}`} className="block w-full h-full">
                      <img 
                        src={slide.background_image} 
                        className="absolute inset-0 w-full h-full object-cover opacity-80" 
                        alt={slide.title} 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/50 md:via-black/70 to-transparent z-10" />
                      {slide.chara_image && (
                        <div className="absolute top-0 right-0 bottom-0 w-[50%] md:w-[40%] overflow-hidden z-20 pointer-events-none">
                           <img 
                             src={slide.chara_image} 
                             alt="Character" 
                             className="w-full h-full object-contain object-right-bottom md:translate-y-4 md:group-hover:translate-y-0 md:group-hover:scale-110 transition-transform duration-700 ease-out md:drop-shadow-2xl"
                             loading="lazy"
                           />
                           <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      )}
                      <div className="absolute inset-0 p-4 md:p-8 flex items-end md:items-center z-30">
                        <div className="w-full md:max-w-xl">
                          <h3 className="text-white text-2xl md:text-4xl font-bold mb-2 md:mb-3 drop-shadow-lg line-clamp-1">{slide.title}</h3>
                          <div className="hidden md:block">
                             <p className="text-white/80 line-clamp-2 text-sm md:text-base mb-4 drop-shadow-md">
                               {slide.description}
                             </p>
                          </div>
                          <div className="flex gap-2">
                             {slide.badges?.map((badge: any, i: number) => (
                                <Badge key={i} className="text-[10px] md:text-xs font-semibold px-2 py-0.5 border-none" style={{ backgroundColor: badge.color, color: 'white' }}>
                                   {badge.name}
                                </Badge>
                             ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Latest Updates */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Updates</h2>
            <Link to="/latest" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <Card key={`lat-skel-${i}`} className="bg-card flex flex-col gap-2 rounded-xl border pb-2 shadow-sm overflow-hidden">
                  <Skeleton className="w-full aspect-[2/3] rounded-md" />
                  <CardContent className="p-0 pt-2 px-2 flex flex-col gap-1">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : data?.latest?.slice(0, isMobile ? 24 : 25)?.map((manga) => (
              <Link to={`/manga/${manga.id || manga.manga_id}`} key={`lat-${manga.id || manga.manga_id}`}>
                <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm overflow-hidden group pb-2 h-full">
                  <div className="w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0 border-b">
                    <img src={manga.thumbnail || manga.cover} alt={manga.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    {manga.latest_chapter && (
                      <Badge className="absolute top-2 left-2 pointer-events-none line-clamp-1 max-w-[70%] z-10 text-[10px] md:text-xs">Ch {manga.latest_chapter}</Badge>
                    )}
                    {manga.rating && (
                      <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-0.5 font-semibold text-[10px] md:text-xs pointer-events-none z-10 bg-background/80 backdrop-blur px-1.5 py-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-current shrink-0" /> {manga.rating}
                      </Badge>
                    )}
                    {manga.format && (
                      <Badge variant="outline" className="absolute bottom-2 left-2 pointer-events-none z-10 bg-background/80 backdrop-blur text-[9px] uppercase font-bold tracking-wider px-1.5 py-0">
                        {typeof manga.format === 'string' ? manga.format : manga.format[0]}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-2 pt-1 flex flex-col gap-1 flex-1">
                    <h3 className="font-semibold line-clamp-2 text-sm leading-tight flex-1" title={manga.title}>{manga.title}</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1 mt-auto">
                      {manga.status || (manga.release_year ? `Year ${manga.release_year}` : '')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
            ) : data?.recommended?.slice(0, isMobile ? 24 : 25)?.map((manga) => (
              <Link to={`/manga/${manga.id || manga.manga_id}`} key={`rec-${manga.id || manga.manga_id}`}>
                <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm overflow-hidden group pb-2 h-full">
                  <div className="w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0 border-b">
                    <img src={manga.thumbnail || manga.cover} alt={manga.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    {manga.latest_chapter && (
                      <Badge className="absolute top-2 left-2 pointer-events-none line-clamp-1 max-w-[70%] z-10 text-[10px] md:text-xs">Ch {manga.latest_chapter}</Badge>
                    )}
                    {manga.rating && (
                      <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-0.5 font-semibold text-[10px] md:text-xs pointer-events-none z-10 bg-background/80 backdrop-blur px-1.5 py-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-current shrink-0" /> {manga.rating}
                      </Badge>
                    )}
                    {manga.format && (
                      <Badge variant="outline" className="absolute bottom-2 left-2 pointer-events-none z-10 bg-background/80 backdrop-blur text-[9px] uppercase font-bold tracking-wider px-1.5 py-0">
                        {typeof manga.format === 'string' ? manga.format : manga.format[0]}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-2 pt-1 flex flex-col gap-1 flex-1">
                    <h3 className="font-semibold line-clamp-2 text-sm leading-tight flex-1" title={manga.title}>{manga.title}</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1 mt-auto">
                      {manga.status || (manga.release_year ? `Year ${manga.release_year}` : '')}
                    </p>
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
            ) : data?.popular?.slice(0, isMobile ? 24 : 25)?.map((manga) => (
              <Link to={`/manga/${manga.id || manga.manga_id}`} key={`pop-${manga.id || manga.manga_id}`}>
                 <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm overflow-hidden group pb-2 h-full">
                  <div className="w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0 border-b">
                    <img src={manga.thumbnail || manga.cover} alt={manga.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    {manga.latest_chapter && (
                      <Badge className="absolute top-2 left-2 pointer-events-none line-clamp-1 max-w-[70%] z-10 text-[10px] md:text-xs">Ch {manga.latest_chapter}</Badge>
                    )}
                    {manga.rating && (
                      <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-0.5 font-semibold text-[10px] md:text-xs pointer-events-none z-10 bg-background/80 backdrop-blur px-1.5 py-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-current shrink-0" /> {manga.rating}
                      </Badge>
                    )}
                    {manga.format && (
                      <Badge variant="outline" className="absolute bottom-2 left-2 pointer-events-none z-10 bg-background/80 backdrop-blur text-[9px] uppercase font-bold tracking-wider px-1.5 py-0">
                        {typeof manga.format === 'string' ? manga.format : manga.format[0]}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-2 pt-1 flex flex-col gap-1 flex-1">
                    <h3 className="font-semibold line-clamp-2 text-sm leading-tight flex-1" title={manga.title}>{manga.title}</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1 mt-auto">
                      {manga.status || (manga.release_year ? `Year ${manga.release_year}` : '')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PullToRefresh>
  )
}
