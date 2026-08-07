import { Card } from "@/components/ui/card"
import { History as HistoryIcon, Trash2, Download, BookOpen, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { comicApi } from "@/services/api"
import { getAllOfflineChapters, deleteOfflineChapter, type OfflineChapter } from "@/services/offlineStorage"

export interface HistoryItem {
  manga_id: string;
  title: string;
  cover: string;
  chapter_id: string;
  chapter_title: string | null;
  read_at: number;
}

export default function History() {
  const [activeTab, setActiveTab] = useState<"history" | "downloads">("history")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [downloads, setDownloads] = useState<OfflineChapter[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('manga_history')
    if (saved) {
      try {
        const parsed: HistoryItem[] = JSON.parse(saved)
        // Auto-fix existing history items where title was saved as chapter UUID & fetch real title if missing
        const promises = parsed.map(async (item) => {
          if (!item.title || (item.title.startsWith('Chapter ') && item.title.length > 20) || item.title === 'Manga') {
            try {
              const detail = await comicApi.getDetail(item.manga_id);
              if (detail?.title) {
                return { ...item, title: detail.title };
              }
            } catch { /* ignore */ }
          }
          return item;
        });

        Promise.all(promises).then((fixed) => {
          setHistory(fixed.sort((a: HistoryItem, b: HistoryItem) => b.read_at - a.read_at));
          localStorage.setItem('manga_history', JSON.stringify(fixed));
        });
      } catch (e) {
        console.error("Failed to parse history", e)
      }
    }
  }, [])

  useEffect(() => {
    getAllOfflineChapters().then(setDownloads).catch(console.error);
  }, [activeTab]);

  const groupedDownloads = useMemo(() => {
    const groups: { [key: string]: { mangaId: string; mangaTitle: string; cover?: string; chapters: OfflineChapter[] } } = {};
    downloads.forEach((item) => {
      const key = item.mangaId || item.mangaTitle;
      if (!groups[key]) {
        groups[key] = {
          mangaId: item.mangaId,
          mangaTitle: item.mangaTitle,
          cover: item.cover,
          chapters: []
        };
      }
      if (!groups[key].cover && item.cover) {
        groups[key].cover = item.cover;
      }
      groups[key].chapters.push(item);
    });
    return Object.values(groups);
  }, [downloads]);

  const clearHistory = () => {
    if (confirm("Apakah kamu yakin ingin menghapus semua histori bacaan?")) {
      localStorage.removeItem('manga_history')
      setHistory([])
    }
  }

  const removeHistoryItem = (manga_id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(`Hapus "${title}" dari histori?`)) {
      const newHistory = history.filter(item => item.manga_id !== manga_id)
      localStorage.setItem('manga_history', JSON.stringify(newHistory))
      setHistory(newHistory)
    }
  }

  const handleDeleteDownload = async (chapterId: string, chapterTitle: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(`Hapus unduhan "${chapterTitle}" dari offline storage?`)) {
      await deleteOfflineChapter(chapterId);
      setDownloads(prev => prev.filter(d => d.chapterId !== chapterId));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            {activeTab === "history" ? (
              <>
                <HistoryIcon className="h-6 w-6 text-primary" /> History
              </>
            ) : (
              <>
                <Download className="h-6 w-6 text-primary" /> Offline Downloads
              </>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {activeTab === "history" ? "Pick up where you left off" : "Chapters saved for offline reading"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "history" && history.length > 0 && (
            <Button variant="destructive" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeTab === "history" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("history")}
          className="flex items-center gap-2"
        >
          <HistoryIcon className="h-4 w-4" />
          <span>History ({history.length})</span>
        </Button>
        <Button
          variant={activeTab === "downloads" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("downloads")}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Downloads ({downloads.length})</span>
        </Button>
      </div>

      {activeTab === "history" ? (
        history.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center opacity-50">
            <HistoryIcon className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No reading history</p>
            <p className="text-sm">Start reading some manga to see them here.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
            {history.map((item) => (
              <Link to={`/read/${item.chapter_id}?manga=${item.manga_id}`} key={item.manga_id} className="group relative" state={{ mangaTitle: item.title, mangaCover: item.cover }}>
                <Card className="bg-card text-card-foreground flex flex-row sm:flex-col gap-3 sm:gap-2 rounded-xl border-none shadow-sm overflow-hidden group-hover:border-primary transition-colors p-2 sm:p-0 sm:pb-2 h-auto sm:h-full items-center sm:items-stretch">
                  <div className="w-16 sm:w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0 rounded-lg sm:rounded-none">
                    <img src={item.cover} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                  <div className="px-0 sm:px-2 pt-0 sm:pt-1 flex flex-col justify-between flex-1 relative w-full min-w-0 pr-8 sm:pr-0">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors pr-0 sm:pr-6">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                          {item.chapter_title && !item.chapter_title.includes(item.chapter_id) 
                            ? item.chapter_title 
                            : 'Continue'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.read_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-0 sm:top-1 right-0 sm:right-1 h-8 w-8 sm:h-6 sm:w-6 text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      onClick={(e) => removeHistoryItem(item.manga_id, item.title, e)}
                    >
                      <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : (
        downloads.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center opacity-50">
            <Download className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">Belum ada chapter tersimpan</p>
            <p className="text-sm">Klik tombol Offline saat membaca chapter untuk menyimpannya.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedDownloads.map((group) => (
              <div key={group.mangaId || group.mangaTitle} className="bg-card border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 bg-muted rounded overflow-hidden shrink-0 flex items-center justify-center">
                      {group.cover ? (
                        <img src={group.cover} alt={group.mangaTitle} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base line-clamp-1">{group.mangaTitle}</h3>
                      <p className="text-xs text-muted-foreground">{group.chapters.length} Chapter Terunduh</p>
                    </div>
                  </div>

                  {group.mangaId && (
                    <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                      <Link to={`/manga/${group.mangaId}`}>
                        Detail <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {group.chapters.map((item) => (
                    <div key={item.chapterId} className="flex items-center justify-between bg-muted/40 hover:bg-muted p-2.5 rounded-lg transition-colors group">
                      <Link 
                        to={`/read/${item.chapterId}?manga=${item.mangaId}`} 
                        state={{ mangaTitle: item.mangaTitle, mangaCover: item.cover }}
                        className="flex-1 min-w-0 mr-2"
                      >
                        <p className="text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                          {item.chapterTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-green-500 font-medium">
                            {item.images.length} Hal
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(item.savedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={(e) => handleDeleteDownload(item.chapterId, item.chapterTitle, e)}
                        title="Hapus unduhan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}