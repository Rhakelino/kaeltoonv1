import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kjjbkpsjxchwbzxfqykj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqamJrcHNqeGNod2J6eGZxeWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MzQ5NjgsImV4cCI6MjEwMTExMDk2OH0.WHBFhpN_YD2vnp9SVpQRjgQHBmlChH1ihLHbM4khQQM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
