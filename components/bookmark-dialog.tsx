"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/types'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

interface BookmarkDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  bookmark?: Bookmark
}

export function BookmarkDialog({ isOpen, onOpenChange, bookmark }: BookmarkDialogProps) {
  const [title, setTitle] = useState(bookmark?.title || '')
  const [description, setDescription] = useState(bookmark?.description || '')
  const [url, setUrl] = useState(bookmark?.urls[0] || '')
  const [favorite, setFavorite] = useState(bookmark?.favorite || false)
  const [readLater, setReadLater] = useState(bookmark?.read_later || false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const bookmarkData = {
      title,
      description,
      urls: [url],
      favorite,
      read_later: readLater,
    }

    try {
      if (bookmark) {
        const { error } = await supabase
          .from('bookmarks')
          .update(bookmarkData)
          .eq('id', bookmark.id)

        if (error) throw error
        toast.success('bookmark updated')
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert(bookmarkData)

        if (error) throw error
        toast.success('bookmark created')
      }

      onOpenChange(false)
    } catch (error) {
      toast.error('failed to save bookmark')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bookmark ? 'edit' : 'add'} bookmark</DialogTitle>
          <DialogDescription>
            {bookmark ? 'update the bookmark details' : 'add a new bookmark to your collection'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">url</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">description (markdown supported)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="favorite"
                checked={favorite}
                onCheckedChange={setFavorite}
              />
              <Label htmlFor="favorite">favorite</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="readLater"
                checked={readLater}
                onCheckedChange={setReadLater}
              />
              <Label htmlFor="readLater">read later</Label>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {bookmark ? 'update' : 'create'} bookmark
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}