import { useParams } from "react-router-dom";
import SlugLink from "@/components/SlugLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useBlogPostBySlug } from "@/hooks/useBlogPosts";
import { blogPosts as fallbackPosts } from "@/data/blogPosts";
import { ArrowLeft, Mail, Facebook } from "lucide-react";
import whatsappIcon from "@/assets/whatsapp-icon.svg";
import { useLanguage } from "@/hooks/useLanguage";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { data: dbPost, isLoading } = useBlogPostBySlug(id || "");
  const { isAl } = useLanguage();

  const staticPost = fallbackPosts.find((p) => p.id === id);

  const post = dbPost
    ? {
        title: isAl ? dbPost.title_al : dbPost.title_en,
        image:
          dbPost.image && !dbPost.image.startsWith("/src/")
            ? dbPost.image
            : staticPost?.image || "",
        content: isAl ? dbPost.content_al : dbPost.content_en,
      }
    : staticPost
    ? { title: staticPost.title, image: staticPost.image, content: staticPost.content }
    : null;

  const backLabel = isAl ? "Kthehu te Blogu" : "Back to Blog";

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {isAl ? "Duke ngarkuar..." : "Loading..."}
          </p>
        </div>
      );
    }

    if (!post) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl tracking-wide-brand text-foreground mb-4">
              {isAl ? "Postimi nuk u gjet" : "Post not found"}
            </h1>
            <SlugLink
              to="/blog"
              className="text-sm text-primary hover:underline tracking-brand uppercase"
            >
              {String.fromCharCode(8592)} {backLabel}
            </SlugLink>
          </div>
        </div>
      );
    }

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    const shareLinks = [
      {
        label: "WhatsApp",
        iconSrc: whatsappIcon,
        href: `https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + shareUrl)}`,
        className: "bg-[#25D366] hover:bg-[#1da851] text-white",
      },
      {
        label: "Email",
        icon: Mail,
        href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}`,
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
      <article className="py-12 md:py-20 flex-1">
        <div className="container max-w-3xl">
          <SlugLink
            to="/blog"
            className="inline-flex items-center gap-2 text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase mb-8"
          >
            <ArrowLeft size={14} /> {backLabel}
          </SlugLink>

          <h1 className="text-2xl md:text-4xl font-light text-foreground leading-tight normal-case tracking-normal mb-8">
            {post.title}
          </h1>

          {post.image && (
            <div className="aspect-[16/9] overflow-hidden mb-10">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-sm max-w-none text-sm md:text-base text-muted-foreground leading-relaxed [&_p]:mb-6 [&_p]:normal-case [&_p]:tracking-normal">
            {post.content.includes("<") ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              post.content.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mb-6">
                  {paragraph}
                </p>
              ))
            )}
          </div>

          <div className="border-t border-border mt-12 pt-8">
            <p className="text-xs tracking-brand text-muted-foreground uppercase mb-4 text-center">
              {isAl ? "Ndaje postimin" : "Share this post"}
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {shareLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-xs tracking-brand uppercase transition-colors ${item.className}`}
                >
                  {"iconSrc" in item ? (
                    <img
                      src={item.iconSrc}
                      alt={item.label}
                      className="w-3.5 h-3.5 brightness-0 invert"
                    />
                  ) : (
                    <item.icon size={14} />
                  )}
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-background md:overflow-visible md:h-auto overflow-y-auto overflow-x-hidden h-screen overscroll-none flex flex-col">
      <SiteHeader />
      {renderContent()}
      <SiteFooter />
    </div>
  );
};

export default BlogPost;
