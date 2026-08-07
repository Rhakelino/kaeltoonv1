import { useState, useEffect, type ReactNode } from "react"
import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

export default function OfflineGuard({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <WifiOff className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
        <h2 className="text-xl font-bold mb-2">Tidak Ada Koneksi Internet</h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Periksa koneksi internet kamu dan coba lagi.
        </p>
        <Button onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
