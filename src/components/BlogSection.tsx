import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

const posts = [
  {
    image: blog1,
    title: "Boutique hotels: The new trend in Albanian hospitality",
    excerpt: "Discover how boutique hotels are reshaping the guest experience with personalized service and unique design.",
  },
  {
    image: blog2,
    title: "Restarting laundromats after the closing of the winter period",
    excerpt: "In the next few months all hotels will welcome their customers again. Here's how to prepare your laundry.",
  },
  {
    image: blog3,
    title: "Preparing hotel rooms for the summer season",
    excerpt: "Essential tips for refreshing your hotel rooms with new linens and amenities before the summer rush.",
  },
];

const BlogSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-12">
          BLOG
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <a key={post.title} href="#" className="group">
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
