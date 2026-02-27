import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, studentName, studentEmail, studentId } = body;

    if (!eventId || !studentName || !studentEmail || !studentId) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if event exists and get capacity
    const { data: event, error: eventError } = await supabase
      .from('Event')
      .select('capacity')
      .eq('id', eventId)
      .single();
    
    if (eventError || !event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
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
        { eventId, studentName, studentEmail, studentId }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (error: any) {
    console.error(`[Error]: ${error.message}`);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
