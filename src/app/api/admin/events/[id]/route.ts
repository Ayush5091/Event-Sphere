import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body.title) updates.title = body.title;
    if (body.description) updates.description = body.description;
    if (body.date) updates.date = new Date(body.date).toISOString();
    if (body.location) updates.location = body.location;
    if (body.capacity) updates.capacity = parseInt(body.capacity, 10);
    if (body.status) updates.status = body.status;
    if (body.category) updates.category = body.category;
    if (body.organizer) updates.organizer = body.organizer;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('Event')
      .update(updates)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Event not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Error]: ${msg}`);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { error } = await supabase
      .from('Event')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Error]: ${msg}`);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
