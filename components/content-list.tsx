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
import { getGuestSession } from "@/lib/utils";

interface ContentListProps {
  initialContent?: Content[];
  tags: Tag[];
  onEdit?: (content: Content) => void;
  onDelete?: (id: string) => void;
  viewMode?: "feed" | "grid" | "flat";
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
  const [groupedByTag, setGroupedByTag] = useState<Record<string, Content[]>>(
    {}
  );

  const { data: session } = useSession();
  const guestSession = getGuestSession();
  const isAuthenticated = !!session || guestSession.isAuthenticated;

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);

      // Group content by tags for flat view
      if (viewMode === "flat") {
        const grouped: Record<string, Content[]> = {};
        initialContent.forEach((item) => {
          item.tags.forEach((tag) => {
            if (!grouped[tag]) {
              grouped[tag] = [];
            }
            if (!grouped[tag].find((c) => c.id === item.id)) {
              grouped[tag].push(item);
            }
          });
        });
        setGroupedByTag(grouped);
      }

      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/content");
        if (response.ok) {
          const data = await response.json();
          setContent(data);

          // Group content by tags for flat view
          if (viewMode === "flat") {
            const grouped: Record<string, Content[]> = {};
            data.forEach((item: Content) => {
              item.tags.forEach((tag) => {
                if (!grouped[tag]) {
                  grouped[tag] = [];
                }
                if (!grouped[tag].find((c) => c.id === item.id)) {
                  grouped[tag].push(item);
                }
              });
            });
            setGroupedByTag(grouped);
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [initialContent, viewMode]);

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

  if (viewMode === "flat") {
    return (
      <div className="space-y-8">
        {Object.entries(groupedByTag).map(([tag, items]) => (
          <div key={tag} className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor:
                    tags.find((t) => t.name === tag)?.color || "#ccc",
                }}
              ></span>
              {tag}
            </h2>
            <div className="space-y-1 pl-5">
              {items.map((item) => (
                <div key={item.id} className="flat-feed-item">
                  <h3 className="flat-feed-item-title">{item.title}</h3>
                  <p className="flat-feed-item-description">
                    {item.description}
                  </p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flat-feed-item-url"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate max-w-[300px]">{item.url}</span>
                    </a>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                    {isAuthenticated && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleToggleStar(item.id)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              item.starred
                                ? "fill-yellow-500 text-yellow-500"
                                : ""
                            }`}
                          />
                        </Button>
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
        <Card key={item.id} className="content-feed-item theme-transition">
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
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[300px] inline-block">
                  {item.url}
                </span>
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
