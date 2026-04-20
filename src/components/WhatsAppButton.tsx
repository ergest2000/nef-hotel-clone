import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "355682089662"; // pa + dhe pa hapësira
  const message = "Përshëndetje! Kam një pyetje rreth produkteve tuaja.";
  
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Kontakto në WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#20BA5A] hover:shadow-xl md:h-16 md:w-16"
    >
      <MessageCircle className="h-7 w-7 md:h-8 md:w-8" fill="currentColor" />
    </button>
  );
};

export default WhatsAppButton;
