"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tag } from "@/components/tag";
import { Content as ContentType, Tag as TagType } from "@/types";
import { Star, ExternalLink, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { getGuestSession } from "@/lib/utils";

interface ContentCardProps {
  content: ContentType;
  tags: TagType[];
  onEdit: (content: ContentType) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export function ContentCard({
  content,
  tags,
  onEdit,
  onDelete,
  onToggleStar,
}: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { data: session } = useSession();
  const guestSession = getGuestSession();
  const isAuthenticated = !!session || guestSession.isAuthenticated;

  const contentTags = tags.filter((tag) => content.tags.includes(tag.name));

  return (
    <Card
      className="h-full flex flex-col transition-all duration-200 shadow-subtle hover:shadow-md theme-transition"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2 relative">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium leading-tight">{content.title}</h3>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 transition-opacity",
                content.starred ? "text-yellow-500" : "text-muted-foreground",
                !content.starred && !isHovered && "opacity-0"
              )}
              onClick={() => onToggleStar(content.id)}
              aria-label={content.starred ? "Unstar" : "Star"}
            >
              <Star
                className="h-4 w-4"
                fill={content.starred ? "currentColor" : "none"}
              />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(content.createdAt)}
        </p>
      </CardHeader>
      
      <CardFooter className="flex flex-col items-start pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {contentTags.map((tag) => (
            <Tag key={tag.name} tag={tag} />
          ))}
        </div>
        {isAuthenticated && (
          <div
            className={cn(
              "flex gap-2 w-full justify-end transition-opacity",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(content)}
              aria-label="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(content.id)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
