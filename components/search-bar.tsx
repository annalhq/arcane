"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch: (query: string) => void
  className?: string
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState("")
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query)
    }, 300)
    
    return () => clearTimeout(debounceTimer)
  }, [query, onSearch])
  
  const handleClear = () => {
    setQuery("")
    onSearch("")
  }
  
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="search content..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 pr-9 h-10 w-full max-w-md"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}