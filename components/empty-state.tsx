import { Button } from "@/components/ui/button"
import { PlusCircle, Search, FileQuestion } from "lucide-react"

interface EmptyStateProps {
  type: "no-content" | "no-results"
  onAddContent?: () => void
}

export function EmptyState({ type, onAddContent }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {type === "no-content" ? (
        <>
          <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">no content yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            you haven&apos;t added any content yet. start by adding your first item.
          </p>
          {onAddContent && (
            <Button onClick={onAddContent}>
              <PlusCircle className="h-4 w-4 mr-2" />
              add content
            </Button>
          )}
        </>
      ) : (
        <>
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">no results found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            we couldn&apos;t find any content matching your search or filters. try adjusting your criteria.
          </p>
        </>
      )}
    </div>
  )
}