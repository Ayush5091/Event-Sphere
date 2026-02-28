import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: 'Please provide eventId' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile to get full_name and department as studentId
    const { data: profile } = await supabaseClient.from('User').select('*').eq('id', user.id).single();
    const studentName = profile?.full_name || user.email?.split('@')[0] || 'Unknown';
    const studentEmail = user.email || 'Unknown';
    const studentId = profile?.department || 'N/A';

    // Check if event exists and get capacity + registration deadline
    const { data: event, error: eventError } = await supabase
      .from('Event')
      .select('capacity, registrationEndDate')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if registration deadline has passed
    if (event.registrationEndDate && new Date(event.registrationEndDate) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Registration deadline has passed' },
        { status: 400 }
      );
    }

    // Check current registrations
    const { count, error: countError } = await supabase
      .from('Registration')
      .select('*', { count: 'exact', head: true })
      .eq('eventId', eventId);

    if (countError) throw countError;

    if ((count || 0) >= event.capacity) {
      return NextResponse.json(
        { success: false, message: 'Event is at full capacity' },
        { status: 400 }
      );
    }

    // Create registration
    const { data: registration, error: insertError } = await supabase
      .from('Registration')
      .insert([
        {
          eventId,
          studentName,
          studentEmail,
          studentId,
          ...(user ? { user_id: user.id } : {})
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (error: unknown) {
    console.error(`[Error]: ${error instanceof Error ? error.message : error}`);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
