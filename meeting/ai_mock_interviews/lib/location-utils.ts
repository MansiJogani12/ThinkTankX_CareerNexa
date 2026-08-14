export const cityCoordinates: Record<string, [number, number]> = {
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  vadodara: [22.3072, 73.1812],
  rajkot: [22.3039, 70.8022],
  mumbai: [19.076, 72.8777],
  pune: [18.5204, 73.8567],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  delhi: [28.7041, 77.1025],
  newdelhi: [28.6139, 77.209],
  noida: [28.5355, 77.391],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  hyderabad: [17.385, 78.4867],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  kochi: [9.9312, 76.2673],
  chandigarh: [30.7333, 76.7794],
  jaipur: [26.9124, 75.7873],
  indore: [22.7196, 75.8577],
};

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

// Calculate distance in kilometers between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const l1 = toRad(lat1);
  const l2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(l1) * Math.cos(l2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getDistanceCategory(preferredCity: string, jobLocation: string): "Same City" | "Nearby" | "Farther Away" {
  if (!preferredCity || !jobLocation) return "Farther Away";

  const pCity = preferredCity.toLowerCase().replace(/[^a-z]/g, "");
  const jCity = jobLocation.toLowerCase().replace(/[^a-z]/g, "");

  // Direct match or partial string match (e.g., "Ahmedabad, Gujarat" matches "ahmedabad")
  if (pCity === jCity || jCity.includes(pCity) || pCity.includes(jCity)) {
    return "Same City";
  }

  // Calculate coordinates if available
  let pCoords = null;
  let jCoords = null;

  for (const city in cityCoordinates) {
    if (pCity.includes(city)) pCoords = cityCoordinates[city];
    if (jCity.includes(city)) jCoords = cityCoordinates[city];
  }

  if (pCoords && jCoords) {
    const dist = calculateDistance(pCoords[0], pCoords[1], jCoords[0], jCoords[1]);
    if (dist < 400) { // 400km is a good proxy for "Nearby" in India
      return "Nearby";
    }
    return "Farther Away";
  }

  // If coordinates not found for one/both, default to Farther Away if strings don't match
  return "Farther Away";
}
