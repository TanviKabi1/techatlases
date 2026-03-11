import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Eye, ChevronDown, ChevronRight, Loader2, TableIcon, LayoutList } from "lucide-react";

type TableName = "developers" | "technology" | "ai_tool" | "tech_category" | "company" | "region" | "developers_tech" | "uses_ai" | "work_profile" | "raw_survey_data" | "newspaper_messages" | "profiles" | "user_roles" | "saved_technologies" | "saved_trends" | "user_roadmap";

const DB_TABLES: { name: TableName; label: string; type: "table" }[] = [
  { name: "developers", label: "Developers", type: "table" },
  { name: "technology", label: "Technology", type: "table" },
  { name: "tech_category", label: "Tech Categories", type: "table" },
  { name: "ai_tool", label: "AI Tools", type: "table" },
  { name: "company", label: "Companies", type: "table" },
  { name: "region", label: "Regions", type: "table" },
  { name: "developers_tech", label: "Developers ↔ Tech", type: "table" },
  { name: "uses_ai", label: "Uses AI", type: "table" },
  { name: "work_profile", label: "Work Profiles", type: "table" },
  { name: "raw_survey_data", label: "Raw Survey Data", type: "table" },
  { name: "newspaper_messages", label: "Newspaper Messages", type: "table" },
  { name: "profiles", label: "User Profiles", type: "table" },
  { name: "user_roles", label: "User Roles", type: "table" },
  { name: "saved_technologies", label: "Saved Technologies", type: "table" },
  { name: "saved_trends", label: "Saved Trends", type: "table" },
  { name: "user_roadmap", label: "User Roadmap", type: "table" },
];

const DB_VIEWS = [
  { name: "developer_technology_view", label: "Developer Technology View" },
  { name: "ai_tool_usage_view", label: "AI Tool Usage View" },
  { name: "tech_category_insights", label: "Tech Category Insights" },
];

const TablePreview = ({ tableName, onClose }: { tableName: string; onClose: () => void }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["schema-preview", tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName as TableName)
        .select("*")
        .limit(50);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });

  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Card className="border-primary/20 bg-card/90 backdrop-blur mt-2">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-foreground flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          {tableName}
          {data && <Badge variant="secondary" className="text-xs ml-2">{data.length} rows (max 50)</Badge>}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">Close</Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
        {error && <p className="text-sm text-destructive py-4">{(error as Error).message}</p>}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">Table is empty</p>
        )}
        {data && data.length > 0 && (
          <ScrollArea className="max-h-[350px]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col} className="text-xs font-mono whitespace-nowrap">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, i) => (
                    <TableRow key={i}>
                      {columns.map((col) => (
                        <TableCell key={col} className="text-xs font-mono whitespace-nowrap max-w-[180px] truncate">
                          {row[col] === null ? (
                            <span className="text-muted-foreground italic">null</span>
                          ) : typeof row[col] === "object" ? (
                            JSON.stringify(row[col]).slice(0, 80)
                          ) : (
                            String(row[col]).slice(0, 80)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

const SchemaBrowser = () => {
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const { data: tableCounts } = useQuery({
    queryKey: ["schema-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      const results = await Promise.all(
        DB_TABLES.map((t) =>
          supabase.from(t.name).select("*", { count: "exact", head: true }).then((r) => ({
            name: t.name,
            count: r.count || 0,
          }))
        )
      );
      results.forEach((r) => { counts[r.name] = r.count; });
      return counts;
    },
  });

  const toggle = (name: string) => {
    setExpandedTable((prev) => (prev === name ? null : name));
  };

  return (
    <div className="space-y-4">
      {/* Tables */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Database className="w-5 h-5 text-primary" />
            Database Tables
            <Badge variant="outline" className="ml-2">{DB_TABLES.length} tables</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {DB_TABLES.map((t) => (
            <div key={t.name}>
              <button
                onClick={() => toggle(t.name)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {expandedTable === t.name ? (
                    <ChevronDown className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                  <TableIcon className="w-4 h-4 text-primary/70" />
                  <span className="text-sm font-mono text-foreground">{t.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {tableCounts?.[t.name] ?? "—"} rows
                  </Badge>
                </div>
              </button>
              {expandedTable === t.name && (
                <TablePreview tableName={t.name} onClose={() => setExpandedTable(null)} />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Views */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <LayoutList className="w-5 h-5 text-accent-foreground" />
            Database Views
            <Badge variant="outline" className="ml-2">{DB_VIEWS.length} views</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {DB_VIEWS.map((v) => (
            <div key={v.name}>
              <button
                onClick={() => toggle(v.name)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {expandedTable === v.name ? (
                    <ChevronDown className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                  <Eye className="w-4 h-4 text-accent-foreground/70" />
                  <span className="text-sm font-mono text-foreground">{v.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">view</Badge>
              </button>
              {expandedTable === v.name && (
                <TablePreview tableName={v.name} onClose={() => setExpandedTable(null)} />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchemaBrowser;
