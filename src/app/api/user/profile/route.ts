import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Fetch the current user's profile
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('User')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return NextResponse.json({ success: false, message: profileError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: profile });
    } catch (error: unknown) {
        console.error(`[Error fetching profile]: ${error instanceof Error ? error.message : error}`);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PUT: Update the current user's profile
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { full_name, phone, department } = body;

        const { data: profile, error: updateError } = await supabaseAdmin
            .from('User')
            .upsert({
                id: user.id,
                email: user.email,
                full_name: full_name || user.user_metadata?.full_name,
                phone,
                department,
            })
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ success: false, message: updateError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: profile });
    } catch (error: unknown) {
        console.error(`[Error updating profile]: ${error instanceof Error ? error.message : error}`);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
