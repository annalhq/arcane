"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkDialog } from "@/components/bookmark-dialog";

export function AddBookmarkButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
      <BookmarkDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
