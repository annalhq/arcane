"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Content, Tag } from "@/types";
import { ContentList } from "@/components/content-list";
import { Sidebar } from "@/components/sidebar";
import { ContentForm } from "@/components/content-form";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Plus, List, Grid, AlignLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { getGuestSession } from "@/lib/utils";

export default function Home() {
  const [content, setContent] = useState<Content[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | undefined>(
    undefined
  );
  const [viewMode, setViewMode] = useState<"feed" | "grid" | "flat">("feed");

  const router = useRouter();
  const { data: session } = useSession();
  const guestSession = getGuestSession();
  const isAuthenticated = !!session || guestSession.isAuthenticated;

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

    fetchData();
  }, []);

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
        setContent(
          content.map((item) => (item.id === updated.id ? updated : item))
        );
      }
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setIsFormOpen(true);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleViewMode = () => {
    if (viewMode === "feed") {
      setViewMode("grid");
    } else if (viewMode === "grid") {
      setViewMode("flat");
    } else {
      setViewMode("feed");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-transition">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "ml-0 lg:ml-16"
        }`}
      >
        <header className="border-b sticky top-0 bg-background z-10 theme-transition">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium">arcane</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleViewMode}
                aria-label={`Switch view mode`}
                className={viewMode !== "feed" ? "bg-accent" : ""}
              >
                {viewMode === "feed" ? (
                  <Grid className="h-5 w-5" />
                ) : viewMode === "grid" ? (
                  <AlignLeft className="h-5 w-5" />
                ) : (
                  <List className="h-5 w-5" />
                )}
              </Button>
              <ThemeToggle />
              {isAuthenticated && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  size="icon"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  aria-label="Add new content"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
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
          ) : (
            <ContentList
              initialContent={content}
              tags={tags}
              onEdit={handleEditContent}
              viewMode={viewMode}
            />
          )}
        </main>
      </div>

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
