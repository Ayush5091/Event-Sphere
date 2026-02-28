import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, location, capacity, category, organizer, imageUrl, registrationEndDate } = body;

    if (!title || !description || !date || !location || !capacity || !organizer) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Event')
      .insert([
        {
          title,
          description,
          date: new Date(date).toISOString(),
          location,
          capacity: parseInt(capacity, 10),
          category: category || 'Technical',
          organizer,
          imageUrl: imageUrl || null,
          status: 'UPCOMING',
          registrationEndDate: registrationEndDate ? new Date(registrationEndDate).toISOString() : null,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: unknown) {
    console.error(`[Error]: ${error instanceof Error ? error.message : error}`);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
