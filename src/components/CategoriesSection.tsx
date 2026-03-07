import catBedroom from "@/assets/cat-bedroom.jpg";
import catBathroom from "@/assets/cat-bathroom.jpg";
import catMattresses from "@/assets/cat-mattresses.jpg";
import catDining from "@/assets/cat-dining.jpg";
import catPool from "@/assets/cat-pool.jpg";
import catSpa from "@/assets/cat-spa.jpg";
import catAmenities from "@/assets/cat-amenities.jpg";
import catClean from "@/assets/cat-clean.jpg";

const categories = [
  { name: "Bedroom", image: catBedroom },
  { name: "Bathroom", image: catBathroom },
  { name: "Mattresses", image: catMattresses },
  { name: "Dining", image: catDining },
  { name: "Pool", image: catPool },
  { name: "Spa", image: catSpa },
  { name: "Amenities", image: catAmenities },
  { name: "Clean & Fresh", image: catClean },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light">
            CATEGORIES
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
            Our hotel collection includes 8 product categories with solutions that cover every need.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href="#"
              className="group relative aspect-square overflow-hidden"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs md:text-sm tracking-wide-brand text-primary-foreground font-semibold">
                  {cat.name.toUpperCase()}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
