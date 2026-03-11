import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Column {
  key: string;
  label: string;
  editable?: boolean;
}

interface DataTableProps {
  title: string;
  icon: React.ReactNode;
  tableName: "developers" | "technology" | "ai_tool";
  columns: Column[];
  defaultValues: Record<string, string>;
}

const PAGE_SIZE = 10;

const AdminDataTable = ({ title, icon, tableName, columns, defaultValues }: DataTableProps) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState<string>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isCreate, setIsCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryKey = [tableName, page, search, sortCol, sortAsc];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from(tableName)
        .select("*", { count: "exact" })
        .order(sortCol, { ascending: sortAsc })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (search) {
        const searchCol = columns[0].key;
        query = query.ilike(searchCol, `%${search}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      return { rows: data || [], total: count || 0 };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (record: Record<string, string>) => {
      const cleaned: Record<string, unknown> = {};
      columns.forEach((c) => {
        if (c.editable !== false && record[c.key] !== undefined) {
          cleaned[c.key] = record[c.key] || null;
        }
      });

      if (isCreate) {
        const { error } = await supabase.from(tableName).insert(cleaned);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(tableName).update(cleaned).eq("id", String(editRow?.id));
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: isCreate ? "Record created" : "Record updated" });
      closeDialog();
    },
    onError: (err) => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Record deleted" });
      setDeleteId(null);
    },
    onError: (err) => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    },
  });

  const openEdit = useCallback((row: Record<string, unknown>) => {
    setIsCreate(false);
    setEditRow(row);
    const fd: Record<string, string> = {};
    columns.forEach((c) => { fd[c.key] = String((row as Record<string, unknown>)[c.key] ?? ""); });
    setFormData(fd);
  }, [columns]);

  const openCreate = useCallback(() => {
    setIsCreate(true);
    setEditRow({});
    setFormData({ ...defaultValues });
  }, [defaultValues]);

  const closeDialog = () => { setEditRow(null); setFormData({}); };

  const totalPages = Math.ceil((data?.total || 0) / PAGE_SIZE);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground text-lg">
            {icon}
            {title}
            <span className="text-sm font-normal text-muted-foreground">({data?.total ?? 0})</span>
          </CardTitle>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 bg-muted/30 border-border/50"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {columns.map((c) => (
                      <TableHead
                        key={c.key}
                        className="text-muted-foreground text-xs whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => {
                          if (sortCol === c.key) setSortAsc(!sortAsc);
                          else { setSortCol(c.key); setSortAsc(true); }
                          setPage(0);
                        }}
                      >
                        <span className="flex items-center gap-1">
                          {c.label}
                          {sortCol === c.key ? (
                            sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-muted-foreground text-xs w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {data?.rows.map((row: Record<string, unknown>) => (
                      <motion.tr
                        key={String(row.id)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border/30 row-hover-glow"
                      >
                        {columns.map((c) => (
                          <TableCell key={c.key} className="text-foreground text-sm max-w-[200px] truncate">
                            {String(row[c.key] ?? "—")}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(String(row.id))}>
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {data?.rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-8">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={!!editRow} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{isCreate ? "Create" : "Edit"} {title.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {columns.filter((c) => c.editable !== false).map((c) => (
                <div key={c.key}>
                  <Label className="text-muted-foreground text-xs">{c.label}</Label>
                  <Input
                    value={formData[c.key] || ""}
                    onChange={(e) => setFormData({ ...formData, [c.key]: e.target.value })}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {isCreate ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Delete Record</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">Are you sure? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminDataTable;
