"use client"

import { useState } from "react"
import { Tag as TagType } from "@/types"
import { Tag } from "@/components/tag"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TagFilterProps {
  tags: TagType[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  onClearFilters: () => void
}

export function TagFilter({ tags, selectedTags, onTagSelect, onClearFilters }: TagFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map(tag => (
        <Tag
          key={tag.name}
          tag={tag}
          selected={selectedTags.includes(tag.name)}
          onClick={() => onTagSelect(tag.name)}
        />
      ))}
      
      {selectedTags.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onClearFilters}
        >
          <X className="h-3 w-3 mr-1" />
          clear filters
        </Button>
      )}
    </div>
  )
}