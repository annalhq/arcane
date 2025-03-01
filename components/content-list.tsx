"use client";

import { useState, useEffect } from "react";
import { Content, Tag } from "@/types";
import { ExternalLink, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { ContentCard } from "@/components/content-card";

interface ContentListProps {
  initialContent?: Content[];
  tags: Tag[];
  onEdit?: (content: Content) => void;
  onDelete?: (id: string) => void;
  viewMode?: "feed" | "grid";
}

export function ContentList({
  initialContent,
  tags,
  onEdit,
  onDelete,
  viewMode = "feed",
}: ContentListProps) {
  const [content, setContent] = useState<Content[]>(initialContent || []);
  const [isLoading, setIsLoading] = useState(!initialContent);

  const { data: session } = useSession();
  const isAuthenticated = !!session;

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/content");
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [initialContent]);

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) return;

    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedContent = content.filter((item) => item.id !== id);
        setContent(updatedContent);

        if (onDelete) {
          onDelete(id);
        }
      }
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handleToggleStar = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`/api/content/star?id=${id}`, {
        method: "PUT",
      });

      if (response.ok) {
        const updatedContent = await response.json();
        setContent(
          content.map((item) => (item.id === id ? updatedContent : item))
        );
      }
    } catch (error) {
      console.error("Error toggling star status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4 animate-pulse">
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
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="content-grid">
        {content.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            tags={tags}
            onEdit={onEdit || (() => {})}
            onDelete={handleDelete}
            onToggleStar={handleToggleStar}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="content-feed">
      {content.map((item) => (
        <Card key={item.id} className="content-feed-item">
          <CardHeader className="pb-2 relative">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium leading-tight">
                {item.title}
              </h3>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${
                    item.starred ? "text-yellow-500" : "text-muted-foreground"
                  }`}
                  onClick={() => handleToggleStar(item.id)}
                  aria-label={item.starred ? "Unstar" : "Star"}
                >
                  <Star
                    className="h-4 w-4"
                    fill={item.starred ? "currentColor" : "none"}
                  />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(item.createdAt)}
            </p>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground mb-4">
              {item.description}
            </p>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-1 hover:underline text-sm mt-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate max-w-[300px]">{item.url}</span>
              </a>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start pt-0">
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.map((tagName) => {
                const tag = tags.find((t) => t.name === tagName);
                if (!tag) return null;
                return (
                  <span
                    key={tagName}
                    className="inline-flex items-center px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: tag.color,
                      color: "rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    {tagName}
                  </span>
                );
              })}
            </div>
            {isAuthenticated && (
              <div className="flex justify-end w-full gap-2 mt-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="h-8"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
