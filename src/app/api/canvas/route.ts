// src/app/api/canvas/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(request: Request) {
  const body = await request.json(); // Expect { state }
  
  // Get dummy user id from the request headers.
  const userId = request.headers.get("x-dummy-user-id") || "unknown_user";
  
  // Insert the canvas state with the dummy user id.
  const { data, error } = await supabase
    .from("canvas_states")
    .insert([{ user_id: userId, state: body.state }]);
    
  if (error) {
    console.error("Error inserting canvas state:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data || {});
}

export async function GET() {
  // Get dummy user id from request headers
  // For GET requests, you may require the client to send the dummy id as a query parameter
  // For simplicity, we assume the client sends it in a header as well
  const userId = ""; // You'll need to extract this from your client request or design a query parameter route
  // For example, you might change your GET endpoint to accept a query parameter like ?user_id=xxx

  // Here, for simplicity, we'll return all states (or filter as needed)
  const { data, error } = await supabase
    .from("canvas_states")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error retrieving canvas states:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data || []);
}
