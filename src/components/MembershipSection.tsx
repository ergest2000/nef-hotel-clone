import membershipBg from "@/assets/membership-bg.webp";

const MembershipSection = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${membershipBg})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-primary/75" />

      <div className="container relative z-10 text-center max-w-2xl mx-auto">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-primary-foreground font-light mb-6">
          BE A MEMBER OF EGJEU
        </h2>
        <p className="text-sm md:text-base text-primary-foreground/80 leading-relaxed mb-10">
          Sign up and join the EGJEU family to have access to plenty of exclusive offers for
          products that suit all of your hotel needs!
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/register"
            className="px-8 py-3 bg-primary-foreground text-primary text-xs tracking-wide-brand uppercase hover:bg-primary-foreground/90 transition-colors"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="px-8 py-3 border border-primary-foreground text-primary-foreground text-xs tracking-wide-brand uppercase hover:bg-primary-foreground hover:text-primary transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;
