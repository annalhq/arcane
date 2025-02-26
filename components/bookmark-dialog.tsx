"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

interface BookmarkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark;
}

export function BookmarkDialog({
  isOpen,
  onOpenChange,
  bookmark,
}: BookmarkDialogProps) {
  const [title, setTitle] = useState(bookmark?.title || "");
  const [description, setDescription] = useState(bookmark?.description || "");
  const [url, setUrl] = useState(bookmark?.urls[0] || "");
  const [favorite, setFavorite] = useState(bookmark?.favorite || false);
  const [readLater, setReadLater] = useState(bookmark?.read_later || false);
  const [tags, setTags] = useState<string[]>(bookmark?.tags || []);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase.from("tags").select("name");
      if (data) {
        setExistingTags(data.map((tag) => tag.name));
      }
    };
    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      toast.error("You are not authenticated");
      setIsLoading(false);
      return;
    }

    const bookmarkData = {
      title,
      description,
      urls: [url],
      favorite,
      read_later: readLater,
      tags,
    };

    try {
      if (bookmark) {
        const { error } = await supabase
          .from("bookmarks")
          .update(bookmarkData)
          .eq("id", bookmark.id);

        if (error) throw error;
        toast.success("bookmark updated");
      } else {
        const { error } = await supabase.from("bookmarks").insert(bookmarkData);

        if (error) throw error;
        toast.success("bookmark created");
      }

      onOpenChange(false);
    } catch (error) {
      toast.error("failed to save bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bookmark ? "Edit" : "Add"} Bookmark</DialogTitle>
          <DialogDescription>
            {bookmark
              ? "Update the bookmark details"
              : "Add a new bookmark to your collection"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (Markdown supported)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags.join(", ")}
              onChange={(e) =>
                setTags(e.target.value.split(",").map((tag) => tag.trim()))
              }
              placeholder="Comma separated tags"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {existingTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  onClick={() =>
                    setTags((prevTags) => [...new Set([...prevTags, tag])])
                  }
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="favorite"
                checked={favorite}
                onCheckedChange={setFavorite}
              />
              <Label htmlFor="favorite">Favorite</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="readLater"
                checked={readLater}
                onCheckedChange={setReadLater}
              />
              <Label htmlFor="readLater">Read Later</Label>
            </div>
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? "Saving..." : bookmark ? "Update" : "Create"} Bookmark
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
