import {
  LayoutDashboard, Home, Building2, Users, Scissors, Phone, FileText, PenSquare,
  Image, Settings, Menu as MenuIcon, Award, ImageIcon, Link as LinkIcon, Paintbrush,
  UserCog, ScrollText, Type, FolderOpen, Package, Star, Grid3X3, BookOpen, Gift, Mail, Palette, Footprints,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/egjeu-logo.png";
import { useAuth, type AppRole } from "@/hooks/useAuth";

type RoleAccess = AppRole[];

const menuItems: { key: string; label: string; icon: any; group: string; roles?: RoleAccess }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main", roles: ["admin"] },
  { key: "home", label: "Faqja Kryesore", icon: Home, group: "pages", roles: ["admin"] },
  { key: "company", label: "Company", icon: Building2, group: "pages", roles: ["admin"] },
  { key: "clients", label: "Clients", icon: Users, group: "pages", roles: ["admin"] },
  { key: "tailor-made", label: "Tailor Made", icon: Scissors, group: "pages", roles: ["admin"] },
  { key: "contact", label: "Contact", icon: Phone, group: "pages", roles: ["admin"] },
  { key: "blog", label: "Blog CMS", icon: FileText, group: "pages", roles: ["admin"] },
  { key: "blog-posts", label: "Blog Posts", icon: PenSquare, group: "content", roles: ["admin", "editor"] },
  { key: "menus", label: "Menus", icon: MenuIcon, group: "content", roles: ["admin"] },
  { key: "footer-menus", label: "Footer Menus", icon: Footprints, group: "content", roles: ["admin"] },
  { key: "clients-logos", label: "Clients Logos", icon: ImageIcon, group: "content", roles: ["admin"] },
  { key: "certifications-logos", label: "Certifications Logos", icon: Award, group: "content", roles: ["admin"] },
  { key: "static-pages", label: "Faqet Statike", icon: BookOpen, group: "content", roles: ["admin"] },
  { key: "collections", label: "Koleksionet", icon: FolderOpen, group: "products", roles: ["admin", "editor"] },
  { key: "products", label: "Produktet", icon: Package, group: "products", roles: ["admin", "editor"] },
  { key: "colors", label: "Ngjyrat e Produktit", icon: Palette, group: "products", roles: ["admin"] },
  { key: "suggested-products", label: "Sugjerime Homepage", icon: Star, group: "products", roles: ["admin"] },
  { key: "homepage-categories", label: "Kategoritë Homepage", icon: Grid3X3, group: "products", roles: ["admin"] },
  { key: "media", label: "Media", icon: Image, group: "products", roles: ["admin"] },
  { key: "registrations", label: "Regjistrimet", icon: Users, group: "manage", roles: ["admin", "manager"] },
  { key: "registration-form", label: "Kontaktet", icon: FileText, group: "manage", roles: ["admin", "manager"] },
  { key: "newsletter", label: "Newsletter", icon: Mail, group: "manage", roles: ["admin", "manager"] },
  { key: "offers", label: "Kërkesat për Oferta", icon: Gift, group: "manage", roles: ["admin", "manager"] },
  { key: "users", label: "Users", icon: UserCog, group: "users", roles: ["admin"] },
  { key: "auth-logs", label: "Auth Logs", icon: ScrollText, group: "users", roles: ["admin"] },
  { key: "auth-texts", label: "Auth Texts", icon: Type, group: "users", roles: ["admin"] },
  { key: "slugs", label: "URL Slugs", icon: LinkIcon, group: "system", roles: ["admin"] },
  { key: "design", label: "Design Settings", icon: Paintbrush, group: "system", roles: ["admin"] },
  { key: "settings", label: "Settings", icon: Settings, group: "system", roles: ["admin"] },
];

var groups = [
  { key: "main", label: "" },
  { key: "pages", label: "Faqet" },
  { key: "content", label: "Përmbajtja" },
  { key: "products", label: "Produktet" },
  { key: "manage", label: "Menaxhimi" },
  { key: "users", label: "Përdoruesit" },
  { key: "system", label: "Sistemi" },
];

interface AdminSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export const AdminSidebar = function ({ activePage, onPageChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const { role } = useAuth();
  var collapsed = state === "collapsed";
  var panelLabel = "Admin Panel";
  if (role === "manager") panelLabel = "Manager Panel";
  if (role === "editor") panelLabel = "Editor Panel";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="bg-[hsl(207,56%,22%)] border-b border-white/5">
        <div className="flex items-center gap-3 px-3 py-3">
          <img src={logo} alt="EGJEU" className="h-7 w-auto brightness-0 invert shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-white tracking-wide">EGJEU</span>
              <span className="text-[9px] text-white/50">{panelLabel}</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-[hsl(207,56%,25%)]">
        {groups.map(function (group) {
          var items = menuItems.filter(function (m) {
            if (m.group !== group.key) return false;
            if (m.roles && !m.roles.includes(role)) return false;
            return true;
          });
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.key} className="py-1">
              {group.label && (
                <SidebarGroupLabel className="text-white/30 text-[9px] tracking-widest uppercase px-4 mb-0.5">
                  {!collapsed && group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map(function (item) {
                    var isActive = activePage === item.key;
                    var cls = "h-9 rounded-none text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150 ";
                    if (isActive) {
                      cls += "bg-primary text-white border-l-[3px] border-white font-medium";
                    } else {
                      cls += "border-l-[3px] border-transparent";
                    }
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton onClick={function () { onPageChange(item.key); }} isActive={isActive} tooltip={item.label} className={cls}>
                          <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                          {!collapsed && <span className="text-[13px]">{item.label}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="bg-[hsl(207,56%,22%)] border-t border-white/5">
        {!collapsed && (
          <div className="px-4 py-3">
            <p className="text-[9px] text-white/30">© 2026 EGJEU Admin</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
