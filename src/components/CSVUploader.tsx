import { useState, useCallback, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, X, Eye, History, Undo2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PreviewData {
  headers: string[];
  rowCount: number;
  preview: Record<string, string>[];
}

interface ProcessResult {
  success: boolean;
  processed: number;
  skipped: number;
  total: number;
  errors: string[];
  batchId?: string;
}

type Stage = "idle" | "previewing" | "preview" | "processing" | "done" | "error";

const CSVUploader = () => {
  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState("");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [confirmRevert, setConfirmRevert] = useState<{ id: string; fileName: string } | null>(null);

  // Fetch import history
  const { data: importHistory, refetch: refetchHistory } = useQuery({
    queryKey: ["import-history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("raw_survey_data")
        .select("id, file_name, record_count, processed, imported_at")
        .order("imported_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.endsWith(".csv")) {
      toast({ title: "Invalid file", description: "Please upload a CSV file.", variant: "destructive" });
      return;
    }
    if (f.size > 200 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 200MB.", variant: "destructive" });
      return;
    }
    setFile(f);
    setStage("previewing");
    setError("");
    setResult(null);

    const text = await f.text();
    setCsvText(text);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("process-csv", {
        body: { csvData: text, mode: "preview" },
      });
      if (fnErr) throw fnErr;
      setPreviewData(data);
      setStage("preview");
    } catch (err) {
      setError((err as Error).message);
      setStage("error");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleProcess = async () => {
    setStage("processing");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("process-csv", {
        body: { csvData: csvText, mode: "process", fileName: file?.name || "unknown.csv" },
      });
      if (fnErr) throw fnErr;
      setResult(data);
      setStage("done");
      await queryClient.invalidateQueries();
      await refetchHistory();
      toast({ title: "Import complete", description: `${data.processed} records processed. All data refreshed across the app.` });
    } catch (err) {
      setError((err as Error).message);
      setStage("error");
    }
  };

  const handleRevert = async (batchId: string) => {
    setRevertingId(batchId);
    setConfirmRevert(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("revert-csv", {
        body: { batchId },
      });
      if (fnErr) throw fnErr;
      await queryClient.invalidateQueries();
      await refetchHistory();
      toast({
        title: "Import reverted",
        description: `Successfully removed ${data.totalDeleted} records. Previous data restored.`,
      });
    } catch (err) {
      toast({
        title: "Revert failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
    setRevertingId(null);
  };

  const reset = () => {
    setStage("idle");
    setFile(null);
    setCsvText("");
    setPreviewData(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Upload className="w-5 h-5 text-primary" />
            CSV Data Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-foreground font-medium mb-1">Drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse • Max 200MB</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Expected columns: name, email, country, technologies, ai_tools, job_role, salary...
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              </motion.div>
            )}

            {stage === "previewing" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-12"
              >
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-muted-foreground">Parsing CSV...</p>
              </motion.div>
            )}

            {stage === "preview" && previewData && (
              <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">{file?.name}</span>
                      <span className="text-sm text-muted-foreground">({previewData.rowCount} rows)</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={reset}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Eye className="w-4 h-4" /> Preview (first 5 rows)
                  </div>

                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          {previewData.headers.map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.preview.map((row, i) => (
                          <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                            {previewData.headers.map((h) => (
                              <td key={h} className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate">
                                {row[h] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleProcess} className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Import {previewData.rowCount} Records
                    </Button>
                    <Button variant="outline" onClick={reset}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {stage === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-12"
              >
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-foreground font-medium">Processing & normalizing data...</p>
                <p className="text-sm text-muted-foreground">This may take a moment for large datasets</p>
                <Progress value={undefined} className="w-64 animate-pulse" />
              </motion.div>
            )}

            {stage === "done" && result && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-accent" />
                    <div>
                      <p className="text-foreground font-semibold">Import Complete</p>
                      <p className="text-sm text-muted-foreground">
                        {result.processed} processed • {result.skipped} skipped • {result.total} total
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 rounded-md bg-accent/10 border border-accent/30 p-3 text-center">
                      <p className="text-2xl font-bold text-accent">{result.processed}</p>
                      <p className="text-xs text-muted-foreground">Imported</p>
                    </div>
                    <div className="flex-1 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-center">
                      <p className="text-2xl font-bold text-destructive">{result.skipped}</p>
                      <p className="text-xs text-muted-foreground">Skipped</p>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3 max-h-32 overflow-y-auto">
                      <p className="text-xs font-medium text-destructive mb-1">Errors:</p>
                      {result.errors.map((e, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{e}</p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={reset} className="flex-1">Import Another File</Button>
                    {result.batchId && (
                      <Button
                        variant="destructive"
                        onClick={() => setConfirmRevert({ id: result.batchId!, fileName: file?.name || "this import" })}
                      >
                        <Undo2 className="w-4 h-4 mr-2" /> Revert
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {stage === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex flex-col items-center gap-3 py-8">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <p className="text-destructive font-medium">Import Failed</p>
                  <p className="text-sm text-muted-foreground text-center">{error}</p>
                  <Button variant="outline" onClick={reset}>Try Again</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Import History with Revert */}
      {importHistory && importHistory.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <History className="w-5 h-5 text-primary" />
              Import History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {importHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.file_name || "Unknown file"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.imported_at).toLocaleDateString()} at{" "}
                        {new Date(entry.imported_at).toLocaleTimeString()}
                        {" • "}
                        {entry.record_count} records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={entry.processed ? "default" : "secondary"} className="text-xs">
                      {entry.processed ? "Processed" : "Pending"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={revertingId === entry.id}
                      onClick={() => setConfirmRevert({ id: entry.id, fileName: entry.file_name || "this import" })}
                    >
                      {revertingId === entry.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Undo2 className="w-3.5 h-3.5 mr-1" /> Revert
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Revert Dialog */}
      <Dialog open={!!confirmRevert} onOpenChange={() => setConfirmRevert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Undo2 className="w-5 h-5 text-destructive" />
              Revert Import
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all records imported from{" "}
              <span className="font-semibold text-foreground">"{confirmRevert?.fileName}"</span>.
              Your previous data will be restored. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmRevert(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => confirmRevert && handleRevert(confirmRevert.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Revert Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CSVUploader;
