-- Create the cover_letters table
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    cover_letter_content text NOT NULL,
    job_description text,
    resume_filename text,
    tone text DEFAULT 'Professional',
    ats_score integer,
    ats_analysis jsonb,
    tokens_used integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS cover_letters_user_id_idx ON public.cover_letters(user_id);
CREATE INDEX IF NOT EXISTS cover_letters_created_at_idx ON public.cover_letters(created_at);

-- Enable Row Level Security
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to access only their own cover letters
CREATE POLICY "Users can manage own cover letters" ON public.cover_letters
    FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.cover_letters TO authenticated;
GRANT ALL ON public.cover_letters TO service_role; 