import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NASA_API_KEY') || 'DEMO_KEY';
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = now.toISOString().split('T')[0];

    // Fetch flares and CMEs in parallel
    const [flrRes, cmeRes] = await Promise.all([
      fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${startStr}&endDate=${endStr}&api_key=${apiKey}`),
      fetch(`https://api.nasa.gov/DONKI/CME?startDate=${startStr}&endDate=${endStr}&api_key=${apiKey}`),
    ]);

    const flrData = flrRes.ok ? await flrRes.json() : [];
    const cmeData = cmeRes.ok ? await cmeRes.json() : [];

    const events: any[] = [];

    // Process flares (latest 15)
    const recentFlares = Array.isArray(flrData) ? flrData.slice(-15) : [];
    for (const flr of recentFlares) {
      events.push({
        id: flr.flrID || `flr-${flr.beginTime}`,
        type: 'FLR',
        beginTime: flr.beginTime,
        endTime: flr.endTime,
        classType: flr.classType,
        note: flr.note,
        link: flr.link,
      });
    }

    // Process CMEs (latest 10)
    const recentCMEs = Array.isArray(cmeData) ? cmeData.slice(-10) : [];
    for (const cme of recentCMEs) {
      const analysis = cme.cmeAnalyses?.[0];
      events.push({
        id: cme.activityID || `cme-${cme.startTime}`,
        type: 'CME',
        beginTime: cme.startTime,
        speed: analysis?.speed || null,
        note: cme.note,
        link: cme.link,
      });
    }

    // Sort by time descending
    events.sort((a, b) => new Date(b.beginTime).getTime() - new Date(a.beginTime).getTime());

    return new Response(JSON.stringify({ events }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
