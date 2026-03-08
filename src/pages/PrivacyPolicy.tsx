import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
    <SiteHeader />
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <h1 className="text-2xl md:text-4xl tracking-wide-brand text-foreground font-light mb-4">PRIVACY POLICY</h1>
        <p className="text-sm text-muted-foreground mb-10">Politika e privatësisë dhe mbrojtjes së të dhënave personale.</p>
        <div className="space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        </div>
      </div>
    </section>
    <SiteFooter />
  </div>
);

export default PrivacyPolicy;
