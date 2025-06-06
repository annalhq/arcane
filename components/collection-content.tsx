"use client";

import { useState, useEffect } from "react";
import { Content, Collection, Tag } from "@/types";
import { ContentList } from "@/components/content-list";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getGuestSession } from "@/lib/utils";

interface CollectionContentProps {
  collectionId: string;
}

export function CollectionContent({ collectionId }: CollectionContentProps) {
  const [content, setContent] = useState<Content[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"feed" | "grid">("feed");

  const router = useRouter();
  const { data: session } = useSession();
  const guestSession = getGuestSession();
  const isAuthenticated = !!session || guestSession.isAuthenticated;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [contentResponse, tagsResponse, collectionResponse] =
          await Promise.all([
            fetch(`/api/content?collectionId=${collectionId}`),
            fetch("/api/tags"),
            fetch(`/api/collections?id=${collectionId}`),
          ]);

        if (contentResponse.ok && tagsResponse.ok && collectionResponse.ok) {
          const contentData = await contentResponse.json();
          const tagsData = await tagsResponse.json();
          const collectionsData = await collectionResponse.json();

          setContent(contentData);
          setTags(tagsData);

          // Find the current collection
          if (Array.isArray(collectionsData)) {
            const currentCollection = collectionsData.find(
              (c: Collection) => c.id === collectionId
            );
            setCollection(currentCollection || null);
          } else {
            setCollection(collectionsData);
          }
        }
      } catch (error) {
        console.error("Error fetching collection data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (collectionId) {
      fetchData();
    }
  }, [collectionId]);

  const handleEditContent = (content: Content) => {
    if (isAuthenticated) {
      router.push(`/content/edit/${content.id}`);
    }
  };

  const handleDeleteContent = async (id: string) => {
    // ContentList component handles the deletion
    setContent(content.filter((item) => item.id !== id));
  };

  const handleAddContent = () => {
    if (isAuthenticated) {
      router.push(`/content/new?collectionId=${collectionId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-catppuccin-surface0 rounded"></div>
        <div className="h-4 w-full max-w-md bg-catppuccin-surface0 rounded"></div>
        <div className="h-96 bg-catppuccin-surface0 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2 text-catppuccin-subtext0 hover:text-catppuccin-text"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-catppuccin-text">
            {collection?.name || "Collection"}
          </h1>
          {collection?.description && (
            <p className="text-catppuccin-subtext1 mt-1">
              {collection.description}
            </p>
          )}
        </div>

        {isAuthenticated && (
          <Button
            onClick={handleAddContent}
            className="bg-catppuccin-mauve text-catppuccin-base hover:bg-catppuccin-pink"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        )}
      </div>

      {content.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-catppuccin-surface0 bg-catppuccin-mantle">
          <p className="text-catppuccin-subtext0 mb-4">
            No content in this collection
          </p>
          {isAuthenticated && (
            <Button
              onClick={handleAddContent}
              className="bg-catppuccin-mauve text-catppuccin-base hover:bg-catppuccin-pink"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          )}
        </div>
      ) : (
        <ContentList
          initialContent={content}
          tags={tags}
          onEdit={isAuthenticated ? handleEditContent : undefined}
          onDelete={handleDeleteContent}
          viewMode={viewMode}
        />
      )}
    </div>
  );
}
