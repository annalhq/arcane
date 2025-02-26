"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, ArrowUpRight } from "lucide-react";
import Markdown from "markdown-to-jsx";
import type { Database } from "@/lib/supabase/types";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"] & {
  tags: Database["public"]["Tables"]["tags"]["Row"][];
};

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const description = bookmark.description || "";
  const shouldTruncate = description.length > 150;
  const displayDescription =
    shouldTruncate && !showFullDescription
      ? description.slice(0, 150) + "..."
      : description;

  return (
    <Card className="group relative border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow transition-all duration-200">
      <CardHeader className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {bookmark.title}
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            {bookmark.favorite && (
              <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
            )}
            {bookmark.read_later && <Clock className="h-4 w-4 text-blue-500" />}
          </div>
        </div>
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {bookmark.tags.map((tag) => (
              <Badge
                key={tag.id}
                className="text-xs px-2 py-0.5 font-normal"
                style={{ backgroundColor: tag.color, color: "white" }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 py-2">
        {bookmark.description && (
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 text-sm">
            <Markdown>{displayDescription}</Markdown>
            {shouldTruncate && (
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? "Show less" : "Read more"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-2 flex-wrap w-full">
          {bookmark.urls.map((url, index) => {
            const hostname = new URL(url).hostname.replace("www.", "");
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-800"
                onClick={() => window.open(url, "_blank")}
              >
                <ArrowUpRight className="h-3 w-3 mr-1.5" />
                {hostname}
              </Button>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
