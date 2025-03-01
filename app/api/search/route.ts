import { NextRequest, NextResponse } from 'next/server';
import { searchContent } from '@/lib/content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const tags = searchParams.getAll('tags');
    const collectionId = searchParams.get('collectionId');
    
    const results = searchContent(
      query, 
      tags.length > 0 ? tags : undefined, 
      collectionId || undefined
    );
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching content:', error);
    return NextResponse.json(
      { error: 'Failed to search content' },
      { status: 500 }
    );
  }
}