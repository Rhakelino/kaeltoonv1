import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Home from "./pages/Home"
import LatestManga from "./pages/LatestManga"
import SearchPage from "./pages/Search"
import MangaDetail from "./pages/MangaDetail"
import ReadChapter from "./pages/ReadChapter"
import History from "./pages/History"
import OfflineGuard from "./components/OfflineGuard"

function App() {
  return (
    <OfflineGuard>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="latest" element={<LatestManga />} />
          <Route path="popular" element={<LatestManga />} />
          <Route path="recommended" element={<LatestManga />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="history" element={<History />} />

          <Route path="manga/:id" element={<MangaDetail />} />
        </Route>
        
        {/* Reader route outside of layout for fullscreen experience */}
        <Route path="/read/:chapterId" element={<ReadChapter />} />
      </Routes>
    </OfflineGuard>
  )
}

export default App

