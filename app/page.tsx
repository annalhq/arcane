import { BookmarkList } from '@/components/bookmark-list'
import { Header } from '@/components/header'
import { AddBookmarkButton } from '@/components/add-bookmark-button'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Header />
        <BookmarkList />
        <AddBookmarkButton />
      </div>
    </div>
  )
}