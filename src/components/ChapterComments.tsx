import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Loader2, User } from "lucide-react"
import { formatTimeAgo } from "@/lib/utils"

export interface CommentItem {
  id: string
  chapter_id: string
  user_name: string
  content: string
  created_at: string
}

export default function ChapterComments({ chapterId }: { chapterId: string }) {
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState(() => localStorage.getItem("kaeltoon_user_name") || "")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      if (!chapterId) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("chapter_id", chapterId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching comments:", error)
        } else {
          setComments(data || [])
        }
      } catch (err) {
        console.error("Failed to load comments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [chapterId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !content.trim() || !chapterId) return

    setSubmitting(true)
    localStorage.setItem("kaeltoon_user_name", userName.trim())

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            chapter_id: chapterId,
            user_name: userName.trim(),
            content: content.trim(),
          },
        ])
        .select()

      if (error) {
        console.error("Error posting comment:", error)
      } else if (data && data.length > 0) {
        setComments((prev) => [data[0], ...prev])
        setContent("")
      }
    } catch (err) {
      console.error("Failed to post comment:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 py-8 border-t border-border/40 mt-8" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Komentar ({comments.length})</h3>
      </div>

      {/* Form Komentar */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-8 bg-card/60 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nama kamu..."
            className="bg-background h-9 text-xs max-w-xs"
            required
            maxLength={50}
          />
        </div>
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis komentar..."
            className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-xs min-h-[70px] resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
          <Button type="submit" size="icon" className="h-auto shrink-0 px-4 self-end" disabled={submitting || !content.trim() || !userName.trim()}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>

      {/* List Komentar */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-xs">Memuat komentar...</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((item) => (
            <div key={item.id} className="flex gap-3 bg-card/40 p-3 rounded-lg border border-border/30">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                {item.user_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-xs text-foreground truncate">{item.user_name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatTimeAgo(item.created_at)}</span>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-muted-foreground opacity-70">
          Belum ada komentar. Jadilah yang pertama berkomentar!
        </div>
      )}
    </div>
  )
}
