import fs from 'fs';
import path from 'path';
import { Content, Tag, Collection } from '@/types';

const contentPath = path.join(process.cwd(), 'data/content.json');
const tagsPath = path.join(process.cwd(), 'data/tags.json');
const collectionsPath = path.join(process.cwd(), 'data/collections.json');

export function getAllContent(): Content[] {
  try {
    const fileContents = fs.readFileSync(contentPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading content file:', error);
    return [];
  }
}

export function getAllTags(): Tag[] {
  try {
    const fileContents = fs.readFileSync(tagsPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading tags file:', error);
    return [];
  }
}

export function getAllCollections(): Collection[] {
  try {
    const fileContents = fs.readFileSync(collectionsPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading collections file:', error);
    return [];
  }
}

export function saveContent(content: Content[]): void {
  try {
    fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving content:', error);
  }
}

export function saveCollections(collections: Collection[]): void {
  try {
    fs.writeFileSync(collectionsPath, JSON.stringify(collections, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving collections:', error);
  }
}

export function addContent(content: Omit<Content, 'id' | 'createdAt'>): Content {
  const allContent = getAllContent();
  const newContent: Content = {
    ...content,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  allContent.push(newContent);
  saveContent(allContent);
  return newContent;
}

export function updateContent(updatedContent: Content): Content {
  const allContent = getAllContent();
  const index = allContent.findIndex(item => item.id === updatedContent.id);
  
  if (index !== -1) {
    allContent[index] = updatedContent;
    saveContent(allContent);
    return updatedContent;
  }
  
  throw new Error(`Content with id ${updatedContent.id} not found`);
}

export function deleteContent(id: string): void {
  const allContent = getAllContent();
  const filteredContent = allContent.filter(item => item.id !== id);
  
  if (filteredContent.length < allContent.length) {
    saveContent(filteredContent);
  } else {
    throw new Error(`Content with id ${id} not found`);
  }
}

export function toggleStarred(id: string): Content {
  const allContent = getAllContent();
  const index = allContent.findIndex(item => item.id === id);
  
  if (index !== -1) {
    allContent[index].starred = !allContent[index].starred;
    saveContent(allContent);
    return allContent[index];
  }
  
  throw new Error(`Content with id ${id} not found`);
}

export function getContentByTag(tag: string): Content[] {
  const allContent = getAllContent();
  return allContent.filter(item => item.tags.includes(tag));
}

export function getContentByCollection(collectionId: string): Content[] {
  const allContent = getAllContent();
  return allContent.filter(item => item.collectionId === collectionId);
}

export function addCollection(collection: Omit<Collection, 'id'>): Collection {
  const allCollections = getAllCollections();
  const newCollection: Collection = {
    ...collection,
    id: collection.name.toLowerCase().replace(/\s+/g, '-'),
  };
  
  allCollections.push(newCollection);
  saveCollections(allCollections);
  return newCollection;
}

export function updateCollection(updatedCollection: Collection): Collection {
  const allCollections = getAllCollections();
  const index = allCollections.findIndex(item => item.id === updatedCollection.id);
  
  if (index !== -1) {
    allCollections[index] = updatedCollection;
    saveCollections(allCollections);
    return updatedCollection;
  }
  
  throw new Error(`Collection with id ${updatedCollection.id} not found`);
}

export function deleteCollection(id: string): void {
  const allCollections = getAllCollections();
  const filteredCollections = allCollections.filter(item => item.id !== id);
  
  if (filteredCollections.length < allCollections.length) {
    saveCollections(filteredCollections);
    
    // Also update any content that was in this collection
    const allContent = getAllContent();
    const updatedContent = allContent.map(item => {
      if (item.collectionId === id) {
        return { ...item, collectionId: undefined };
      }
      return item;
    });
    
    saveContent(updatedContent);
  } else {
    throw new Error(`Collection with id ${id} not found`);
  }
}

export function getChildCollections(parentId: string): Collection[] {
  const allCollections = getAllCollections();
  return allCollections.filter(collection => collection.parentId === parentId);
}

export function getRootCollections(): Collection[] {
  const allCollections = getAllCollections();
  return allCollections.filter(collection => !collection.parentId);
}

export function searchContent(query: string, tags?: string[], collectionId?: string): Content[] {
  let filteredContent = getAllContent();
  
  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredContent = filteredContent.filter(
      item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        (item.url && item.url.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Filter by tags
  if (tags && tags.length > 0) {
    filteredContent = filteredContent.filter(
      item => tags.some(tag => item.tags.includes(tag))
    );
  }
  
  // Filter by collection
  if (collectionId) {
    filteredContent = filteredContent.filter(
      item => item.collectionId === collectionId
    );
  }
  
  return filteredContent;
}