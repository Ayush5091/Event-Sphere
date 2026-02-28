/* eslint-disable */
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testApis() {
  console.log('--- Starting API Tests via Supabase Client ---\n');
  let eventId;

  // 1. Create an Event (Admin)
  console.log('1. Testing: Create Event');
  const { data: newEvent, error: createError } = await supabase
    .from('Event')
    .insert([
      {
        title: 'Test Conference 2026',
        description: 'A test event created by the automated script.',
        date: new Date('2026-05-15T09:00:00Z').toISOString(),
        location: 'Virtual',
        capacity: 5
      }
    ])
    .select()
    .single();

  if (createError) {
    console.error('❌ Failed to create event:', createError.message);
    return;
  }
  console.log('✅ Event created successfully!');
  console.log(newEvent);
  eventId = newEvent.id;
  console.log('\n-----------------------------------\n');

  // 2. Get All Events (User)
  console.log('2. Testing: Get All Events');
  const { data: allEvents, error: getAllError } = await supabase
    .from('Event')
    .select('*')
    .order('date', { ascending: true });

  if (getAllError) {
    console.error('❌ Failed to get events:', getAllError.message);
  } else {
    console.log(`✅ Successfully retrieved ${allEvents.length} events.`);
  }
  console.log('\n-----------------------------------\n');

  // 3. Get Event Details (User)
  console.log(`3. Testing: Get Event Details for ID: ${eventId}`);
  const { data: eventDetails, error: getDetailsError } = await supabase
    .from('Event')
    .select('*')
    .eq('id', eventId)
    .single();

  if (getDetailsError) {
    console.error('❌ Failed to get event details:', getDetailsError.message);
  } else {
    console.log('✅ Successfully retrieved event details!');
    console.log(eventDetails);
  }
  console.log('\n-----------------------------------\n');

  // 4. Update Event (Admin)
  console.log(`4. Testing: Update Event ID: ${eventId}`);
  const { data: updatedEvent, error: updateError } = await supabase
    .from('Event')
    .update({ capacity: 10, location: 'Hybrid' })
    .eq('id', eventId)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Failed to update event:', updateError.message);
  } else {
    console.log('✅ Successfully updated event!');
    console.log(updatedEvent);
  }
  console.log('\n-----------------------------------\n');

  // 5. Register for Event (User)
  console.log(`5. Testing: Register for Event ID: ${eventId}`);
  const { data: registration, error: registerError } = await supabase
    .from('Registration')
    .insert([
      {
        eventId: eventId,
        studentName: 'Test Student',
        studentEmail: 'test.student@example.com',
        studentId: 'STU999'
      }
    ])
    .select()
    .single();

  if (registerError) {
    console.error('❌ Failed to register for event:', registerError.message);
  } else {
    console.log('✅ Successfully registered for event!');
    console.log(registration);
  }
  console.log('\n-----------------------------------\n');

  // 6. Get All Registrations (Admin)
  console.log('6. Testing: Get All Registrations');
  const { data: allRegistrations, error: getRegError } = await supabase
    .from('Registration')
    .select('*, Event(title, date)')
    .order('createdAt', { ascending: false });

  if (getRegError) {
    console.error('❌ Failed to get registrations:', getRegError.message);
  } else {
    console.log(`✅ Successfully retrieved ${allRegistrations.length} registrations.`);
    console.log(allRegistrations[0]); // Show the most recent one
  }
  console.log('\n--- API Tests Completed ---');
}

testApis();
