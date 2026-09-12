import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const secret = Deno.env.get('NOTIFY_FUNCTION_SECRET');
  if (!secret || req.headers.get('x-webhook-secret') !== secret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  try {
    const { user_id, title, body, type = 'general', data = {} } = await req.json();
    if (!user_id || !title || !body) throw new Error('user_id, title and body are required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({ user_id, title, body, type, data })
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify(notification), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
