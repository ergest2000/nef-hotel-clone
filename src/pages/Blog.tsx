import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background md:overflow-visible overflow-y-auto overflow-x-hidden h-screen overscroll-none">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-2xl md:text-4xl tracking-wide-brand font-light text-foreground">
            BLOG
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
            Artikuj dhe këshilla nga bota e hotelerisë dhe tekstileve premium.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {blogPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group">
                <div className="aspect-[4/3] overflow-hidden mb-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm md:text-base text-foreground font-semibold normal-case tracking-normal leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">
                  {post.excerpt}
                </p>
                <span className="inline-block mt-3 text-xs tracking-brand text-primary uppercase group-hover:underline">
                  Read More →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Blog;
