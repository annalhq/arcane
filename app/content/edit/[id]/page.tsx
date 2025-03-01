"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Content, Tag, Collection } from "@/types";
import { Menu, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tag as TagComponent } from "@/components/tag";
import { useSession } from "next-auth/react";

export default function EditContentPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<Content | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<Tag[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const [contentResponse, tagsResponse, collectionsResponse] = await Promise.all([
          fetch(`/api/content?id=${params.id}`),
          fetch("/api/tags"),
          fetch("/api/collections")
        ]);

        if (contentResponse.ok && tagsResponse.ok && collectionsResponse.ok) {
          const contentData = await contentResponse.json();
          const tagsData = await tagsResponse.json();
          const collectionsData = await collectionsResponse.json();
          
          // If contentData is an array, find the content with the matching ID
          const targetContent = Array.isArray(contentData) 
            ? contentData.find((c: Content) => c.id === params.id)
            : contentData;
          
          if (targetContent) {
            setContent(targetContent);
            setTitle(targetContent.title);
            setUrl(targetContent.url || "");
            setDescription(targetContent.description);
            setSelectedTags(targetContent.tags);
            setSelectedCollection(targetContent.collectionId);
          } else {
            console.error("Content not found");
            router.push("/");
          }
          
          setTags(tagsData);
          setCollections(collectionsData);
        } else {
          console.error("Error fetching data");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/");
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchData();
  }, [params.id, router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !validateForm()) return;
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: content.id,
          title,
          url: url || undefined,
          description,
          tags: selectedTags,
          starred: content.starred,
          createdAt: content.createdAt,
          collectionId: selectedCollection || undefined,
        }),
      });
      
      if (response.ok) {
        if (selectedCollection) {
          router.push(`/collections/${selectedCollection}`);
        } else {
          router.push("/");
        }
      } else {
        const error = await response.json();
        console.error("Error updating content:", error);
      }
    } catch (error) {
      console.error("Error updating content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || status === "unauthenticated")
    return null;
}