import { useParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { blogPosts } from "@/data/blogPosts";
import { ArrowLeft, MessageCircle, Mail, Facebook } from "lucide-react";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl tracking-wide-brand text-foreground mb-4">Postimi nuk u gjet</h1>
            <Link to="/blog" className="text-sm text-primary hover:underline tracking-brand uppercase">
              ← Kthehu te Blogu
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = post.title;

  const shareLinks = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      className: "bg-[#25D366] hover:bg-[#1da851] text-white",
    },
    {
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`,
      className: "bg-muted hover:bg-muted-foreground/20 text-foreground",
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      className: "bg-[#1877F2] hover:bg-[#0d65d9] text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-background md:overflow-visible overflow-y-auto overflow-x-hidden h-screen overscroll-none">
      <SiteHeader />

      <article className="py-12 md:py-20">
        <div className="container max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase mb-8">
            <ArrowLeft size={14} /> Kthehu te Blogu
          </Link>

          <h1 className="text-2xl md:text-4xl font-light text-foreground leading-tight normal-case tracking-normal mb-8">
            {post.title}
          </h1>

          <div className="aspect-[16/9] overflow-hidden mb-10">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-sm max-w-none">
            {post.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 normal-case tracking-normal">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Share buttons */}
          <div className="border-t border-border mt-12 pt-8">
            <p className="text-xs tracking-brand text-muted-foreground uppercase mb-4 text-center">Ndaje postimin</p>
            <div className="flex justify-center gap-3">
              {shareLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs tracking-brand uppercase transition-colors ${item.className}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
};

export default BlogPost;
