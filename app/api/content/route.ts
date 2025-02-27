import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllContent, 
  addContent as addContentToStore,
  updateContent as updateContentInStore,
  deleteContent as deleteContentFromStore,
  toggleStarred as toggleStarredInStore
} from '@/lib/content';
import { requireAuth } from '@/lib/auth';
import { Content } from '@/types';

export async function GET() {
  try {
    const content = getAllContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAuth();
    
    const contentData = await request.json();
    
    // Validate required fields
    if (!contentData.title || !contentData.description || !contentData.tags || contentData.tags.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const newContent = addContentToStore({
      title: contentData.title,
      url: contentData.url,
      description: contentData.description,
      tags: contentData.tags,
      starred: contentData.starred || false,
    });
    
    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Error adding content:', error);
    return NextResponse.json(
      { error: 'Failed to add content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireAuth();
    
    const contentData: Content = await request.json();
    
    if (!contentData.id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }
    
    const updatedContent = updateContentInStore(contentData);
    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    requireAuth();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }
    
    deleteContentFromStore(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}