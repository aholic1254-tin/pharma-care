import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ztpqoolcqsfootlfkczo.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cHFvb2xjcXNmb290bGZrY3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODQwMjUsImV4cCI6MjA5ODA2MDAyNX0.mJUjKv9bFqTBU-pHRmsoHSXnjmeDVYSBC2esUThnFq8";

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
