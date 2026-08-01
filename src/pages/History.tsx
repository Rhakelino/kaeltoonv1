import { Card } from "@/components/ui/card"
import { History as HistoryIcon, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface HistoryItem {
  manga_id: string;
  title: string;
  cover: string;
  chapter_id: string;
  chapter_title: string | null;
  read_at: number;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('manga_history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Sort by most recent
        setHistory(parsed.sort((a: HistoryItem, b: HistoryItem) => b.read_at - a.read_at))
      } catch (e) {
        console.error("Failed to parse history", e)
      }
    }
  }, [])

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      localStorage.removeItem('manga_history')
      setHistory([])
    }
  }

  const removeHistoryItem = (manga_id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newHistory = history.filter(item => item.manga_id !== manga_id)
    localStorage.setItem('manga_history', JSON.stringify(newHistory))
    setHistory(newHistory)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-primary" /> History
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Pick up where you left off</p>
        </div>
        {history.length > 0 && (
          <Button variant="destructive" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear All
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center justify-center opacity-50">
          <HistoryIcon className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">No reading history</p>
          <p className="text-sm">Start reading some manga to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
          {history.map((item) => (
            <Link to={`/read/${item.chapter_id}?manga=${item.manga_id}`} key={item.manga_id} className="group relative">
              <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm overflow-hidden group-hover:border-primary transition-colors pb-2 h-full">
                <div className="w-full aspect-[2/3] bg-muted relative overflow-hidden shrink-0 border-b">
                  <img src={item.cover} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <Badge className="absolute top-2 left-2 pointer-events-none line-clamp-1 max-w-[85%] z-10">{item.chapter_title || 'Continue'}</Badge>
                </div>
                <div className="px-2 pt-1 flex flex-col justify-between flex-1 relative">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors pr-6">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(item.read_at).toLocaleDateString()}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => removeHistoryItem(item.manga_id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}