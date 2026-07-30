import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Home from "./pages/Home"
import LatestManga from "./pages/LatestManga"
import SearchPage from "./pages/Search"
import TaxonomyList from "./pages/TaxonomyList"
import MangaDetail from "./pages/MangaDetail"
import ReadChapter from "./pages/ReadChapter"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="latest" element={<LatestManga />} />
        <Route path="popular" element={<LatestManga />} />
        <Route path="recommended" element={<LatestManga />} />
        <Route path="search" element={<SearchPage />} />
        
        <Route path="genres" element={<TaxonomyList title="Genres" />} />
        <Route path="authors" element={<TaxonomyList title="Authors" />} />
        <Route path="artists" element={<TaxonomyList title="Artists" />} />

        <Route path="manga/:id" element={<MangaDetail />} />
      </Route>
      
      {/* Reader route outside of layout for fullscreen experience */}
      <Route path="/read/:chapterId" element={<ReadChapter />} />
    </Routes>
  )
}

export default App

