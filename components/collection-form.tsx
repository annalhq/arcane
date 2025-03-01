"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collection } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: Omit<Collection, "id">) => void;
  collection?: Collection;
  parentCollections?: Collection[];
}

export function CollectionForm({ 
  isOpen, 
  onClose, 
  onSave, 
  collection, 
  parentCollections = [] 
}: CollectionFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allParentCollections, setAllParentCollections] = useState<Collection[]>(parentCollections);
  
  const router = useRouter();

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || "");
      setParentId(collection.parentId);
    } else {
      resetForm();
    }
  }, [collection, isOpen]);

  useEffect(() => {
    if (parentCollections.length === 0) {
      const fetchCollections = async () => {
        try {
          const response = await fetch("/api/collections");
          if (response.ok) {
            const data = await response.json();
            // Filter out the current collection to prevent circular references
            const filteredCollections = collection 
              ? data.filter((c: Collection) => c.id !== collection.id) 
              : data;
            setAllParentCollections(filteredCollections);
          }
        } catch (error) {
          console.error("Error fetching collections:", error);
        }
      };
      
      fetchCollections();
    }
  }, [parentCollections, collection]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setParentId(undefined);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSave({
      name,
      description: description || undefined,
      parentId,
    });
    
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{collection ? "Edit Collection" : "Add New Collection"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter collection name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="parentId">Parent Collection (optional)</Label>
            <Select 
              value={parentId} 
              onValueChange={setParentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {allParentCollections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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