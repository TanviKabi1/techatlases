import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify admin role
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await anonClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { batchId } = await req.json();
    if (!batchId) {
      return new Response(JSON.stringify({ error: "batchId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete in correct order to respect foreign keys
    // 1. uses_ai (references developers and ai_tool)
    const { count: usesAiCount } = await supabase
      .from("uses_ai")
      .delete({ count: "exact" })
      .eq("import_batch_id", batchId);

    // 2. developers_tech (references developers and technology)
    const { count: devTechCount } = await supabase
      .from("developers_tech")
      .delete({ count: "exact" })
      .eq("import_batch_id", batchId);

    // 3. work_profile (references developers and company)
    const { count: wpCount } = await supabase
      .from("work_profile")
      .delete({ count: "exact" })
      .eq("import_batch_id", batchId);

    // 4. developers
    const { count: devCount } = await supabase
      .from("developers")
      .delete({ count: "exact" })
      .eq("import_batch_id", batchId);

    // 5. technology (only batch-created ones)
    const { count: techCount } = await supabase
      .from("technology")
      .delete({ count: "exact" })
      .eq("import_batch_id", batchId);

    // 6. ai_tool (only batch-created ones)
    const { count: aiCount } = await supabase
      .from("ai_tool")
      .delete({ count: "exact" })
      .eq("import_batch_id", batchId);

    // 7. company (only batch-created ones)
    const { count: companyCount } = await supabase
      .from("company")
      .delete({ count: "exact" })
      .eq("import_batch_id", batchId);

    // 8. tech_category (only batch-created ones)
    await supabase
      .from("tech_category")
      .delete()
      .eq("import_batch_id", batchId);

    // 9. region (only batch-created ones)
    await supabase
      .from("region")
      .delete()
      .eq("import_batch_id", batchId);

    // 10. Delete the raw_survey_data record itself
    await supabase
      .from("raw_survey_data")
      .delete()
      .eq("id", batchId);

    const totalDeleted = (usesAiCount || 0) + (devTechCount || 0) + (wpCount || 0) + (devCount || 0) + (techCount || 0) + (aiCount || 0) + (companyCount || 0);

    return new Response(
      JSON.stringify({
        success: true,
        deleted: {
          uses_ai: usesAiCount || 0,
          developers_tech: devTechCount || 0,
          work_profile: wpCount || 0,
          developers: devCount || 0,
          technology: techCount || 0,
          ai_tool: aiCount || 0,
          company: companyCount || 0,
        },
        totalDeleted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
