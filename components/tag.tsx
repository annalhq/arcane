import { cn } from "@/lib/utils";
import { Tag as TagType } from "@/types";

interface TagProps {
  tag: TagType;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function Tag({ tag, onClick, selected, className }: TagProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2 py-1 text-xs rounded-full transition-all theme-transition",
        "hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2",
        selected && "ring-2 ring-offset-2 ring-primary",
        className
      )}
      style={{
        backgroundColor: tag.color,
        color: "rgba(0, 0, 0, 0.7)",
        boxShadow: selected ? "0 0 0 1px rgba(0, 0, 0, 0.1)" : "none",
      }}
    >
      {tag.name}
    </button>
  );
}
