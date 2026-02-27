import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { Proposal, PageStructure } from '@/lib/types/builder';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: auth.status }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform database rows to Proposal type
    const proposals: Proposal[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      pageStructure: row.page_structure as PageStructure,
      status: row.status as Proposal['status'],
      githubPrNumber: row.github_pr_number || undefined,
      githubPrUrl: row.github_pr_url || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ proposals });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    const { title, description, pageStructure } = body;

    if (!title || !pageStructure) {
      return NextResponse.json(
        { error: 'Title and pageStructure are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .insert({
        title,
        description: description || null,
        page_structure: pageStructure,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    // Transform to Proposal type
    const proposal: Proposal = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      pageStructure: data.page_structure as PageStructure,
      status: data.status as Proposal['status'],
      githubPrNumber: data.github_pr_number || undefined,
      githubPrUrl: data.github_pr_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ proposal });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create proposal' },
      { status: 500 }
    );
  }
}
