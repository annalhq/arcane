"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Tag, 
  Search, 
  X, 
  Plus,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Collection, Tag as TagType } from "@/types";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [tags, setTags] = useState<TagType[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [nestedCollections, setNestedCollections] = useState<Record<string, Collection[]>>({});
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsResponse, collectionsResponse] = await Promise.all([
          fetch("/api/tags"),
          fetch("/api/collections")
        ]);

        if (tagsResponse.ok && collectionsResponse.ok) {
          const tagsData = await tagsResponse.json();
          const collectionsData = await collectionsResponse.json();
          
          setTags(tagsData);
          setCollections(collectionsData);
          
          // Create nested collections structure
          const rootCollections = collectionsData.filter((c: Collection) => !c.parentId);
          const nested: Record<string, Collection[]> = {};
          
          rootCollections.forEach((root: Collection) => {
            nested[root.id] = collectionsData.filter((c: Collection) => c.parentId === root.id);
          });
          
          setNestedCollections(nested);
          
          // Initialize expanded state
          const expanded: Record<string, boolean> = {};
          rootCollections.forEach((root: Collection) => {
            expanded[root.id] = false;
          });
          
          setExpandedCollections(expanded);
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };

    fetchData();
  }, []);

  const toggleCollectionExpand = (id: string) => {
    setExpandedCollections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleTagSelect = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleCollectionSelect = (id: string) => {
    setSelectedCollection(id === selectedCollection ? null : id);
    router.push(`/collections/${id}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.append("query", searchQuery);
    }
    
    selectedTags.forEach(tag => {
      params.append("tags", tag);
    });
    
    if (selectedCollection) {
      params.append("collection", selectedCollection);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedCollection(null);
  };

  const handleAddCollection = () => {
    if (isAuthenticated) {
      router.push("/collections/new");
    }
  };

  const handleAddContent = () => {
    if (isAuthenticated) {
      router.push("/content/new");
    }
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full w-64 transform bg-background border-r transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Content Library</h2>
          <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
            <Button size="sm" variant="ghost" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {(searchQuery || selectedTags.length > 0 || selectedCollection) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs mt-1"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Tags Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Tags</h3>
          </div>
          <div className="space-y-1">
            {tags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => handleTagSelect(tag.name)}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1 text-sm transition-colors",
                  selectedTags.includes(tag.name)
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Tag className="mr-2 h-4 w-4" style={{ color: tag.color }} />
                <span>{tag.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Collections Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Collections</h3>
            {isAuthenticated && (
              <Button variant="ghost" size="icon" onClick={handleAddCollection} className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {collections
              .filter(c => !c.parentId)
              .map((collection) => (
                <div key={collection.id}>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleCollectionExpand(collection.id)}
                      className="mr-1 p-1 hover:bg-muted rounded-md"
                    >
                      {expandedCollections[collection.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCollectionSelect(collection.id)}
                      className={cn(
                        "flex flex-1 items-center rounded-md px-2 py-1 text-sm transition-colors",
                        selectedCollection === collection.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {expandedCollections[collection.id] ? (
                        <FolderOpen className="mr-2 h-4 w-4" />
                      ) : (
                        <Folder className="mr-2 h-4 w-4" />
                      )}
                      <span>{collection.name}</span>
                    </button>
                  </div>
                  
                  {expandedCollections[collection.id] && nestedCollections[collection.id] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {nestedCollections[collection.id].map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleCollectionSelect(child.id)}
                          className={cn(
                            "flex w-full items-center rounded-md px-2 py-1 text-sm transition-colors",
                            selectedCollection === child.id
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <Folder className="mr-2 h-4 w-4" />
                          <span>{child.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="mt-auto">
          {isAuthenticated && (
            <Button 
              variant="outline" 
              className="w-full mb-2"
              onClick={handleAddContent}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={() => router.push("/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}