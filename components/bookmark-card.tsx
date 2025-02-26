"use client"

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, ExternalLink, Edit, Trash } from 'lucide-react'
import Markdown from 'markdown-to-jsx'
import type { Database } from '@/lib/supabase/types'

type Bookmark = Database['public']['Tables']['bookmarks']['Row'] & {
  tags: Database['public']['Tables']['tags']['Row'][]
}

interface BookmarkCardProps {
  bookmark: Bookmark
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)

  const description = bookmark.description || ''
  const shouldTruncate = description.length > 150
  const displayDescription = shouldTruncate && !showFullDescription
    ? description.slice(0, 150) + '...'
    : description

  return (
    <Card className="group relative">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium leading-none">
            {bookmark.title}
          </h3>
          <div className="flex gap-1">
            {bookmark.favorite && (
              <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
            )}
            {bookmark.read_later && (
              <Clock className="h-4 w-4 text-blue-500" />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {bookmark.tags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color }}
              className="text-white"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookmark.description && (
          <div className="prose prose-sm max-w-none">
            <Markdown>{displayDescription}</Markdown>
            {shouldTruncate && (
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'show less' : 'read more'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {bookmark.urls.map((url, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              {new URL(url).hostname}
            </Button>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}