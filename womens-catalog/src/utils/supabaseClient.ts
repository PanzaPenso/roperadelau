import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eabhvghmjheckieluhgk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYmh2Z2htamhlY2tpZWx1aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTAyNjksImV4cCI6MjA1NjY4NjI2OX0._70w9WAc46Hc6vtTRwIqOvGPGc5zp0rix1VI4Pr5Rro';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);