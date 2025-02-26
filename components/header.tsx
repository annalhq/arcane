"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookmarkPlus, Star, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const view = searchParams.get("view") || "all";
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  const updateSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  };

  const updateView = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`/?${params.toString()}`);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === "veritas") {
      toast.success("Authenticated successfully");
      setIsAuthDialogOpen(false);
    } else {
      toast.error("Incorrect passphrase");
    }
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">bookmarks</h1>
        <Button onClick={() => setIsAuthDialogOpen(true)}>Authenticate</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="search bookmarks..."
            className="pl-8"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => updateView("all")}
          >
            <BookmarkPlus className="h-4 w-4 mr-2" />
            all
          </Button>
          <Button
            variant={view === "favorites" ? "default" : "outline"}
            size="sm"
            onClick={() => updateView("favorites")}
          >
            <Star className="h-4 w-4 mr-2" />
            favorites
          </Button>
          <Button
            variant={view === "read-later" ? "default" : "outline"}
            size="sm"
            onClick={() => updateView("read-later")}
          >
            <Clock className="h-4 w-4 mr-2" />
            read later
          </Button>
        </div>
      </div>
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Passphrase</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <Input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />
            <Button type="submit">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
