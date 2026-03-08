import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-16 md:py-24 bg-newsletter-bg">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left side */}
          <div>
            <h2 className="text-2xl md:text-3xl tracking-wide-brand text-foreground font-light mb-3">
              STAY UPDATED
            </h2>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter and never miss an update.
            </p>
          </div>

          {/* Right side */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to learn about our offers and our news.
            </p>
            <div className="flex gap-0">
              <input
                type="email"
                placeholder="Enter your e-mail address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary"
              />
              <button className="px-6 py-3 bg-primary text-primary-foreground text-xs tracking-wide-brand uppercase hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
