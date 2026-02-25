import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // NASA NeoWs API — DEMO_KEY is rate-limited but free
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    const startStr = today.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const apiKey = Deno.env.get('NASA_API_KEY') || 'DEMO_KEY';
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startStr}&end_date=${endStr}&api_key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA API returned ${response.status}`);
    }

    const data = await response.json();

    // Flatten all NEOs across dates and sort by miss distance
    const allNeos: any[] = [];
    for (const dateKey of Object.keys(data.near_earth_objects || {})) {
      for (const neo of data.near_earth_objects[dateKey]) {
        const approach = neo.close_approach_data?.[0];
        if (!approach) continue;

        allNeos.push({
          id: neo.id,
          name: neo.name,
          estimated_diameter_min_m: neo.estimated_diameter?.meters?.estimated_diameter_min || 0,
          estimated_diameter_max_m: neo.estimated_diameter?.meters?.estimated_diameter_max || 0,
          close_approach_date: approach.close_approach_date_full || approach.close_approach_date,
          miss_distance_km: parseFloat(approach.miss_distance?.kilometers || '0'),
          miss_distance_lunar: parseFloat(approach.miss_distance?.lunar || '0'),
          relative_velocity_kph: parseFloat(approach.relative_velocity?.kilometers_per_hour || '0'),
          is_potentially_hazardous: neo.is_potentially_hazardous_asteroid,
          nasa_jpl_url: neo.nasa_jpl_url,
        });
      }
    }

    // Sort by miss distance (closest first), take top 10
    allNeos.sort((a, b) => a.miss_distance_km - b.miss_distance_km);
    const top10 = allNeos.slice(0, 10);

    return new Response(JSON.stringify({ neos: top10, element_count: data.element_count }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
