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

// Sidebar state persistence
export function getSidebarState(): boolean {
  if (typeof window === 'undefined') return false;
  const state = localStorage.getItem('sidebarOpen');
  return state === 'true';
}

export function setSidebarState(isOpen: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sidebarOpen', isOpen.toString());
}

// Guest authentication helpers
export function generateGuestUsername(): string {
  const adjectives = [
    'Happy', 'Clever', 'Brave', 'Calm', 'Eager',
    'Gentle', 'Jolly', 'Kind', 'Lively', 'Proud'
  ];

  const nouns = [
    'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox',
    'Rabbit', 'Wolf', 'Hawk', 'Bear', 'Lion'
  ];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);

  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

export function setGuestSession(username: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('guestUsername', username);
  sessionStorage.setItem('isGuestAuthenticated', 'true');
}

export function getGuestSession(): { username: string | null; isAuthenticated: boolean } {
  if (typeof window === 'undefined')
    return { username: null, isAuthenticated: false };

  const username = sessionStorage.getItem('guestUsername');
  const isAuthenticated = sessionStorage.getItem('isGuestAuthenticated') === 'true';

  return { username, isAuthenticated };
}

export function clearGuestSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('guestUsername');
  sessionStorage.removeItem('isGuestAuthenticated');
}