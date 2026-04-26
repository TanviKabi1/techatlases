import { Shield, AlertTriangle, Database, Users, Cpu, Bot, Terminal, TableIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CSVUploader from "@/components/CSVUploader";
import AdminDataTable from "@/components/AdminDataTable";
import SQLQueryExecutor from "@/components/SQLQueryExecutor";
import SchemaBrowser from "@/components/SchemaBrowser";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const summary = await api.get('/developers/summary');
      return {
        developers: summary.developers || 0,
        technologies: summary.technologies || 0,
        aiTools: summary.aiTools || 0,
        imports: summary.imports || 0,
      };
    },
    enabled: !!user && isAdmin,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="text-primary animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background cyber-grid">
        <Navbar />
        <div className="pt-20 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Developers", value: stats?.developers, icon: Users, color: "text-primary" },
            { label: "Technologies", value: stats?.technologies, icon: Cpu, color: "text-accent" },
            { label: "AI Tools", value: stats?.aiTools, icon: Bot, color: "text-secondary" },
            { label: "Imports", value: stats?.imports, icon: Database, color: "text-primary" },
          ].map((s) => (
            <Card key={s.label} className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value ?? "—"}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="data" className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/50">
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="schema" className="gap-1.5">
              <TableIcon className="w-3.5 h-3.5" /> Schema Browser
            </TabsTrigger>
            <TabsTrigger value="import">CSV Import</TabsTrigger>
            <TabsTrigger value="sql" className="gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> SQL Query
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6">
            <AdminDataTable
              title="Developers"
              icon={<Users className="w-5 h-5 text-primary" />}
              tableName="developers"
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "country", label: "Country" },
                { key: "age", label: "Age" },
                { key: "years_coding", label: "Years Coding" },
                { key: "education_level", label: "Education" },
              ]}
              defaultValues={{ name: "", email: "", country: "", age: "", years_coding: "", education_level: "" }}
            />

            <AdminDataTable
              title="Technologies"
              icon={<Cpu className="w-5 h-5 text-accent" />}
              tableName="technology"
              columns={[
                { key: "name", label: "Name" },
                { key: "category_id", label: "Category ID" },
              ]}
              defaultValues={{ name: "", category_id: "" }}
            />

            <AdminDataTable
              title="AI Tools"
              icon={<Bot className="w-5 h-5 text-secondary" />}
              tableName="ai_tool"
              columns={[
                { key: "name", label: "Name" },
                { key: "description", label: "Description" },
                { key: "category", label: "Category" },
              ]}
              defaultValues={{ name: "", description: "", category: "" }}
            />
          </TabsContent>

          <TabsContent value="schema">
            <SchemaBrowser />
          </TabsContent>

          <TabsContent value="import">
            <CSVUploader />
          </TabsContent>

          <TabsContent value="sql">
            <SQLQueryExecutor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
