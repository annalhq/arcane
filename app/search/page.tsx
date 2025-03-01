"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Content, Tag } from "@/types";
import { ContentList } from "@/components/content-list";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search as SearchIcon, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tag as TagComponent } from "@/components/tag";

export default function SearchPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("query") || "";
    const tagParams = searchParams.getAll("tags");
    const collection = searchParams.get("collection");

    setSearchQuery(query);
    setSelectedTags(tagParams);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch tags first
        const tagsResponse = await fetch("/api/tags");
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setTags(tagsData);
        }

        // Build search URL
        const searchUrl = new URL("/api/search", window.location.origin);
        if (query) {
          searchUrl.searchParams.append("query", query);
        }

        tagParams.forEach((tag) => {
          searchUrl.searchParams.append("tags", tag);
        });

        if (collection) {
          searchUrl.searchParams.append("collectionId", collection);
        }

        // Fetch search results
        const contentResponse = await fetch(searchUrl.toString());
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setContent(contentData);
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTagSelect = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];

    setSelectedTags(newSelectedTags);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    newSelectedTags.forEach((tag) => {
      params.append("tags", tag);
    });

    router.push(`/search?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery) {
      params.set("query", searchQuery);
    } else {
      params.delete("query");
    }

    router.push(`/search?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("query");
    router.push(`/search?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/search");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      <div
        className={`transition-all duration-200 ${
          isSidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 ml-10 lg:ml-0">
              <h1 className="text-xl font-medium">Search</h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content..."
                  className="pr-8"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button type="submit">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagComponent
                  key={tag.name}
                  tag={tag}
                  selected={selectedTags.includes(tag.name)}
                  onClick={() => handleTagSelect(tag.name)}
                />
              ))}
            </div>

            {(searchQuery || selectedTags.length > 0) && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all filters
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 w-32 bg-muted rounded"></div>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-5 w-3/4 bg-muted rounded"></div>
                      <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : content.length > 0 ? (
            <ContentList initialContent={content} tags={tags} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
