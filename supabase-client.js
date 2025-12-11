import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://ruizerajoaoggfvkaadx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXplcmFqb2FvZ2dmdmthYWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjc5MTQsImV4cCI6MjA3NTk0MzkxNH0.bsphzec5g4xvs0lC5ivtzejY7tksjYu-iXIGAOTmRzE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;