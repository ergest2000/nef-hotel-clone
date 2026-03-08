import { FileText, Users, Image, PenSquare, Eye } from "lucide-react";

interface AdminDashboardOverviewProps {
  totalSections: number;
  totalContent: number;
  totalBlogPosts: number;
  totalPages: number;
  onNavigate: (page: string) => void;
}

export const AdminDashboardOverview = ({
  totalSections,
  totalContent,
  totalBlogPosts,
  totalPages,
  onNavigate,
}: AdminDashboardOverviewProps) => {
  const stats = [
    { label: "Faqe", value: totalPages, icon: FileText, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Seksione", value: totalSections, icon: Users, color: "bg-green-50 text-green-600 border-green-100" },
    { label: "Fusha Content", value: totalContent, icon: Image, color: "bg-purple-50 text-purple-600 border-purple-100" },
    { label: "Blog Posts", value: totalBlogPosts, icon: PenSquare, color: "bg-orange-50 text-orange-600 border-orange-100" },
  ];

  const quickActions = [
    { label: "Edito Faqjen Kryesore", page: "home", icon: FileText },
    { label: "Menaxho Blog Posts", page: "blog-posts", icon: PenSquare },
    { label: "Edito Company", page: "company", icon: Users },
    { label: "Edito Contact", page: "contact", icon: FileText },
    { label: "Shiko Faqen Live", page: "_preview", icon: Eye },
    { label: "Media Library", page: "media", icon: Image },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Mirë se vini në Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`border rounded-lg p-4 ${stat.color}`}>
            <div className="flex items-center gap-3">
              <stat.icon size={24} strokeWidth={1.5} />
              <div>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-xs opacity-70">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 className="text-sm font-medium text-foreground mb-3">Veprime të shpejta</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => {
              if (action.page === "_preview") {
                window.open("/", "_blank");
              } else {
                onNavigate(action.page);
              }
            }}
            className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg hover:border-primary/30 hover:shadow-sm transition-all text-left"
          >
            <action.icon size={18} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
            <span className="text-sm text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
