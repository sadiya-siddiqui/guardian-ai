import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Invalid message (1-5000 chars required)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are Guardian_AI, a real-time threat detection system. Analyze user messages for harmful content: hate speech, harassment, violence, threats, scams, self-harm, and other dangers. Be strict but accurate. Always call the classify_threat tool with your analysis.",
            },
            { role: "user", content: `Analyze this message:\n\n"${message}"` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "classify_threat",
                description: "Classify the threat level of a message",
                parameters: {
                  type: "object",
                  properties: {
                    threat_level: {
                      type: "string",
                      enum: ["safe", "low", "medium", "high", "critical"],
                      description: "Overall threat severity",
                    },
                    threat_categories: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: [
                          "hate_speech",
                          "harassment",
                          "violence",
                          "threats",
                          "self_harm",
                          "scam",
                          "explicit",
                          "other",
                        ],
                      },
                      description: "Detected harmful categories",
                    },
                    confidence: {
                      type: "number",
                      description: "Confidence 0-100",
                    },
                    analysis: {
                      type: "string",
                      description: "Brief explanation of the verdict (1-3 sentences)",
                    },
                    recommended_action: {
                      type: "string",
                      enum: ["allow", "warn", "block"],
                    },
                  },
                  required: [
                    "threat_level",
                    "threat_categories",
                    "confidence",
                    "analysis",
                    "recommended_action",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "classify_threat" },
          },
        }),
      },
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please slow down." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Settings." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, t);
      throw new Error(`AI error ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);
    const blocked = result.recommended_action === "block";

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    const { data: scan, error: insertError } = await supabase
      .from("threat_scans")
      .insert({
        user_id: userData.user.id,
        message,
        threat_level: result.threat_level,
        threat_categories: result.threat_categories,
        confidence: result.confidence,
        ai_analysis: result.analysis,
        blocked,
        ip_address: ipAddress,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to store scan");
    }

    return new Response(
      JSON.stringify({
        scan,
        threat_level: result.threat_level,
        threat_categories: result.threat_categories,
        confidence: result.confidence,
        analysis: result.analysis,
        recommended_action: result.recommended_action,
        blocked,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("analyze-threat error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});