
-- Public message pool for newspaper section (anyone can post, messages expire after 10 minutes)
CREATE TABLE public.newspaper_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newspaper_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages
CREATE POLICY "Anyone can read newspaper messages"
  ON public.newspaper_messages
  FOR SELECT
  USING (created_at > now() - interval '10 minutes');

-- Anyone (even anonymous) can insert messages
CREATE POLICY "Anyone can insert newspaper messages"
  ON public.newspaper_messages
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for live message pool
ALTER PUBLICATION supabase_realtime ADD TABLE public.newspaper_messages;
