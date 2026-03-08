import { LogOut, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { User } from "@supabase/supabase-js";

interface AdminHeaderProps {
  user: User | null;
  lang: "al" | "en";
  onLangChange: (lang: "al" | "en") => void;
  onSignOut: () => void;
}

export const AdminHeader = ({ user, lang, onLangChange, onSignOut }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between h-12 px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-foreground" />
          <span className="text-[10px] text-muted-foreground hidden sm:block">{user?.email}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-muted rounded px-2 py-1">
            <Globe size={14} className="text-muted-foreground" />
            <button
              onClick={() => onLangChange("al")}
              className={`text-[10px] tracking-brand px-1.5 py-0.5 rounded ${
                lang === "al" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              AL
            </button>
            <button
              onClick={() => onLangChange("en")}
              className={`text-[10px] tracking-brand px-1.5 py-0.5 rounded ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              EN
            </button>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink size={14} /> Preview
          </a>
          <Button variant="ghost" size="sm" onClick={onSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
};
