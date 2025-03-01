import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllCollections, 
  addCollection as addCollectionToStore,
  updateCollection as updateCollectionInStore,
  deleteCollection as deleteCollectionFromStore,
  getChildCollections,
  getRootCollections
} from '@/lib/content';
import { requireAuth } from '@/lib/auth';
import { Collection } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const rootOnly = searchParams.get('rootOnly');
    
    let collections;
    
    if (rootOnly === 'true') {
      collections = getRootCollections();
    } else if (parentId) {
      collections = getChildCollections(parentId);
    } else {
      collections = getAllCollections();
    }
    
    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAuth();
    
    const collectionData = await request.json();
    
    // Validate required fields
    if (!collectionData.name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }
    
    const newCollection = addCollectionToStore({
      name: collectionData.name,
      parentId: collectionData.parentId,
      description: collectionData.description,
    });
    
    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error('Error adding collection:', error);
    return NextResponse.json(
      { error: 'Failed to add collection' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireAuth();
    
    const collectionData: Collection = await request.json();
    
    if (!collectionData.id) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }
    
    const updatedCollection = updateCollectionInStore(collectionData);
    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
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
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }
    
    deleteCollectionFromStore(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}