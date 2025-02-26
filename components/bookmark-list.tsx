"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookmarkCard } from '@/components/bookmark-card'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Bookmark = Database['public']['Tables']['bookmarks']['Row'] & {
  tags: Database['public']['Tables']['tags']['Row'][]
}

export function BookmarkList() {
  const searchParams = useSearchParams()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const view = searchParams.get('view') || 'all'
  const query = searchParams.get('q')

  useEffect(() => {
    async function fetchBookmarks() {
      setLoading(true)
      let query = supabase
        .from('bookmarks')
        .select(`
          *,
          tags (
            id,
            name,
            color
          )
        `)

      if (view === 'favorites') {
        query = query.eq('favorite', true)
      } else if (view === 'read-later') {
        query = query.eq('read_later', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching bookmarks:', error)
        return
      }

      setBookmarks(data as Bookmark[])
      setLoading(false)
    }

    fetchBookmarks()
  }, [view])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  )
}