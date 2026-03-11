import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ParsedRow {
  name?: string;
  email?: string;
  country?: string;
  age?: string;
  years_coding?: string;
  education_level?: string;
  job_role?: string;
  salary?: string;
  employment_type?: string;
  remote_work?: string;
  company_name?: string;
  company_industry?: string;
  company_size?: string;
  technologies?: string;
  ai_tools?: string;
  ai_sentiment?: string;
  ai_use_case?: string;
  region?: string;
  continent?: string;
  [key: string]: string | undefined;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: ParsedRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

async function getOrCreate(
  supabase: ReturnType<typeof createClient>,
  table: string,
  nameCol: string,
  nameVal: string,
  extra?: Record<string, unknown>
): Promise<{ id: string; isNew: boolean }> {
  if (!nameVal) return { id: "", isNew: false };
  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq(nameCol, nameVal)
    .limit(1)
    .single();

  if (existing) return { id: existing.id, isNew: false };

  const insertData = { [nameCol]: nameVal, ...extra };
  const { data: created, error } = await supabase
    .from(table)
    .insert(insertData)
    .select("id")
    .single();

  if (error) throw new Error(`Failed to insert into ${table}: ${error.message}`);
  return { id: created.id, isNew: true };
}

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

    const { csvData, mode, fileName } = await req.json();

    if (mode === "preview") {
      const rows = parseCSV(csvData);
      const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
      return new Response(
        JSON.stringify({
          headers,
          rowCount: rows.length,
          preview: rows.slice(0, 5),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Full ETL process
    const rows = parseCSV(csvData);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "No data rows found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store raw data and get batch ID
    const { data: rawEntry, error: rawErr } = await supabase.from("raw_survey_data").insert({
      raw_json: rows,
      processed: false,
      file_name: fileName || "unknown.csv",
      record_count: rows.length,
    }).select("id").single();

    if (rawErr) throw new Error(`Failed to create import record: ${rawErr.message}`);
    const batchId = rawEntry.id;

    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Cache lookups
    const regionCache = new Map<string, string>();
    const techCache = new Map<string, string>();
    const aiToolCache = new Map<string, string>();
    const companyCache = new Map<string, string>();
    const categoryCache = new Map<string, string>();

    for (const row of rows) {
      try {
        // 1. Region
        let regionId = "";
        const regionName = row.region || row.country || "";
        if (regionName) {
          if (regionCache.has(regionName)) {
            regionId = regionCache.get(regionName)!;
          } else {
            const result = await getOrCreate(supabase, "region", "name", regionName, {
              continent: row.continent || null,
              import_batch_id: batchId,
            });
            regionId = result.id;
            // Only tag new records with batch ID
            if (!result.isNew) {
              regionCache.set(regionName, regionId);
            } else {
              regionCache.set(regionName, regionId);
            }
          }
        }

        // 2. Developer
        const { data: dev, error: devErr } = await supabase
          .from("developers")
          .insert({
            name: row.name || null,
            email: row.email || null,
            country: row.country || null,
            age: row.age ? parseInt(row.age) : null,
            years_coding: row.years_coding ? parseInt(row.years_coding) : null,
            education_level: row.education_level || null,
            region_id: regionId || null,
            import_batch_id: batchId,
          })
          .select("id")
          .single();

        if (devErr) throw new Error(`Developer insert: ${devErr.message}`);
        const devId = dev.id;

        // 3. Company + Work Profile
        let companyId = "";
        const companyName = row.company_name || row.company || "";
        if (companyName) {
          if (companyCache.has(companyName)) {
            companyId = companyCache.get(companyName)!;
          } else {
            const result = await getOrCreate(supabase, "company", "name", companyName, {
              industry: row.company_industry || null,
              size: row.company_size || null,
              region_id: regionId || null,
              import_batch_id: batchId,
            });
            companyId = result.id;
            companyCache.set(companyName, companyId);
          }
        }

        if (row.job_role || row.salary || companyId) {
          await supabase.from("work_profile").insert({
            developer_id: devId,
            job_role: row.job_role || null,
            salary: row.salary ? parseFloat(row.salary) : null,
            employment_type: row.employment_type || null,
            remote_work: row.remote_work || null,
            company_id: companyId || null,
            import_batch_id: batchId,
          });
        }

        // 4. Technologies (semicolon-separated)
        const techList = (row.technologies || "")
          .split(";")
          .map((t: string) => t.trim())
          .filter(Boolean);

        for (const techName of techList) {
          let techId: string;
          if (techCache.has(techName)) {
            techId = techCache.get(techName)!;
          } else {
            const catName = guessTechCategory(techName);
            let catId = "";
            if (catName) {
              if (categoryCache.has(catName)) {
                catId = categoryCache.get(catName)!;
              } else {
                const result = await getOrCreate(supabase, "tech_category", "name", catName, {
                  import_batch_id: batchId,
                });
                catId = result.id;
                categoryCache.set(catName, catId);
              }
            }
            const result = await getOrCreate(supabase, "technology", "name", techName, {
              category_id: catId || null,
              import_batch_id: batchId,
            });
            techId = result.id;
            techCache.set(techName, techId);
          }

          await supabase.from("developers_tech").insert({
            developer_id: devId,
            technology_id: techId,
            proficiency: Math.floor(Math.random() * 5) + 1,
            years_used: row.years_coding ? Math.min(parseInt(row.years_coding), 10) : 1,
            import_batch_id: batchId,
          });
        }

        // 5. AI Tools (semicolon-separated)
        const aiList = (row.ai_tools || "")
          .split(";")
          .map((t: string) => t.trim())
          .filter(Boolean);

        for (const toolName of aiList) {
          let toolId: string;
          if (aiToolCache.has(toolName)) {
            toolId = aiToolCache.get(toolName)!;
          } else {
            const result = await getOrCreate(supabase, "ai_tool", "name", toolName, {
              category: "AI Assistant",
              import_batch_id: batchId,
            });
            toolId = result.id;
            aiToolCache.set(toolName, toolId);
          }

          await supabase.from("uses_ai").insert({
            developer_id: devId,
            ai_tool_id: toolId,
            sentiment: row.ai_sentiment || "positive",
            use_case: row.ai_use_case || "development",
            adoption_score: Math.floor(Math.random() * 10) + 1,
            import_batch_id: batchId,
          });
        }

        processed++;
      } catch (err) {
        skipped++;
        errors.push(`Row ${processed + skipped}: ${(err as Error).message}`);
        if (errors.length > 20) break;
      }
    }

    // Mark raw data as processed
    await supabase
      .from("raw_survey_data")
      .update({ processed: true, processed_at: new Date().toISOString(), record_count: processed })
      .eq("id", batchId);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        skipped,
        total: rows.length,
        errors: errors.slice(0, 10),
        batchId,
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

function guessTechCategory(name: string): string {
  const lower = name.toLowerCase();
  const map: Record<string, string[]> = {
    "Programming Language": ["python", "javascript", "typescript", "java", "c#", "c++", "go", "rust", "ruby", "php", "swift", "kotlin", "r", "scala", "perl", "lua", "dart"],
    "Web Framework": ["react", "angular", "vue", "svelte", "next.js", "nuxt", "django", "flask", "express", "fastapi", "spring", "rails", "laravel"],
    "Database": ["postgresql", "mysql", "mongodb", "redis", "sqlite", "elasticsearch", "dynamodb", "cassandra", "firebase"],
    "Cloud Platform": ["aws", "azure", "gcp", "google cloud", "heroku", "vercel", "netlify", "digitalocean"],
    "DevOps": ["docker", "kubernetes", "terraform", "ansible", "jenkins", "github actions", "gitlab ci", "circleci"],
    "Mobile": ["react native", "flutter", "ionic", "xamarin", "swiftui"],
    "Data Science": ["pandas", "numpy", "tensorflow", "pytorch", "scikit-learn", "keras", "spark"],
  };

  for (const [category, keywords] of Object.entries(map)) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return "Other";
}
