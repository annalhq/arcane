import { NextRequest, NextResponse } from 'next/server';
import { toggleStarred } from '@/lib/content';
import { requireAuth } from '@/lib/auth';

export async function PUT(request: NextRequest) {
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
    
    const updatedContent = toggleStarred(id);
    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error toggling star status:', error);
    return NextResponse.json(
      { error: 'Failed to update star status' },
      { status: 500 }
    );
  }
}