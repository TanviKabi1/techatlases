import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { currentStack, careerGoal, experienceLevel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a senior technology career advisor for software developers. Given a developer's current technology stack, career goal, and experience level, recommend 5-8 technologies they should learn next.

For each recommendation provide:
- name: technology name
- category: one of "Language", "Framework", "Database", "DevOps", "AI/ML", "Cloud", "Testing", "Architecture"
- reason: 1-2 sentences on why this fits their goals
- priority: "high", "medium", or "low"
- difficulty: "beginner", "intermediate", or "advanced"
- timeToLearn: estimated weeks to become productive
- synergy: which of their current stack items this pairs well with

Be practical, modern, and consider market demand. Don't recommend things already in their stack.`;

    const userPrompt = `Current Stack: ${currentStack.join(", ")}
Career Goal: ${careerGoal}
Experience Level: ${experienceLevel}

Recommend technologies to learn next.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_technologies",
              description: "Return 5-8 technology recommendations for the developer.",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string" },
                        reason: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                        timeToLearn: { type: "number", description: "Weeks to become productive" },
                        synergy: { type: "string", description: "Which current stack items this pairs with" },
                      },
                      required: ["name", "category", "reason", "priority", "difficulty", "timeToLearn", "synergy"],
                      additionalProperties: false,
                    },
                  },
                  summary: { type: "string", description: "A 2-3 sentence career path summary" },
                },
                required: ["recommendations", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_technologies" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend-skills error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
