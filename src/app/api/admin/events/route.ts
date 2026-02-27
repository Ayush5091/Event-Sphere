import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, location, capacity } = body;

    if (!title || !description || !date || !location || !capacity) {
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
          capacity: parseInt(capacity, 10) 
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error(`[Error]: ${error.message}`);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
