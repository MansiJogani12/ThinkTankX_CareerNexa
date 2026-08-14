import urllib.request, re

try:
    url = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=React&location=India&start=0'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')

    titles = [m.group(1).strip() for m in re.finditer(r'<h3 class="base-search-card__title">\s*(.*?)\s*</h3>', html, re.DOTALL)]
    companies = [m.group(1).strip() for m in re.finditer(r'<h4 class="base-search-card__subtitle">[\s\S]*?<a[^>]*>\s*(.*?)\s*</a>', html, re.DOTALL)]
    if not companies:
        companies = [m.group(1).strip() for m in re.finditer(r'<h4 class="base-search-card__subtitle">\s*(.*?)\s*</h4>', html, re.DOTALL)]
    locations = [m.group(1).strip() for m in re.finditer(r'<span class="job-search-card__location">\s*(.*?)\s*</span>', html, re.DOTALL)]
    links = [m.group(1).strip() for m in re.finditer(r'<a class="base-card__full-link[^>]*href="([^"]+)"', html, re.DOTALL)]
    
    print('Found:', len(titles))
    for i in range(min(len(titles), 3)):
        print(f"[{i+1}] {titles[i]} at {companies[i]} in {locations[i]}")
        print(f"    Link: {links[i].split('?')[0]}")
except Exception as e:
    print('Error:', e)
