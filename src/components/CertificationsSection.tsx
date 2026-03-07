const certifications = [
  "OEKO-TEX®",
  "ISO 9001",
  "ISO 14001",
  "CE Certified",
  "EU Ecolabel",
];

const CertificationsSection = () => {
  return (
    <section className="py-12 md:py-16 border-t border-border">
      <div className="container">
        <h2 className="text-lg tracking-wide-brand text-foreground font-light text-center mb-8">
          CERTIFICATIONS
        </h2>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {certifications.map((cert) => (
            <div
              key={cert}
              className="flex items-center justify-center px-6 py-3 border border-border"
            >
              <span className="text-xs tracking-brand text-muted-foreground font-semibold">
                {cert}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
