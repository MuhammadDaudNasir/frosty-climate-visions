
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PIXABAY_API_KEY = Deno.env.get("PIXABAY_API_KEY") || "19323886-b5b243545561a113e15589139";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    
    if (!location) {
      return new Response(
        JSON.stringify({ error: "Location is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Searching for images of: ${location}`);

    // Form a search query that's likely to get good results
    // Add terms like cityscape, landscape, etc. to improve results
    const searchQuery = encodeURIComponent(`${location} cityscape landscape travel tourism`);
    
    // Make request to Pixabay API
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true&min_width=1000`
    );
    
    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract image URLs from the response
    const images = data.hits.map((hit: any) => ({
      url: hit.largeImageURL,
      credit: hit.user,
      tags: hit.tags
    }));
    
    console.log(`Found ${images.length} images for ${location}`);
    
    return new Response(
      JSON.stringify({ images }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching location images:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch location images" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
