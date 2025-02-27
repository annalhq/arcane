import fs from 'fs';
import path from 'path';
import { Content, Tag } from '@/types';

const contentPath = path.join(process.cwd(), 'data/content.json');
const tagsPath = path.join(process.cwd(), 'data/tags.json');

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

export function saveContent(content: Content[]): void {
  try {
    fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving content:', error);
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