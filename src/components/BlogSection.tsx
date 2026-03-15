import SlugLink from "@/components/SlugLink";
import { getContentValue } from "@/hooks/useCms";
import { usePublishedBlogPosts } from "@/hooks/useBlogPosts";
import { blogPosts as fallbackPosts } from "@/data/blogPosts";
import { useLanguage } from "@/hooks/useLanguage";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

// Strip HTML tags from a string
const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

const BlogSection = ({ content }: { content?: SiteContent[] }) => {
  const { isAl } = useLanguage();
  const { data: dbPosts } = usePublishedBlogPosts();
  const title = getContentValue(content, "blog", "title", "BLOG");
  const viewAllText = getContentValue(content, "blog", "view_all_button", isAl ? "Shiko të gjitha postimet" : "View all posts");

  // Use DB posts if available, fallback to static
  const posts = dbPosts && dbPosts.length > 0
    ? dbPosts.map((p) => ({
        id: p.slug,
        image: p.image && !p.image.startsWith("/src/") ? p.image : fallbackPosts.find((fp) => fp.id === p.slug)?.image || "",
        title: isAl ? p.title_al : p.title_en,
        excerpt: stripHtml(isAl ? p.excerpt_al : p.excerpt_en),
      }))
    : fallbackPosts.map((p) => ({
        ...p,
        excerpt: stripHtml(p.excerpt),
      }));

  return (
    <section id="blog" className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <SlugLink key={post.id} to={`/blog/${post.id}`} className="group">
              <div className="aspect-[4/3] overflow-hidden mb-4">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <h3 className="text-sm md:text-base text-foreground font-semibold normal-case tracking-normal leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">{post.excerpt}</p>
              <span className="inline-block mt-3 text-xs tracking-brand text-primary uppercase group-hover:underline">
                {isAl ? "Lexo Më Shumë →" : "Read More →"}
              </span>
            </SlugLink>
          ))}
        </div>
        <div className="text-center mt-10">
          <SlugLink to="/blog" className="rounded inline-block px-10 py-3 border border-primary text-primary text-xs tracking-wide-brand uppercase hover:bg-primary hover:text-primary-foreground transition-colors">
            {viewAllText}
          </SlugLink>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
