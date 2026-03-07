import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="container">
        <div className="max-w-xl ml-auto text-right">
          <h2 className="text-lg md:text-xl tracking-wide-brand text-primary-foreground font-light mb-4">
            STAY UPDATED
          </h2>
          <p className="text-sm text-primary-foreground/80 mb-8">
            Be the first to learn about our offers and our news.
          </p>
          <div className="flex gap-0">
            <input
              type="email"
              placeholder="Enter your e-mail address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:border-primary-foreground"
            />
            <button className="px-6 py-3 bg-primary-foreground text-primary text-xs tracking-wide-brand uppercase hover:bg-primary-foreground/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
