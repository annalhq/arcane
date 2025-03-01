"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Content, Tag, Collection } from "@/types";
import { Tag as TagComponent } from "@/components/tag";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: Omit<Content, "id" | "createdAt">) => void;
  content?: Content;
  tags: Tag[];
  collections?: Collection[];
}

export function ContentForm({ isOpen, onClose, onSave, content, tags, collections = [] }: ContentFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allCollections, setAllCollections] = useState<Collection[]>(collections);
  
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
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{content ? "Edit Content" : "Add New Content"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className={errors.url ? "border-destructive" : ""}
            />
            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className={errors.description ? "border-destructive" : ""}
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="collection">Collection (optional)</Label>
            <Select 
              value={selectedCollection} 
              onValueChange={setSelectedCollection}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
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
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagComponent
                  key={tag.name}
                  tag={tag}
                  selected={selectedTags.includes(tag.name)}
                  onClick={() => handleTagToggle(tag.name)}
                />
              ))}
            </div>
            {errors.tags && <p className="text-xs text-destructive">{errors.tags}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}