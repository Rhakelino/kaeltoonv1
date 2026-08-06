import { Link, Outlet, useLocation } from "react-router-dom"
import { BookOpen, Search, Home, Compass, History, Sun, Moon } from "lucide-react"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import { Input } from "../ui/input"
import DownloadBanner from "../DownloadBanner"

export default function Layout() {
  const location = useLocation()
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("kaeltoon-theme")
    return (saved as "light" | "dark") || "dark"
  })

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
      document.documentElement.style.colorScheme = "dark"
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.style.colorScheme = "light"
    }
    localStorage.setItem("kaeltoon-theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Popular", path: "/popular", icon: Compass },
    { name: "Search", path: "/search", icon: Search },
    { name: "History", path: "/history", icon: History },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      {/* Desktop Navbar */}
      <nav className="hidden md:block bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <Link to="/" className="text-2xl font-bold">Kaeltoon</Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form action="/search" className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="q" placeholder="Search manga..." className="w-full pl-9 bg-muted border-none h-10" />
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex gap-1 mr-2">
                <Button variant="ghost" render={<Link to="/popular" />}>
                  Popular
                </Button>
              </div>
              <div className="hidden md:flex">
                <Button variant="ghost" size="icon" aria-label="Reading History" render={<Link to="/history" />}>
                  <History className="h-5 w-5" />
                </Button>
              </div>
              <div className="hidden md:flex">
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 md:py-8 pb-20 md:pb-8 flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] space-y-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>

      <DownloadBanner />
    </div>
  )
}
