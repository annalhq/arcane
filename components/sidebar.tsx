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
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Collection, Tag as TagType } from "@/types";
import { cn, getSidebarState, setSidebarState } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getGuestSession } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [tags, setTags] = useState<TagType[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [nestedCollections, setNestedCollections] = useState<
    Record<string, Collection[]>
  >({});
  const [expandedCollections, setExpandedCollections] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const guestSession = getGuestSession();
  const isAuthenticated = !!session || guestSession.isAuthenticated;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = getSidebarState();
    if (savedState !== isOpen) {
      onToggle();
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    setSidebarState(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsResponse, collectionsResponse] = await Promise.all([
          fetch("/api/tags"),
          fetch("/api/collections"),
        ]);

        if (tagsResponse.ok && collectionsResponse.ok) {
          const tagsData = await tagsResponse.json();
          const collectionsData = await collectionsResponse.json();

          setTags(tagsData);
          setCollections(collectionsData);

          // Create nested collections structure
          const rootCollections = collectionsData.filter(
            (c: Collection) => !c.parentId
          );
          const nested: Record<string, Collection[]> = {};

          rootCollections.forEach((root: Collection) => {
            nested[root.id] = collectionsData.filter(
              (c: Collection) => c.parentId === root.id
            );
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
    setExpandedCollections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTagSelect = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
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

    selectedTags.forEach((tag) => {
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

  const sidebarContent = (
    <div className="flex h-full flex-col overflow-y-auto p-4 bg-background text-foreground theme-transition">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">menu</h2>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
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
                "flex w-full items-center rounded-md px-2 py-1 text-sm transition-colors theme-transition",
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddCollection}
              className="h-6 w-6"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="space-y-1">
          {collections
            .filter((c) => !c.parentId)
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
                      "flex flex-1 items-center rounded-md px-2 py-1 text-sm transition-colors theme-transition",
                      selectedCollection === collection.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {expandedCollections[collection.id] ? (
                      <FolderOpen className="mr-2 h-4 w-4 text-primary" />
                    ) : (
                      <Folder className="mr-2 h-4 w-4 text-primary" />
                    )}
                    <span>{collection.name}</span>
                  </button>
                </div>

                {expandedCollections[collection.id] &&
                  nestedCollections[collection.id] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {nestedCollections[collection.id].map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleCollectionSelect(child.id)}
                          className={cn(
                            "flex w-full items-center rounded-md px-2 py-1 text-sm transition-colors theme-transition",
                            selectedCollection === child.id
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <Folder className="mr-2 h-4 w-4 text-primary" />
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
            className="w-full mb-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed top-4 left-4 z-40 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={isOpen} onOpenChange={onToggle}>
          <SheetContent side="left" className="p-0 w-[280px] border-r">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full w-64 transform bg-background border-r sidebar-transition theme-transition",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-16"
      )}
    >
      {isOpen ? (
        sidebarContent
      ) : (
        <div className="p-4 flex flex-col h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="mb-6 self-end"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <Folder className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/search")}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          {isAuthenticated && (
            <Button
              variant="outline"
              size="icon"
              className="mt-auto mb-4 self-center"
              onClick={handleAddContent}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
