import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const { error } = await supabase
            .from('Registration')
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
