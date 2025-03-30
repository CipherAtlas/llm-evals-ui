// src/app/api/logs/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(request: Request) {
  const { node_id, prompt, response, execution_time } = await request.json();
  const { data, error } = await supabase.from('execution_logs').insert([
    { node_id, prompt, response, execution_time }
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json(data);
}

export async function GET() {
  // Optionally, retrieve the logs.
  const { data, error } = await supabase.from('execution_logs').select('*').order('created_at', { ascending: false });
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json(data);
}
