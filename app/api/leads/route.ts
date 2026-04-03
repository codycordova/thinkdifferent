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
    const {
      // Legacy (discount modal)
      name,
      phone,
      discount_code,

      // Waitlist (drop lock)
      source,
      first_name,
      last_name,
      email,
      product_slug,
      size,
    } = body ?? {};

    const isWaitlist = source === 'waitlist' || (!!first_name || !!last_name || !!email);

    let insertRow: Record<string, unknown>;

    if (isWaitlist) {
      const f = typeof first_name === 'string' ? first_name.trim() : '';
      const l = typeof last_name === 'string' ? last_name.trim() : '';
      const e = typeof email === 'string' ? email.trim() : '';

      if (!f) {
        return NextResponse.json({ error: 'First name is required' }, { status: 400 });
      }
      if (f.length > 60) {
        return NextResponse.json({ error: 'First name must be 60 characters or less' }, { status: 400 });
      }
      if (!l) {
        return NextResponse.json({ error: 'Last name is required' }, { status: 400 });
      }
      if (l.length > 60) {
        return NextResponse.json({ error: 'Last name must be 60 characters or less' }, { status: 400 });
      }
      if (!e) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }
      if (e.length > 254) {
        return NextResponse.json({ error: 'Email must be 254 characters or less' }, { status: 400 });
      }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      if (!emailOk) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }

      const combinedName = `${f} ${l}`.trim();
      insertRow = {
        source: 'waitlist',
        first_name: f,
        last_name: l,
        name: combinedName,
        email: e,
        phone: null,
        discount_code: 'WAITLIST',
        product_slug: typeof product_slug === 'string' ? product_slug.trim().slice(0, 120) : null,
        size: typeof size === 'string' ? size.trim().slice(0, 20) : null,
      };
    } else {
      // Validate required fields (legacy: discount modal)
      if (!name || typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      // Validate name length (security: prevent buffer overflow attacks)
      const trimmedName = name.trim();
      if (trimmedName.length > 100) {
        return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 });
      }

      if (!phone || typeof phone !== 'string' || !phone.trim()) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
      }

      // Validate phone length (security: prevent buffer overflow attacks)
      const trimmedPhone = phone.trim();
      if (trimmedPhone.length > 20) {
        return NextResponse.json({ error: 'Phone number must be 20 characters or less' }, { status: 400 });
      }

      // Validate phone format (basic validation)
      const digitsOnly = trimmedPhone.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        return NextResponse.json(
          { error: 'Invalid phone number format (at least 10 digits required)' },
          { status: 400 }
        );
      }

      insertRow = {
        source: 'discount',
        name: trimmedName,
        phone: trimmedPhone,
        email: null, // Email will be captured via purchases in the future
        discount_code: discount_code || 'THINK10',
      };
    }

    // Check Supabase configuration
    try {
      // Insert into Supabase using admin client (bypasses RLS)
      const { data, error } = await supabaseAdmin
        .from('leads')
        .insert([insertRow])
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
