import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: auth.status }
    );
  }

  try {
    // For now, return a default structure based on current page.tsx
    // In the future, this could parse the actual page.tsx file
    return NextResponse.json({
      components: [
        {
          id: 'hero-1',
          type: 'hero',
          props: {
            subtitle: 'created to create',
            description: 'Being creative is a necessity to life',
          },
          order: 0,
        },
        {
          id: 'values-1',
          type: 'values',
          props: {
            items: [
              { title: 'Creativity', description: 'Fostering imagination and innovation' },
              { title: 'Individuality', description: 'Celebrating those who think different' },
              { title: 'Curiosity', description: 'Questioning assumptions, exploring ideas' },
            ],
          },
          order: 1,
        },
        {
          id: 'button-1',
          type: 'button',
          props: {
            text: 'Get 10% Off',
            variant: 'primary',
          },
          order: 2,
        },
        {
          id: 'instagram-1',
          type: 'instagram-link',
          props: {
            username: 'uthinkdifferent',
            text: '@uthinkdifferent',
          },
          order: 3,
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load page structure' },
      { status: 500 }
    );
  }
}
