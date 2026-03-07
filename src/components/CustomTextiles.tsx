import customImg from "@/assets/custom-textiles.jpg";

const CustomTextiles = () => {
  return (
    <section className="py-16 md:py-24 bg-warm-gray">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div>
            <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light mb-6">
              CUSTOMIZED TEXTILES
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Discuss the needs of your hotel with our team and we will propose you a complete
              solution for your business linen. We offer personalized embroidery, custom sizing,
              and branded packaging for your hotel.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
              Our knowledge and experience at your service. Let us help you create the perfect
              guest experience with tailor-made textile solutions.
            </p>
            <a
              href="#"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground text-xs tracking-wide-brand uppercase hover:bg-navy-dark transition-colors"
            >
              Learn More
            </a>
          </div>
          <div className="overflow-hidden">
            <img
              src={customImg}
              alt="Custom hotel textiles embroidery"
              className="w-full h-[300px] md:h-[450px] object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomTextiles;
