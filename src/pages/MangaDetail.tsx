import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Loader2, ChevronLeft, Check, Download } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { comicApi } from "@/services/api"
import type { DetailManga } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllOfflineChapters, saveChapterOffline } from "@/services/offlineStorage"

export default function MangaDetail() {
  const { id } = useParams()
  const [data, setData] = useState<DetailManga | null>(null)
  const [chapters, setChapters] = useState<{ id: string; chapter_number: number; title: string | null; thumbnail: string; release_date: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingChapters, setLoadingChapters] = useState(true)
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [firstChapterId, setFirstChapterId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [downloadingChapterId, setDownloadingChapterId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<string>("");
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  useEffect(() => {
    getAllOfflineChapters()
      .then(items => setDownloadedIds(new Set(items.map(i => i.chapterId))))
      .catch(() => {});
  }, []);

  // Generate range tabs
  const pageSize = 50; // Assuming 50 per page based on generic logic or API

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
               setFirstChapterId(lastPageRes.data[lastPageRes.data.length - 1].id);
             }
          } else if (response.data && response.data.length > 0) {
             // If only 1 page, the last item is the first chapter
             setFirstChapterId(response.data[response.data.length - 1].id);
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

  const handleDownloadChapter = async (chapterId: string, chapterTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id || !data || downloadingChapterId || downloadedIds.has(chapterId)) return;

    setDownloadingChapterId(chapterId);
    setDownloadProgress("Fetching...");

    try {
      const resData = await comicApi.readChapter(chapterId);
      const imgArray = Array.isArray(resData) ? resData : resData?.data || resData?.images || [];
      const finalImages = Array.isArray(imgArray) ? imgArray : (imgArray?.images || []);

      if (finalImages.length > 0) {
        await saveChapterOffline(
          chapterId,
          id,
          data.title || 'Manga',
          chapterTitle,
          finalImages,
          (curr, total) => setDownloadProgress(`${curr}/${total}`),
          data.cover || data.thumbnail
        );
        setDownloadedIds(prev => new Set([...prev, chapterId]));
      }
    } catch (err) {
      console.error("Failed to download chapter from detail page:", err);
    } finally {
      setDownloadingChapterId(null);
      setDownloadProgress("");
    }
  };

  const toggleSelectChapter = (chapterId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloadedIds.has(chapterId)) return;
    setSelectedChapterIds(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const selectAllUnDownloaded = () => {
    const unDownloaded = chapters.filter(c => !downloadedIds.has(c.id)).map(c => c.id);
    if (selectedChapterIds.size === unDownloaded.length) {
      setSelectedChapterIds(new Set());
    } else {
      setSelectedChapterIds(new Set(unDownloaded));
    }
  };

  const handleBulkDownload = async () => {
    if (!id || !data || selectedChapterIds.size === 0 || isBulkDownloading) return;
    setIsBulkDownloading(true);

    const targets = chapters.filter(c => selectedChapterIds.has(c.id));
    let count = 0;

    for (const chapter of targets) {
      count++;
      const chapterTitleStr = chapter.title || `Chapter ${chapter.chapter_number}`;
      setBulkStatus(`Downloading ${count}/${targets.length}...`);
      setDownloadingChapterId(chapter.id);
      setDownloadProgress("0%");

      try {
        const resData = await comicApi.readChapter(chapter.id);
        const imgArray = Array.isArray(resData) ? resData : resData?.data || resData?.images || [];
        const finalImages = Array.isArray(imgArray) ? imgArray : (imgArray?.images || []);

        if (finalImages.length > 0) {
          await saveChapterOffline(
            chapter.id,
            id,
            data.title || 'Manga',
            chapterTitleStr,
            finalImages,
            (curr, total) => setDownloadProgress(`${curr}/${total}`),
            data.cover || data.thumbnail
          );
          setDownloadedIds(prev => new Set([...prev, chapter.id]));
        }
      } catch (err) {
        console.error(`Failed bulk download chapter ${chapter.id}:`, err);
      }
    }

    setDownloadingChapterId(null);
    setDownloadProgress("");
    setIsBulkDownloading(false);
    setBulkStatus("");
    setSelectedChapterIds(new Set());
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
      <Button variant="outline" size="sm" className="mb-6 rounded-lg bg-background hover:bg-muted dark:bg-transparent dark:border-white/20 dark:hover:bg-white/10" asChild>
        <Link to="/" className="flex items-center">
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </Button>

      {/* Header Info - Card Style */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-lg mb-8 dark:bg-card/40 dark:border-white/5 dark:backdrop-blur-xl">
        {/* Blurred Background - Only visible in dark mode for the cool effect */}
        <div className="absolute inset-0 z-0 hidden dark:block">
           <img src={data.cover || data.thumbnail} className="w-full h-full object-cover opacity-[0.15] blur-2xl" alt="background" />
           <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8">
          <div className="w-48 md:w-56 shrink-0 mx-auto md:mx-0 rounded-xl overflow-hidden shadow-xl ring-1 ring-border dark:ring-white/10">
            <img src={data.cover || data.thumbnail} alt={data.title} className="w-full h-auto aspect-[2/3] object-cover" />
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center md:text-left text-foreground">{data.title}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              {data.status && <Badge variant="outline" className="text-xs px-3 py-1 bg-background dark:bg-black/40 border-border dark:border-white/10 text-foreground dark:text-white/90">{String(data.status)}</Badge>}
              
              {data.manga_genres && Array.isArray(data.manga_genres) && data.manga_genres.slice(0, 4).map((mg: { genres: { name?: string; id?: string } | string }, i) => (
                <Badge key={i} variant="outline" className="text-xs px-3 py-1 bg-background dark:bg-black/40 border-border dark:border-white/10 text-foreground dark:text-white/90">
                  {typeof mg.genres === 'object' ? mg.genres.name || mg.genres.id : mg.genres}
                </Badge>
              ))}
            </div>

            {firstChapterId && (
               <Button className="w-full md:w-auto font-semibold h-11 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-lg mb-8 border border-border dark:border-none" asChild>
                 <Link to={`/read/${firstChapterId}?manga=${id}`} state={{ mangaTitle: data.title, mangaCover: data.cover || data.thumbnail }} className="flex items-center w-full justify-center px-6">
                  <BookOpen className="w-4 h-4 mr-2" /> Read First Chapter
                 </Link>
               </Button>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-background dark:bg-black/40 rounded-xl p-5 border border-border dark:border-white/5">
              <div>
                <p className="text-muted-foreground dark:text-white/50 mb-1 text-[10px] md:text-xs font-semibold tracking-wider">AUTHOR</p>
                <p className="font-medium text-sm text-foreground dark:text-white/90">
                  {data.manga_authors && data.manga_authors.length > 0 
                    ? data.manga_authors.map((a: { authors?: { name?: string } }) => a.authors?.name).join(', ') 
                    : data.author || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground dark:text-white/50 mb-1 text-[10px] md:text-xs font-semibold tracking-wider">TYPE</p>
                <p className="font-medium text-sm text-foreground dark:text-white/90">
                   {data.type && Array.isArray(data.type) ? (data.type[0]?.name || String(data.type[0])) : data.type || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground dark:text-white/50 mb-1 text-[10px] md:text-xs font-semibold tracking-wider">STATUS</p>
                <p className="font-medium text-sm text-foreground dark:text-white/90">{data.status || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground dark:text-white/50 mb-1 text-[10px] md:text-xs font-semibold tracking-wider">CHAPTERS</p>
                <p className="font-medium text-sm text-foreground dark:text-white/90">{chapters.length > 0 ? chapters[0]?.chapter_number || chapters.length : 'N/A'}</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Chapters {loadingChapters ? <Loader2 className="h-4 w-4 animate-spin inline ml-2" /> : ''}
          </h3>

          {!loadingChapters && chapters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectAllUnDownloaded}
                disabled={isBulkDownloading}
                className="text-xs h-8"
              >
                {selectedChapterIds.size > 0 && selectedChapterIds.size === chapters.filter(c => !downloadedIds.has(c.id)).length
                  ? "Deselect All"
                  : "Select All"}
              </Button>

              {selectedChapterIds.size > 0 && (
                <Button 
                  size="sm" 
                  onClick={handleBulkDownload}
                  disabled={isBulkDownloading}
                  className="text-xs h-8 bg-primary text-primary-foreground gap-1.5"
                >
                  {isBulkDownloading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{bulkStatus}</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Selected ({selectedChapterIds.size})</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
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
          {chapters.map(chapter => {
            const isSaved = downloadedIds.has(chapter.id);
            const isSelected = selectedChapterIds.has(chapter.id);
            const isDownloadingThis = downloadingChapterId === chapter.id;
            const chapterTitleStr = chapter.title || `Chapter ${chapter.chapter_number}`;
            return (
              <div 
                key={chapter.id} 
                className={`hover:bg-muted/50 transition-colors bg-card shadow-sm border rounded-lg p-3 sm:p-4 flex justify-between items-center group ${isSelected ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0 mr-2 flex-1">
                  {!isSaved && (
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      disabled={isBulkDownloading}
                      onChange={(e) => toggleSelectChapter(chapter.id, e as unknown as React.MouseEvent)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                    />
                  )}
                  <Link to={`/read/${chapter.id}?manga=${id}`} state={{ mangaTitle: data.title, mangaCover: data.cover || data.thumbnail }} className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {chapterTitleStr}
                    </span>
                    {isSaved && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-green-500 border-green-500/40 shrink-0 gap-1">
                        <Check className="h-3 w-3" /> Offline
                      </Badge>
                    )}
                  </Link>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {new Date(chapter.release_date).toLocaleDateString()}
                  </span>
                  <Button
                    variant={isSaved ? "ghost" : isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={isSaved || isDownloadingThis || isBulkDownloading}
                    onClick={(e) => {
                      if (selectedChapterIds.size > 0) {
                        toggleSelectChapter(chapter.id, e);
                      } else {
                        handleDownloadChapter(chapter.id, chapterTitleStr, e);
                      }
                    }}
                    className="h-8 px-2.5 text-xs"
                    title={isSaved ? "Chapter tersimpan offline" : "Download chapter"}
                  >
                    {isDownloadingThis ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        <span className="text-[10px]">{downloadProgress}</span>
                      </>
                    ) : isSaved ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Download</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
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
