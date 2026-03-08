import {
  Home,
  Building2,
  Users,
  Scissors,
  Phone,
  FileText,
  PenSquare,
  Globe,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/egjeu-logo.png";

const pages = [
  { key: "home", label: "Faqja Kryesore", icon: Home },
  { key: "company", label: "Rreth Nesh", icon: Building2 },
  { key: "clients", label: "Klientët", icon: Users },
  { key: "tailor-made", label: "Tailor Made", icon: Scissors },
  { key: "contact", label: "Kontakti", icon: Phone },
  { key: "blog", label: "Blog", icon: FileText },
  { key: "blog-posts", label: "Blog Posts", icon: PenSquare },
];

interface AdminSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export const AdminSidebar = ({ activePage, onPageChange }: AdminSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-primary text-primary-foreground">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-primary-foreground/10">
          <img src={logo} alt="EGJEU" className="h-8 w-auto brightness-0 invert" />
          {!collapsed && (
            <span className="text-xs tracking-wide-brand font-light uppercase">Admin</span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary-foreground/50 text-[10px] tracking-wide-brand uppercase">
            {!collapsed && "Faqet"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pages.map((page) => (
                <SidebarMenuItem key={page.key}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(page.key)}
                    isActive={activePage === page.key}
                    className={`text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 ${
                      activePage === page.key
                        ? "bg-primary-foreground/15 text-primary-foreground font-medium"
                        : ""
                    }`}
                  >
                    <page.icon className="h-4 w-4" />
                    {!collapsed && (
                      <span className="text-xs tracking-brand">{page.label}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
