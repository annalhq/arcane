"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Content, Tag } from "@/types";
import { ContentCard } from "@/components/content-card";
import { ContentForm } from "@/components/content-form";
import { SearchBar } from "@/components/search-bar";
import { TagFilter } from "@/components/tag-filter";
import { EmptyState } from "@/components/empty-state";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut } from "lucide-react";
import { filterContent } from "@/lib/utils";

export default function Home() {
  const [content, setContent] = useState<Content[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        });

        if (response.status === 401) {
          router.push("/login");
        } else if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [contentResponse, tagsResponse] = await Promise.all([
          fetch("/api/content"),
          fetch("/api/tags"),
        ]);

        if (contentResponse.ok && tagsResponse.ok) {
          const contentData = await contentResponse.json();
          const tagsData = await tagsResponse.json();

          setContent(contentData);
          setTags(tagsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setFilteredContent(filterContent(content, searchQuery, selectedTags));
  }, [content, searchQuery, selectedTags]);

  const handleAddContent = async (
    newContent: Omit<Content, "id" | "createdAt">
  ) => {
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContent),
      });

      if (response.ok) {
        const addedContent = await response.json();
        setContent((prev) => [...prev, addedContent]);
      }
    } catch (error) {
      console.error("Error adding content:", error);
    }
  };

  const handleUpdateContent = async (updatedContent: Content) => {
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedContent),
      });

      if (response.ok) {
        const updated = await response.json();
        setContent((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      }
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm("are you sure you want to delete this content?")) return;

    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setContent((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handleToggleStar = async (id: string) => {
    try {
      const response = await fetch(`/api/content/star?id=${id}`, {
        method: "PUT",
      });

      if (response.ok) {
        const updated = await response.json();
        setContent((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      }
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSearchQuery("");
  };

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setIsFormOpen(true);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-xl font-medium">content library</h1>

          <div className="flex items-center gap-2">
            <SearchBar onSearch={setSearchQuery} />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <TagFilter
            tags={tags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onClearFilters={handleClearFilters}
          />

          <Button
            onClick={() => {
              setEditingContent(undefined);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            add content
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        ) : filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                tags={tags}
                onEdit={handleEditContent}
                onDelete={handleDeleteContent}
                onToggleStar={handleToggleStar}
              />
            ))}
          </div>
        ) : content.length > 0 ? (
          <EmptyState type="no-results" />
        ) : (
          <EmptyState
            type="no-content"
            onAddContent={() => {
              setEditingContent(undefined);
              setIsFormOpen(true);
            }}
          />
        )}
      </main>

      <ContentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingContent(undefined);
        }}
        onSave={
          editingContent
            ? (data) =>
                handleUpdateContent({
                  ...data,
                  id: editingContent.id,
                  createdAt: editingContent.createdAt,
                })
            : handleAddContent
        }
        content={editingContent}
        tags={tags}
      />
    </div>
  );
}
