import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { usePageContent, getContentValue } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";
import { useDesign } from "@/hooks/useDesignSettings";
import { Link } from "react-router-dom";

const Certifications = () => {
  const { lang, isAl } = useLanguage();
  const { data: content } = usePageContent("certifications", lang);
  const { settings } = useDesign();

  const t = (al: string, en: string) => (isAl ? al : en);

  const g = (sectionKey: string, fieldKey: string, fallback: string) =>
    getContentValue(content, sectionKey, fieldKey, fallback);

  const ds = (key: string, fallback: string) => {
    const alKey = `${key}_al`;
    const enKey = `${key}_en`;
    return isAl ? (settings[alKey] || fallback) : (settings[enKey] || fallback);
  };

  // Up to 6 certification items — each has image, title, text from CMS
  const certItems = [];
  for (let i = 1; i <= 6; i++) {
    const image = g("cert" + i, "image", "");
    const title = g("cert" + i, "title", "");
    const text = g("cert" + i, "text", "");
    if (image || title || text) {
      certItems.push({ key: "cert" + i, image, title, text });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <Link to="/" className="hover:text-foreground">{t("KRYESORE", "HOME")}</Link>
            <span>—</span>
            <span className="text-foreground">{t("ÇERTIFIKIME", "CERTIFICATIONS")}</span>
          </div>
        </div>
      </div>

      {/* Hero Title */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.15em] text-foreground uppercase">
            {g("hero", "title", t("ÇERTIFIKIME", "CERTIFICATIONS"))}
          </h1>
        </div>
      </div>

      {/* Certification Items */}
      <div className="container py-10 md:py-16">
        <div className="space-y-12 md:space-y-16">
          {certItems.length > 0 ? (
            certItems.map((cert) => (
              <div key={cert.key} className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-10 items-start">
                {cert.image && (
                  <div className="w-full max-w-[280px]">
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}
                <div className={cert.image ? "" : "md:col-span-2"}>
                  {cert.title && (
                    <h2 className="text-lg font-medium text-foreground mb-3">{cert.title}</h2>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {cert.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              {t(
                "Certifikimet do të shtohen së shpejti. Menaxhoni nga Dashboard → Certifikimet.",
                "Certifications will be added soon. Manage from Dashboard → Certifications."
              )}
            </p>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Certifications;
