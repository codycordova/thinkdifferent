import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/admin-auth';

export async function GET() {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message || 'Failed to fetch leads.'}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, discount_code } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate name length (security: prevent buffer overflow attacks)
    const trimmedName = name.trim();
    if (trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Name must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone length (security: prevent buffer overflow attacks)
    const trimmedPhone = phone.trim();
    if (trimmedPhone.length > 20) {
      return NextResponse.json(
        { error: 'Phone number must be 20 characters or less' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number format (at least 10 digits required)' },
        { status: 400 }
      );
    }

    // Check Supabase configuration
    try {
      // Insert into Supabase using admin client (bypasses RLS)
      const { data, error } = await supabaseAdmin
        .from('leads')
        .insert([
          {
            name: trimmedName,
            phone: trimmedPhone,
            email: null, // Email will be captured via purchases in the future
            discount_code: discount_code || 'THINK10',
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: `Database error: ${error.message || 'Failed to save lead. Please try again.'}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data },
        { status: 201 }
      );
    } catch (supabaseError) {
      console.error('Supabase client error:', supabaseError);
      const errorMessage = supabaseError instanceof Error ? supabaseError.message : 'Unknown error';
      if (errorMessage.includes('Missing Supabase environment variables')) {
        return NextResponse.json(
          { error: 'Server configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      throw supabaseError;
    }
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
