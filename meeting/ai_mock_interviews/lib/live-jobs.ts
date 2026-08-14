export async function fetchLiveJobs(searchQuery: string = "", preferredCity: string = "", page: number = 1) {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      console.warn("Adzuna credentials missing, returning empty jobs list");
      return [];
    }

    const keywords = encodeURIComponent(searchQuery || "Software Developer");
    const location = encodeURIComponent(preferredCity || "");
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=${keywords}&where=${location}`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
        throw new Error("Failed to fetch jobs from Adzuna");
    }

    const data = await res.json();
    const jobs: any[] = [];
    
    if (data.results && Array.isArray(data.results)) {
        for (const adzunaJob of data.results) {
            jobs.push({
                id: adzunaJob.id || Math.random().toString(),
                title: adzunaJob.title?.replace(/<[^>]*>?/gm, ''),
                company: adzunaJob.company?.display_name || "Unknown Company",
                location: adzunaJob.location?.display_name || preferredCity || "Remote",
                description: adzunaJob.description || "",
                url: adzunaJob.redirect_url,
                salaryMin: adzunaJob.salary_min || null,
                salaryMax: adzunaJob.salary_max || null,
                salaryCurrency: "INR", // Adzuna uses local currency, defaulting for 'in'
                jobType: adzunaJob.contract_time === "full_time" ? "Full-time" : (adzunaJob.contract_time || "Full-time"),
                source: "Adzuna",
                postedDate: adzunaJob.created || new Date().toISOString(),
                latitude: adzunaJob.latitude || null,
                longitude: adzunaJob.longitude || null
            });
        }
    }

    return jobs;
  } catch (error) {
    console.error("Error fetching live jobs from Adzuna:", error);
    return [];
  }
}
