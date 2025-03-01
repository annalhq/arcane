import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { Content, Tag, Collection } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy');
}

export function filterContent(
  content: Content[],
  searchQuery: string,
  selectedTags: string[],
  selectedCollection?: string
): Content[] {
  return content.filter((item) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by selected tags
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => item.tags.includes(tag));

    // Filter by selected collection
    const matchesCollection =
      !selectedCollection || item.collectionId === selectedCollection;

    return matchesSearch && matchesTags && matchesCollection;
  });
}

export function groupContentByTags(content: Content[]): Record<string, Content[]> {
  const grouped: Record<string, Content[]> = {};
  
  content.forEach(item => {
    item.tags.forEach(tag => {
      if (!grouped[tag]) {
        grouped[tag] = [];
      }
      grouped[tag].push(item);
    });
  });
  
  return grouped;
}

export function getNestedCollections(collections: Collection[]): Record<string, Collection[]> {
  const rootCollections = collections.filter(c => !c.parentId);
  const result: Record<string, Collection[]> = {};
  
  rootCollections.forEach(root => {
    result[root.id] = collections.filter(c => c.parentId === root.id);
  });
  
  return result;
}

export function buildCollectionTree(collections: Collection[]): Collection[] {
  const rootCollections = collections.filter(c => !c.parentId);
  
  return rootCollections;
}

export function findCollectionById(collections: Collection[], id: string): Collection | undefined {
  return collections.find(c => c.id === id);
}