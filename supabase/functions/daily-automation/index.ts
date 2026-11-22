// Automatic article publishing has been deliberately disabled.
// Prophetic's current editorial workflow requires a human review before publication.
// Keep this endpoint fail-closed so an old pg_cron job cannot publish generated copy.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(JSON.stringify({
    success: false,
    disabled: true,
    message: "Automatic article generation and publication are disabled. Articles require editorial review before publication.",
  }), {
    status: 410,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
