import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Play, Loader2, Terminal, Trash2, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const EXAMPLE_QUERIES = [
  { label: "All Developers", query: "SELECT * FROM developers LIMIT 20" },
  { label: "Tech Categories", query: "SELECT * FROM tech_category ORDER BY popularity_score DESC" },
  { label: "Developer Tech View", query: "SELECT * FROM developer_technology_view LIMIT 20" },
  { label: "AI Tool Usage", query: "SELECT * FROM ai_tool_usage_view LIMIT 20" },
  { label: "Top Technologies", query: "SELECT * FROM get_developers_top_technology()" },
  { label: "Category Insights", query: "SELECT * FROM tech_category_insights" },
];

const SQLQueryExecutor = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const executeQuery = async () => {
    if (!query.trim()) return;

    const trimmed = query.trim().toLowerCase();

    // Block dangerous operations
    const blocked = ["drop", "truncate", "alter", "create", "grant", "revoke"];
    if (blocked.some((kw) => trimmed.startsWith(kw))) {
      toast({ title: "Blocked", description: "DDL statements are not allowed here.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setColumns([]);
    const start = performance.now();

    try {
      const data = await api.post(`/crud/query`, { sql: query.trim() });

      const elapsed = Math.round(performance.now() - start);
      setExecutionTime(elapsed);

      const rows = (data as Record<string, unknown>[]) || [];
      if (rows.length > 0) {
        setColumns(Object.keys(rows[0]));
      }
      setResults(rows);
      setHistory((prev) => [query.trim(), ...prev.filter((q) => q !== query.trim())].slice(0, 10));
      toast({ title: "Query executed", description: `${rows.length} row(s) returned in ${elapsed}ms` });
    } catch (e: any) {
      const msg = e.message || "Unknown error";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Terminal className="w-5 h-5 text-primary" />
            SQL Query Executor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Example queries */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((eq) => (
              <button
                key={eq.label}
                onClick={() => setQuery(eq.query)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                {eq.label}
              </button>
            ))}
          </div>

          {/* Query input */}
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here... (SELECT only)"
              className="w-full h-32 p-4 rounded-lg bg-muted/50 border border-border text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  executeQuery();
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={executeQuery} disabled={loading || !query.trim()} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Execute
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setQuery(""); setResults(null); setError(null); setColumns([]); }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
              </Button>
              <span className="text-xs text-muted-foreground">Ctrl+Enter to run</span>
            </div>
            {executionTime !== null && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {executionTime}ms
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive font-mono">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {results.length} row(s) returned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No results</p>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHead key={col} className="text-xs font-mono whitespace-nowrap">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((row, i) => (
                        <TableRow key={i}>
                          {columns.map((col) => (
                            <TableCell key={col} className="text-xs font-mono whitespace-nowrap max-w-[200px] truncate">
                              {row[col] === null ? (
                                <span className="text-muted-foreground italic">null</span>
                              ) : typeof row[col] === "object" ? (
                                JSON.stringify(row[col])
                              ) : (
                                String(row[col])
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
      )}

      {/* History */}
      {history.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Recent Queries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {history.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuery(q)}
                className="block w-full text-left text-xs font-mono text-foreground/70 hover:text-primary truncate py-1 px-2 rounded hover:bg-muted/50 transition-colors"
              >
                {q}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SQLQueryExecutor;
