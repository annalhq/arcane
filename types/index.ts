export interface Content {
  id: string;
  title: string;
  url?: string;
  description: string;
  tags: string[];
  createdAt: string;
  starred: boolean;
  collectionId?: string;
}

export interface Tag {
  name: string;
  color: string;
}

export interface Collection {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
}

export interface User {
  isAuthenticated: boolean;
}