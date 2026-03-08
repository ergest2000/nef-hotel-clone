// Shared client list used by both the homepage "See Our Clients" section and the /clients page
export const allClients = [
  "AKS Hotels", "Aldemar Resorts", "Amalia Hotels", "Anatolia Hotels", "Anek Lines", "Angsana",
  "Aqua Bay Hotel", "Aqua Suites Hotel", "Art Maisons", "Athens Capital Hotel", "Atlantica", "Belvedere",
  "Bohème Suites & Spa", "CBH Hotels", "Contessino", "Creta Palace", "Danai Beach Resort",
  "Diamond Deluxe Hotel", "Elounda Peninsula", "Elivi Hotels", "Elysium", "Grecotel",
  "Heritage Hill Hotel", "InterContinental", "King George", "KBH Hotels", "Langley Hotels",
  "Lorvenn", "The Luxury Hotels", "Mayor Hotels", "Messonghi Beach", "Minos Mare Royal",
  "Neptune Hotels", "Onoma Hotel", "Olympic Palace", "Petit Palace", "Philoxenia",
  "Pomegranate Wellness Spa", "Porto Palace", "Porto Angel", "Port Royal", "Rhodos Palladium",
  "Rochari Hotel", "Royal Olympic", "Stella Hotels", "Sun Beach Resort", "The Syntopia",
  "Theoxenia", "White Olive", "Wyndham Grand", "Sea Side Resort", "Xenos Hotels",
];

// First 27 shown in grid (3 rows × 9), rest in carousel
export const gridClients = allClients.slice(0, 27);
export const carouselClients = allClients.slice(27);
