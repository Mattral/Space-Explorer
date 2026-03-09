import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, planet } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Dr. Cosmos, an elite planetary scientist and AI astronomer assistant embedded in a NASA-grade solar system simulation. You are currently observing **${planet}**.

Your expertise spans:
- Planetary geology, surface composition, and geomorphology
- Atmospheric chemistry, dynamics, and climate science
- Orbital mechanics and astrodynamics
- Space mission history and upcoming missions to ${planet}
- Comparative planetology across the solar system
- Astrobiology and habitability potential
- Current research frontiers and open questions

Guidelines:
- Be scientifically precise but engaging, like Carl Sagan meets Neil deGrasse Tyson
- Use real data, measurements, and discoveries — no speculation without labeling it
- Cite specific missions (Voyager, Cassini, Curiosity, James Webb, etc.) when relevant
- Use SI units but also provide relatable comparisons
- Keep responses focused but rich with fascinating detail
- Use markdown for structure when helpful (bold key terms, bullet lists for facts)
- When discussing ${planet} specifically, provide the most current scientific understanding`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please wait before sending another message." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("astronomer-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
