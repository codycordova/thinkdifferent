import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, discount_code } = body;

    // Validate that at least one contact method is provided
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format if provided (basic validation)
    if (phone && phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Check Supabase configuration
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            email: email || null,
            phone: phone || null,
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
