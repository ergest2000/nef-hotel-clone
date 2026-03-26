import { useState } from "react";
import { useStaticPages, useUpsertStaticPage } from "@/hooks/useStaticPages";
import type { StaticPage } from "@/hooks/useStaticPages";
import { useToast } from "@/hooks/use-toast";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Link as LinkIcon } from "lucide-react";
import { TranslateButton } from "./TranslateButton";
import { RichTextEditor } from "./RichTextEditor";

var pageLabels: Record<string, string> = {
  shipping: "Dergesa",
  "payment-terms": "Politikat e pageses",
  "terms-of-use": "Termat dhe Kushtet",
  "privacy-policy": "Politikat e Privatësisë",
};

export function AdminStaticPages() {
  var pagesData = useStaticPages();
  var pages = pagesData.data;
  var isLoading = pagesData.isLoading;
  var upsert = useUpsertStaticPage();
  var toastHook = useToast();
  var toast = toastHook.toast;
  var translateHook = useAutoTranslate();
  var translateField = translateHook.translateField;
  var translating = translateHook.translating;
  var editPageState = useState("shipping");
  var editPage = editPageState[0];
  var setEditPage = editPageState[1];
  var editsState = useState<Record<string, Partial<StaticPage>>>({});
  var edits = editsState[0];
  var setEdits = editsState[1];

  var currentPage = pages ? pages.find(function (p) { return p.page_key === editPage; }) : undefined;
  var editData = edits[editPage] || currentPage || { page_key: editPage, title_al: "", title_en: "", content_al: "", content_en: "", slug: "/" + editPage };

  function updateField(field: string, value: string) {
    setEdits(function (prev) {
      var next = Object.assign({}, prev);
      var current = Object.assign({}, editData, { page_key: editPage });
      (current as any)[field] = value;
      next[editPage] = current;
      return next;
    });
  }

  function handleSave() {
    var data = Object.assign({}, editData, { page_key: editPage }) as any;
    upsert.mutate(data, {
      onSuccess: async function () {
        toast({ title: "U ruajt!" });
        setEdits(function (prev) { var n = Object.assign({}, prev); delete n[editPage]; return n; });

        // Auto-translate empty fields
        var changed = false;
        var updates: Partial<StaticPage> = {};

        // Title: AL → EN
        if (data.title_al && !data.title_en) {
          var titleEn = await doTranslate(data.title_al, "al", "en");
          if (titleEn) { updates.title_en = titleEn; changed = true; }
        }
        // Title: EN → AL
        if (data.title_en && !data.title_al) {
          var titleAl = await doTranslate(data.title_en, "en", "al");
          if (titleAl) { updates.title_al = titleAl; changed = true; }
        }
        // Content: AL → EN
        if (data.content_al && !data.content_en) {
          var contentEn = await doTranslate(data.content_al, "al", "en");
          if (contentEn) { updates.content_en = contentEn; changed = true; }
        }
        // Content: EN → AL
        if (data.content_en && !data.content_al) {
          var contentAl = await doTranslate(data.content_en, "en", "al");
          if (contentAl) { updates.content_al = contentAl; changed = true; }
        }

        if (changed) {
          upsert.mutate(Object.assign({}, data, updates) as any, {
            onSuccess: function () {
              toast({ title: "Përkthimi automatik u ruajt!" });
            },
          });
        }
      },
      onError: function (e: any) { toast({ title: "Gabim", description: e.message, variant: "destructive" }); },
    });
  }

  async function doTranslate(text: string, from: string, to: string): Promise<string> {
    if (!text.trim()) return "";
    try {
      var response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, sourceLang: from, targetLang: to }),
      });
      if (!response.ok) return "";
      var data = await response.json();
      return data.translated || "";
    } catch { return ""; }
  }

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
          {Object.entries(pageLabels).map(function (entry) {
            return <TabsTrigger key={entry[0]} value={entry[0]}>{entry[1]}</TabsTrigger>;
          })}
        </TabsList>

        {Object.keys(pageLabels).map(function (key) {
          return (
            <TabsContent key={key} value={key} className="space-y-4 mt-4">
              {/* Slug / Link */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon size={14} className="text-primary" />
                  <label className="text-xs font-medium text-muted-foreground uppercase">Linku Final (URL)</label>
                </div>
                <Input
                  value={(editData as any).slug || "/" + key}
                  onChange={function (e: any) { updateField("slug", e.target.value); }}
                  placeholder={"/" + key}
                  className="h-9 text-sm font-mono"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Kjo është URL-ja ku do hapet faqja. P.sh. /dergesa ose /politikat-e-pageses</p>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Titulli (AL)</label>
                    <TranslateButton direction="al_to_en" loading={translating === "sp_title"} onClick={function () { translateField("sp_title", (editData as any).title_al || "", "al_to_en", function (t: string) { updateField("title_en", t); }); }} />
                  </div>
                  <Input value={(editData as any).title_al || ""} onChange={function (e: any) { updateField("title_al", e.target.value); }} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Title (EN)</label>
                    <TranslateButton direction="en_to_al" loading={translating === "sp_title_r"} onClick={function () { translateField("sp_title_r", (editData as any).title_en || "", "en_to_al", function (t: string) { updateField("title_al", t); }); }} />
                  </div>
                  <Input value={(editData as any).title_en || ""} onChange={function (e: any) { updateField("title_en", e.target.value); }} />
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Përmbajtja (AL)</label>
                    <TranslateButton direction="al_to_en" loading={translating === "sp_content"} onClick={function () { translateField("sp_content", (editData as any).content_al || "", "al_to_en", function (t: string) { updateField("content_en", t); }); }} />
                  </div>
                  <RichTextEditor content={(editData as any).content_al || ""} onChange={function (v: string) { updateField("content_al", v); }} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Content (EN)</label>
                    <TranslateButton direction="en_to_al" loading={translating === "sp_content_r"} onClick={function () { translateField("sp_content_r", (editData as any).content_en || "", "en_to_al", function (t: string) { updateField("content_al", t); }); }} />
                  </div>
                  <RichTextEditor content={(editData as any).content_en || ""} onChange={function (v: string) { updateField("content_en", v); }} />
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
