import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

export interface BlogPost {
  id: string;
  image: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "boutique-hotels-albanian-hospitality",
    image: blog1,
    title: "Boutique hotels: The new trend in Albanian hospitality",
    excerpt: "Discover how boutique hotels are reshaping the guest experience with personalized service and unique design.",
    date: "2025-12-15",
    author: "EGJEU Team",
    content: `Boutique hotels are rapidly becoming the preferred choice for travelers seeking a more personalized and intimate hospitality experience in Albania. Unlike large chain hotels, boutique properties offer unique design elements, curated amenities, and a level of attention to detail that creates memorable stays.

The rise of boutique hotels in Albania reflects a broader trend in the global hospitality industry. Guests are increasingly looking for accommodations that tell a story, connect them to local culture, and provide an experience beyond just a place to sleep.

At EGJEU, we understand the unique needs of boutique hotel operators. Our premium textile collections are designed to complement the distinctive character of each property while maintaining the highest standards of comfort and durability.

From custom-embroidered bed linens to hand-selected bathroom amenities, we work closely with boutique hotel owners to create textile solutions that enhance their brand identity and elevate the guest experience.

The Albanian hospitality sector is experiencing unprecedented growth, and boutique hotels are leading the charge. With their focus on quality over quantity, these properties are setting new standards for guest satisfaction and creating a reputation for Albanian hospitality on the international stage.`,
  },
  {
    id: "restarting-laundromats-winter-closing",
    image: blog2,
    title: "Restarting laundromats after the closing of the winter period",
    excerpt: "In the next few months all hotels will welcome their customers again. Here's how to prepare your laundry.",
    date: "2025-11-20",
    author: "EGJEU Team",
    content: `As the winter season comes to a close and hotels prepare to welcome guests again, one of the most critical aspects of reopening is ensuring your laundry operations are running smoothly. After months of reduced activity, laundromat equipment requires proper maintenance and preparation before handling the increased volume of the busy season.

Start by conducting a thorough inspection of all washing machines, dryers, and ironing equipment. Check for any signs of wear, corrosion, or damage that may have occurred during the dormant period. Replace filters, clean lint traps, and ensure all drainage systems are functioning properly.

Water quality is another crucial factor to consider. After extended periods of inactivity, water pipes may have accumulated mineral deposits or bacteria. Run several empty cycles with cleaning agents to flush the system before processing any guest textiles.

Stock up on detergents, fabric softeners, and stain removal products well in advance. Consider upgrading to eco-friendly cleaning solutions that are gentle on premium textiles while being effective at removing stains and odors.

Train your staff on proper textile care procedures, especially if you've introduced new products or upgraded your linen collection during the off-season. Different fabrics require different washing temperatures, spin cycles, and drying methods.

Finally, establish a preventive maintenance schedule for the entire season. Regular equipment servicing will prevent costly breakdowns during peak periods and ensure your textiles maintain their quality throughout the season.`,
  },
  {
    id: "preparing-hotel-rooms-summer-season",
    image: blog3,
    title: "Preparing hotel rooms for the summer season",
    excerpt: "Essential tips for refreshing your hotel rooms with new linens and amenities before the summer rush.",
    date: "2025-10-08",
    author: "EGJEU Team",
    content: `The summer season is the busiest time for hotels in Albania, and proper preparation is key to delivering exceptional guest experiences. Refreshing your hotel rooms with new linens and amenities can make a significant difference in guest satisfaction and online reviews.

Start by assessing the condition of your current textile inventory. Replace any items showing signs of wear, discoloration, or thinning. Guests notice the quality of bed linens and towels immediately, and worn textiles can negatively impact their perception of your entire property.

Consider updating your color palette to reflect the summer season. Lighter, brighter tones in bed linens and decorative pillows can transform the feel of a room and create a fresh, inviting atmosphere. White remains the gold standard for hotel linens, but accent pieces in seasonal colors can add personality.

Upgrade your bathroom amenities to include summer-specific products. Lightweight, quick-drying towels are essential during the warmer months, and pool-ready options should be readily available. Consider adding beach towels to your amenity offering for properties near coastal areas.

Don't forget about outdoor spaces. Pool areas, terraces, and garden seating require weather-resistant textiles that can withstand sun exposure while maintaining their appearance. Invest in UV-resistant fabrics for outdoor cushions and umbrellas.

Air conditioning and ventilation play a crucial role in summer comfort. Ensure all systems are serviced and functioning efficiently. Pair good climate control with breathable, moisture-wicking bed linens for the ultimate guest comfort.

Finally, create a detailed room inspection checklist that covers every aspect of the guest experience, from the quality of the mattress pad to the presentation of bathroom amenities. Consistency across all rooms is essential for maintaining your property's reputation.`,
  },
];
