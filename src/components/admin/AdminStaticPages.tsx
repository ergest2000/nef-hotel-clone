import { useState } from "react";
import { useStaticPages, useUpsertStaticPage, type StaticPage } from "@/hooks/useStaticPages";
import { useToast } from "@/hooks/use-toast";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { TranslateButton } from "./TranslateButton";
import { RichTextEditor } from "./RichTextEditor";

const pageLabels: Record<string, string> = {
  shipping: "Shipping",
  "payment-terms": "Payment Terms",
  "terms-of-use": "Terms of Use",
  "privacy-policy": "Privacy Policy",
};

export const AdminStaticPages = () => {
  const { data: pages, isLoading } = useStaticPages();
  const upsert = useUpsertStaticPage();
  const { toast } = useToast();
  const { translateField, translating } = useAutoTranslate();
  const [editPage, setEditPage] = useState<string>("shipping");
  const [edits, setEdits] = useState<Record<string, Partial<StaticPage>>>({});

  const currentPage = pages?.find((p) => p.page_key === editPage);
  const editData = edits[editPage] ?? currentPage ?? { page_key: editPage, title_al: "", title_en: "", content_al: "", content_en: "" };

  const updateField = (field: keyof StaticPage, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [editPage]: { ...editData, page_key: editPage, [field]: value },
    }));
  };

  const handleSave = () => {
    upsert.mutate({ ...editData, page_key: editPage } as any, {
      onSuccess: () => {
        toast({ title: "U ruajt!" });
        setEdits((prev) => { const n = { ...prev }; delete n[editPage]; return n; });
      },
      onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
    });
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Faqet Statike</h2>
        <Button onClick={handleSave} disabled={upsert.isPending || !edits[editPage]}>
          <Save className="h-4 w-4 mr-1" /> Ruaj
        </Button>
      </div>

      <Tabs value={editPage} onValueChange={setEditPage}>
        <TabsList>
          {Object.entries(pageLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(pageLabels).map((key) => (
          <TabsContent key={key} value={key} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Titulli (AL)</label>
                  <TranslateButton direction="al_to_en" loading={translating === "sp_title"} onClick={() => translateField("sp_title", editData.title_al ?? "", "al_to_en", (t) => updateField("title_en", t))} />
                </div>
                <Input value={editData.title_al ?? ""} onChange={(e) => updateField("title_al", e.target.value)} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Title (EN)</label>
                  <TranslateButton direction="en_to_al" loading={translating === "sp_title_r"} onClick={() => translateField("sp_title_r", editData.title_en ?? "", "en_to_al", (t) => updateField("title_al", t))} />
                </div>
                <Input value={editData.title_en ?? ""} onChange={(e) => updateField("title_en", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Përmbajtja (AL)</label>
                  <TranslateButton direction="al_to_en" loading={translating === "sp_content"} onClick={() => translateField("sp_content", editData.content_al ?? "", "al_to_en", (t) => updateField("content_en", t))} />
                </div>
                <RichTextEditor content={editData.content_al ?? ""} onChange={(v) => updateField("content_al", v)} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Content (EN)</label>
                  <TranslateButton direction="en_to_al" loading={translating === "sp_content_r"} onClick={() => translateField("sp_content_r", editData.content_en ?? "", "en_to_al", (t) => updateField("content_al", t))} />
                </div>
                <RichTextEditor content={editData.content_en ?? ""} onChange={(v) => updateField("content_en", v)} />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
