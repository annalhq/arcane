export interface Content {
  id: string;
  title: string;
  url?: string;
  description: string;
  tags: string[];
  createdAt: string;
  starred: boolean;
}

export interface Tag {
  name: string;
  color: string;
}

export interface User {
  isAuthenticated: boolean;
}