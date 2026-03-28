import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLanguage } from "@/hooks/useLanguage";
import { useDesign } from "@/hooks/useDesignSettings";
import { Link } from "react-router-dom";
import { Download, FileText } from "lucide-react";

const Catalogue = () => {
  const { isAl } = useLanguage();
  const { settings } = useDesign();

  const t = (al: string, en: string) => (isAl ? al : en);

  const ds = (key: string, fallback: string) => {
    const alKey = `${key}_al`;
    const enKey = `${key}_en`;
    return isAl ? (settings[alKey] || fallback) : (settings[enKey] || fallback);
  };

  const pdfUrl = settings["catalogue_pdf_url"] || "";
  const title = ds("catalogue_title", t("KATALOGU", "CATALOGUE"));
  const subtitle = ds("catalogue_subtitle", t(
    "Shkarkoni katalogun tonë të plotë me të gjitha produktet dhe koleksionet.",
    "Download our complete catalogue with all products and collections."
  ));
  const buttonText = ds("catalogue_button", t("SHKARKO KATALOGUN", "DOWNLOAD CATALOGUE"));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <Link to="/" className="hover:text-foreground">{t("KRYESORE", "HOME")}</Link>
            <span>—</span>
            <span className="text-foreground">{title}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.15em] text-foreground uppercase">
            {title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container py-16 md:py-24">
        {pdfUrl ? (
          <div className="max-w-3xl mx-auto">
            {/* PDF Viewer */}
            <div className="border border-border rounded overflow-hidden bg-muted/20 mb-8">
              <iframe
                src={pdfUrl}
                className="w-full h-[70vh] md:h-[80vh]"
                title="Catalogue"
              />
            </div>

            {/* Download Button */}
            <div className="text-center">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-3 px-10 py-4 text-[11px] tracking-[0.25em] uppercase text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#163058" }}
              >
                <Download className="h-4 w-4" />
                {buttonText}
              </a>
            </div>
          </div>
        ) : (
          /* No PDF uploaded yet */
          <div className="max-w-md mx-auto text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/20 mb-6" />
            <h2 className="text-lg font-light tracking-wide text-foreground mb-3">
              {t("Katalogu do të shtohet së shpejti", "Catalogue coming soon")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
            <p className="text-xs text-muted-foreground mt-6">
              {t(
                "Administratorë: ngarkoni PDF-in nga Dashboard → Design Settings → catalogue_pdf_url",
                "Admins: upload the PDF from Dashboard → Design Settings → catalogue_pdf_url"
              )}
            </p>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
};

export default Catalogue;
