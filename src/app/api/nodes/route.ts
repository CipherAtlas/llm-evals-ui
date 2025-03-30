// src/app/api/nodes/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using environment variables.
// This code runs only on the server.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Retrieve all nodes
export async function GET() {
  const { data, error } = await supabase.from("nodes").select("*");

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: Save a new node
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase.from("nodes").insert(body);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data);
}
