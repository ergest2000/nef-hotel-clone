import {
  LayoutDashboard,
  Home,
  Building2,
  Users,
  Scissors,
  Phone,
  FileText,
  PenSquare,
  Image,
  Settings,
  Menu as MenuIcon,
  Award,
  ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/egjeu-logo.png";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { key: "home", label: "Faqja Kryesore", icon: Home, group: "pages" },
  { key: "company", label: "Company", icon: Building2, group: "pages" },
  { key: "clients", label: "Clients", icon: Users, group: "pages" },
  { key: "tailor-made", label: "Tailor Made", icon: Scissors, group: "pages" },
  { key: "contact", label: "Contact", icon: Phone, group: "pages" },
  { key: "blog", label: "Blog", icon: FileText, group: "pages" },
  { key: "blog-posts", label: "Blog Posts", icon: PenSquare, group: "content" },
  { key: "menus", label: "Menus", icon: MenuIcon, group: "content" },
  { key: "clients-logos", label: "Clients Logos", icon: ImageIcon, group: "content" },
  { key: "certifications-logos", label: "Certifications Logos", icon: Award, group: "content" },
  { key: "registrations", label: "Registrations", icon: Users, group: "content" },
  { key: "registration-form", label: "Registration Form", icon: FileText, group: "content" },
  { key: "media", label: "Media", icon: Image, group: "content" },
  { key: "slugs", label: "URL Slugs", icon: LinkIcon, group: "system" },
  { key: "settings", label: "Settings", icon: Settings, group: "system" },
];

const groups = [
  { key: "main", label: "" },
  { key: "pages", label: "Faqet" },
  { key: "content", label: "Përmbajtja" },
  { key: "system", label: "Sistemi" },
];

interface AdminSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export const AdminSidebar = ({ activePage, onPageChange }: AdminSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="bg-[hsl(207,56%,22%)] border-b border-white/5">
        <div className="flex items-center gap-3 px-3 py-3">
          <img src={logo} alt="EGJEU" className="h-7 w-auto brightness-0 invert shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-white tracking-wide">EGJEU</span>
              <span className="text-[9px] text-white/50">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[hsl(207,56%,25%)]">
        {groups.map((group) => {
          const items = menuItems.filter((m) => m.group === group.key);
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
                  {items.map((item) => {
                    const isActive = activePage === item.key;
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          onClick={() => onPageChange(item.key)}
                          isActive={isActive}
                          tooltip={item.label}
                          className={`
                            h-9 rounded-none text-white/70 
                            hover:text-white hover:bg-white/10 
                            transition-colors duration-150
                            ${isActive ? "bg-primary text-white border-l-[3px] border-white font-medium" : "border-l-[3px] border-transparent"}
                          `}
                        >
                          <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                          {!collapsed && (
                            <span className="text-[13px]">{item.label}</span>
                          )}
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
