import { Card, CardContent } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Link } from "react-router-dom"

const dummyManga = Array(20).fill(null).map((_, i) => ({
  id: `manga-${i}`,
  title: `Latest Shinigami Manga ${i + 1}`,
  chapter: `Chapter ${100 - i}`,
  cover: "https://placehold.co/300x450/2a2a2a/ffffff?text=Cover",
}))

export default function LatestManga() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Latest Updates</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
        {dummyManga.map((manga) => (
          <Link to={`/manga/${manga.id}`} key={manga.id}>
            <Card className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border-none shadow-none overflow-hidden group">
              <div className="w-full aspect-[2/3] bg-muted relative rounded-md overflow-hidden">
                <img src={manga.cover} alt={manga.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
              </div>
              <CardContent className="p-0 pt-2 flex flex-col gap-1">
                <h3 className="font-semibold line-clamp-1 text-sm md:text-base">{manga.title}</h3>
                <p className="text-xs text-primary font-medium">{manga.chapter}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Pagination className="mt-8 justify-center">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem className="hidden sm:inline-block">
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem className="hidden sm:inline-block">
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
