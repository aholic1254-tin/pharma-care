import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ztpqoolcqsfootlfkczo.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cHFvb2xjcXNmb290bGZrY3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODQwMjUsImV4cCI6MjA5ODA2MDAyNX0.mJUjKv9bFqTBU-pHRmsoHSXnjmeDVYSBC2esUThnFq8";

  return createServerClient<Database>(url, key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies can't be set here; middleware handles refresh
          }
        },
      },
    }
  );
}
