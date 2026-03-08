import { useParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { blogPosts } from "@/data/blogPosts";
import { ArrowLeft } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background md:overflow-visible overflow-y-auto overflow-x-hidden h-screen overscroll-none">
      <SiteHeader />

      <article className="py-12 md:py-20">
        <div className="container max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase mb-8">
            <ArrowLeft size={14} /> Kthehu te Blogu
          </Link>

          <p className="text-[10px] tracking-brand text-muted-foreground uppercase mb-3">
            {new Date(post.date).toLocaleDateString("sq-AL", { year: "numeric", month: "long", day: "numeric" })} · {post.author}
          </p>

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
        </div>
      </article>

      <SiteFooter />
    </div>
  );
};

export default BlogPost;
