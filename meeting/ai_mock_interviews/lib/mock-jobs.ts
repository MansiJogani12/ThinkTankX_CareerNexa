import { cityCoordinates } from "./location-utils";

const TECH_COMPANIES = [
  "Tata Consultancy Services", "Infosys", "Wipro", "HCLTech", "Tech Mahindra",
  "Cognizant", "Capgemini", "Accenture", "IBM India", "Amazon India",
  "Google India", "Microsoft India", "Flipkart", "Zoho", "Freshworks",
  "Paytm", "Zomato", "Swiggy", "Razorpay", "Postman",
  "Reliance Jio", "Larsen & Toubro Infotech", "Mindtree", "Mphasis", "Hexaware",
  "Zerodha", "CRED", "Dream11", "Meesho", "ShareChat"
];

const JOB_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Engineer", 
  "Data Scientist", "DevOps Engineer", "Mobile App Developer",
  "Cloud Architect", "QA Engineer", "Product Manager", "UI/UX Designer"
];

// Deterministic random number generator based on seed
function seededRandom(seed: number) {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

export function generateMockJobs(query: string = ""): any[] {
  const jobs = [];
  const cities = Object.keys(cityCoordinates);
  
  // Create ~50 diverse jobs distributed across cities
  for (let i = 0; i < 50; i++) {
    const r1 = seededRandom(i * 100);
    const r2 = seededRandom(i * 101);
    const r3 = seededRandom(i * 102);

    const company = TECH_COMPANIES[Math.floor(r1 * TECH_COMPANIES.length)];
    const role = JOB_ROLES[Math.floor(r2 * JOB_ROLES.length)];
    const city = cities[Math.floor(r3 * cities.length)];
    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);

    const searchKeywords = encodeURIComponent(`${role} ${company}`);
    const searchLocation = encodeURIComponent(`${capitalizedCity}, India`);

    jobs.push({
      title: role,
      company: company,
      location: capitalizedCity + ", India",
      type: r1 > 0.8 ? "Hybrid" : "Full-time",
      applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${searchKeywords}&location=${searchLocation}`,
      employerWebsite: `https://www.linkedin.com/company/${company.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      description: `We are looking for a talented ${role} to join our team in ${capitalizedCity}. You will work on cutting edge technologies and help build scalable solutions.`,
    });
  }

  if (query) {
    const keywords = query.toLowerCase().split(/[\\s,]+/);
    return jobs.filter(j => 
        keywords.some(k => 
            j.title.toLowerCase().includes(k) || 
            j.description.toLowerCase().includes(k)
        )
    );
  }

  return jobs;
}
