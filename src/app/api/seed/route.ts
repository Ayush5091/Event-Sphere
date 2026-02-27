import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/seed — Inserts sample events and registrations
// Only use this in development to populate the database!
export async function POST() {
    try {
        // 1. Insert sample events
        const events = [
            {
                title: 'Tech Hackathon 2026',
                description: 'A 24-hour hackathon to build innovative solutions using AI, IoT, and Cloud technologies. Open to all departments.',
                date: new Date('2026-03-15T09:00:00').toISOString(),
                location: 'Main Auditorium, Block A',
                capacity: 200,
                category: 'Technical',
                organizer: 'Computer Science Dept',
                status: 'UPCOMING',
                imageUrl: null,
            },
            {
                title: 'AI/ML Workshop',
                description: 'Hands-on workshop covering machine learning fundamentals, neural networks, and real-world applications with Python.',
                date: new Date('2026-03-10T10:00:00').toISOString(),
                location: 'Seminar Hall 2',
                capacity: 80,
                category: 'Technical',
                organizer: 'AI Research Club',
                status: 'UPCOMING',
                imageUrl: null,
            },
            {
                title: 'Cultural Fest 2026',
                description: 'Annual cultural festival featuring music, dance, dramatics, and art competitions. Celebrate creativity and talent!',
                date: new Date('2026-04-05T16:00:00').toISOString(),
                location: 'Open Air Theatre',
                capacity: 500,
                category: 'Cultural',
                organizer: 'Student Council',
                status: 'UPCOMING',
                imageUrl: null,
            },
            {
                title: 'Sports Day',
                description: 'Inter-department sports competition including cricket, football, basketball, and athletics.',
                date: new Date('2026-03-20T07:00:00').toISOString(),
                location: 'Sports Ground',
                capacity: 300,
                category: 'Sports',
                organizer: 'Physical Education Dept',
                status: 'UPCOMING',
                imageUrl: null,
            },
            {
                title: 'Web Development Bootcamp',
                description: 'Intensive 2-day bootcamp on modern web development with React, Next.js, and Supabase.',
                date: new Date('2026-02-20T09:00:00').toISOString(),
                location: 'Computer Lab 3',
                capacity: 60,
                category: 'Technical',
                organizer: 'Google Developer Student Club',
                status: 'COMPLETED',
                imageUrl: null,
            },
        ];

        const { data: insertedEvents, error: eventError } = await supabaseAdmin
            .from('Event')
            .insert(events)
            .select();

        if (eventError) throw eventError;

        // 2. Insert sample registrations for the inserted events
        if (insertedEvents && insertedEvents.length > 0) {
            const registrations = [
                {
                    eventId: insertedEvents[0].id,
                    studentName: 'Rahul Menon',
                    studentEmail: 'rahul.cs24@sahyadri.edu.in',
                    studentId: 'SAH2024CS001',
                    status: 'REGISTERED',
                },
                {
                    eventId: insertedEvents[0].id,
                    studentName: 'Sarah Ahmed',
                    studentEmail: 'sarah.cs24@sahyadri.edu.in',
                    studentId: 'SAH2024CS042',
                    status: 'REGISTERED',
                },
                {
                    eventId: insertedEvents[1].id,
                    studentName: 'John Dsouza',
                    studentEmail: 'john.me24@sahyadri.edu.in',
                    studentId: 'SAH2024ME015',
                    status: 'REGISTERED',
                },
                {
                    eventId: insertedEvents[1].id,
                    studentName: 'Priya Sharma',
                    studentEmail: 'priya.is24@sahyadri.edu.in',
                    studentId: 'SAH2024IS022',
                    status: 'REGISTERED',
                },
                {
                    eventId: insertedEvents[2].id,
                    studentName: 'Aditya Kumar',
                    studentEmail: 'aditya.ec24@sahyadri.edu.in',
                    studentId: 'SAH2024EC010',
                    status: 'REGISTERED',
                },
                {
                    eventId: insertedEvents[2].id,
                    studentName: 'Sneha Rao',
                    studentEmail: 'sneha.ai24@sahyadri.edu.in',
                    studentId: 'SAH2024AI008',
                    status: 'REGISTERED',
                },
                {
                    eventId: insertedEvents[3].id,
                    studentName: 'Vikram Singh',
                    studentEmail: 'vikram.me24@sahyadri.edu.in',
                    studentId: 'SAH2024ME033',
                    status: 'REGISTERED',
                },
            ];

            const { error: regError } = await supabaseAdmin
                .from('Registration')
                .insert(registrations);

            if (regError) throw regError;
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${insertedEvents?.length || 0} events and 7 registrations`,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Seed Error]: ${message}`);
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        );
    }
}
