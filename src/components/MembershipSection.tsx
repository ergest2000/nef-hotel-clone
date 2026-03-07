const MembershipSection = () => {
  return (
    <section className="py-16 md:py-24 bg-warm-gray">
      <div className="container text-center max-w-2xl mx-auto">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light mb-6">
          BE A MEMBER OF EGJEU
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-10">
          Sign up and join the EGJEU family to have access to plenty of exclusive offers for
          products that suit all of your hotel needs!
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="#"
            className="px-8 py-3 bg-primary text-primary-foreground text-xs tracking-wide-brand uppercase hover:bg-navy-dark transition-colors"
          >
            Sign Up
          </a>
          <a
            href="#"
            className="px-8 py-3 border border-primary text-primary text-xs tracking-wide-brand uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;
