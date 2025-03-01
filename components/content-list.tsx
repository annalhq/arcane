"use client";

import { useState, useEffect } from "react";
import { Content, Tag } from "@/types";
import { ExternalLink, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { groupContentByTags } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface ContentListProps {
  initialContent?: Content[];
  tags: Tag[];
  onEdit?: (content: Content) => void;
  onDelete?: (id: string) => void;
}

export function ContentList({ initialContent, tags, onEdit, onDelete }: ContentListProps) {
  const [content, setContent] = useState<Content[]>(initialContent || []);
  const [groupedContent, setGroupedContent] = useState<Record<string, Content[]>>({});
  const [isLoading, setIsLoading] = useState(!initialContent);
  
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      setGroupedContent(groupContentByTags(initialContent));
      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/content");
        if (response.ok) {
          const data = await response.json();
          setContent(data);
          setGroupedContent(groupContentByTags(data));
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
        const updatedContent = content.filter(item => item.id !== id);
        setContent(updatedContent);
        setGroupedContent(groupContentByTags(updatedContent));
        
        if (onDelete) {
          onDelete(id);
        }
      }
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const getTagColor = (tagName: string): string => {
    const tag = tags.find(t => t.name === tagName);
    return tag?.color || "#e5e5e5";
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

  return (
    <div className="space-y-8">
      {Object.entries(groupedContent).map(([tag, items]) => (
        <div key={tag} className="space-y-4">
          <h2 className="text-xl font-medium border-b pb-2" style={{ borderColor: getTagColor(tag) }}>
            {tag}
          </h2>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium leading-tight">{item.title}</h3>
                  {isAuthenticated && (
                    <div className="flex space-x-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">{item.description}</p>
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
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}