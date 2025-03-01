"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Content, Tag } from "@/types";
import { ContentList } from "@/components/content-list";
import { Sidebar } from "@/components/sidebar";
import { ContentForm } from "@/components/content-form";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, Plus, List, Grid } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Home() {
  const [content, setContent] = useState<Content[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"feed" | "grid">("feed");
  
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session;

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

  const handleAddContent = async (newContent: Omit<Content, "id" | "createdAt">) => {
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

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setIsFormOpen(true);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "feed" ? "grid" : "feed");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      
      <div className={`transition-all duration-200 ${isSidebarOpen ? "lg:ml-64" : "ml-0"}`}>
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-medium">Content Library</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleViewMode}
                aria-label={`Switch to ${viewMode === "feed" ? "grid" : "feed"} view`}
              >
                {viewMode === "feed" ? <Grid className="h-5 w-5" /> : <List className="h-5 w-5" />}
              </Button>
              <ThemeToggle />
              {isAuthenticated && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
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