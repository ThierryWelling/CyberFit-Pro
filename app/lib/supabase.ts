import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://qehmswihtosbzoptfdjd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlaG1zd2lodG9zYnpvcHRmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4ODY0NDksImV4cCI6MjA1NTQ2MjQ0OX0.oq0vl5TicSmc4DykOBx0Pp1V6fYyKxC8feCcsCzA5Dw';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey); 