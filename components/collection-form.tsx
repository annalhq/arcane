"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Content, Tag, Collection } from "@/types";
import { Tag as TagComponent } from "@/components/tag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: Omit<Content, "id" | "createdAt">) => void;
  content?: Content;
  tags: Tag[];
  collections?: Collection[];
}

export function ContentForm({
  isOpen,
  onClose,
  onSave,
  content,
  tags,
  collections = [],
}: ContentFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<
    string | undefined
  >(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allCollections, setAllCollections] =
    useState<Collection[]>(collections);

  const router = useRouter();

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setUrl(content.url || "");
      setDescription(content.description);
      setSelectedTags(content.tags);
      setSelectedCollection(content.collectionId);
    } else {
      resetForm();
    }
  }, [content, isOpen]);

  useEffect(() => {
    if (collections.length === 0) {
      const fetchCollections = async () => {
        try {
          const response = await fetch("/api/collections");
          if (response.ok) {
            const data = await response.json();
            setAllCollections(data);
          }
        } catch (error) {
          console.error("Error fetching collections:", error);
        }
      };

      fetchCollections();
    }
  }, [collections]);

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setSelectedTags([]);
    setSelectedCollection(undefined);
    setErrors({});
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (selectedTags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    if (url && !isValidUrl(url)) {
      newErrors.url = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSave({
      title,
      url: url || undefined,
      description,
      tags: selectedTags,
      starred: content?.starred || false,
      collectionId: selectedCollection,
    });

    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-catppuccin-mantle border-catppuccin-surface0">
        <DialogHeader>
          <DialogTitle className="text-catppuccin-text">
            {content ? "Edit Content" : "Add New Content"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-catppuccin-text">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className={`bg-catppuccin-base border-catppuccin-surface0 text-catppuccin-text ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url" className="text-catppuccin-text">
              URL (optional)
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className={`bg-catppuccin-base border-catppuccin-surface0 text-catppuccin-text ${
                errors.url ? "border-red-500" : ""
              }`}
            />
            {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-catppuccin-text">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className={`bg-catppuccin-base border-catppuccin-surface0 text-catppuccin-text ${
                errors.description ? "border-red-500" : ""
              }`}
              rows={3}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="collection" className="text-catppuccin-text">
              Collection (optional)
            </Label>
            <Select
              value={selectedCollection}
              onValueChange={setSelectedCollection}
            >
              <SelectTrigger className="bg-catppuccin-base border-catppuccin-surface0 text-catppuccin-text">
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent className="bg-catppuccin-mantle border-catppuccin-surface0 text-catppuccin-text">
                <SelectItem value="">None</SelectItem>
                {allCollections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-catppuccin-text">Tags</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-catppuccin-base border-catppuccin-surface0">
              {tags.map((tag) => (
                <TagComponent
                  key={tag.name}
                  tag={tag}
                  selected={selectedTags.includes(tag.name)}
                  onClick={() => handleTagToggle(tag.name)}
                />
              ))}
            </div>
            {errors.tags && (
              <p className="text-xs text-red-500">{errors.tags}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-catppuccin-surface0 text-catppuccin-text border-catppuccin-surface1 hover:bg-catppuccin-surface1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-catppuccin-mauve text-catppuccin-base hover:bg-catppuccin-pink"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
