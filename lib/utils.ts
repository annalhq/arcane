import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { Content, Tag } from '@/types';

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
  selectedTags: string[]
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
      selectedTags.every((tag) => item.tags.includes(tag));

    return matchesSearch && matchesTags;
  });
}