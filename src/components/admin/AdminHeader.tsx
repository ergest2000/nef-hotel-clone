import { LogOut, ExternalLink, Globe, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { User } from "@supabase/supabase-js";

interface AdminHeaderProps {
  user: User | null;
  lang: "al" | "en";
  onLangChange: (lang: "al" | "en") => void;
  onSignOut: () => void;
  pageTitle?: string;
}

export const AdminHeader = ({ user, lang, onLangChange, onSignOut, pageTitle }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          {pageTitle && (
            <h1 className="text-sm font-medium text-foreground hidden sm:block">{pageTitle}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center bg-muted rounded-md overflow-hidden mr-2">
            <button
              onClick={() => onLangChange("al")}
              className={`text-[11px] font-medium px-3 py-1.5 transition-colors ${
                lang === "al" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AL
            </button>
            <button
              onClick={() => onLangChange("en")}
              className={`text-[11px] font-medium px-3 py-1.5 transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Shiko Faqen</span>
          </a>

          <div className="h-6 w-px bg-border mx-1" />

          <span className="text-[11px] text-muted-foreground hidden md:block mr-1">{user?.email}</span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
};
