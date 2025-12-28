# 🚨 URGENT: Complete SEO Recovery Action Plan
**Date**: December 25, 2025  
**Status**: CRITICAL - Requires Immediate Action

## Executive Summary

Your site has been under a **canonical hijacking attack** since at least May 2025. Multiple spam domains have been tricking Google into thinking YOUR content is duplicate of THEIR spam. This is why you're not indexed after 7 months.

### The Root Causes Found

| Issue | Severity | Status |
|-------|----------|--------|
| 404 pages returning `X-Robots-Tag: index, follow` | CRITICAL | ✅ FIXED |
| `asseryassin.com` missing from disavow file | CRITICAL | ✅ FIXED |
| Vercel subdomain indexable (duplicate content) | HIGH | ✅ FIXED |
| Cloudflare prepending robots.txt rules | MEDIUM | ⚠️ CHECK |
| Google shows spam products under your domain | CRITICAL | 🔄 REQUIRES GSC |

---

## STEP 1: Deploy These Code Changes (5 minutes)

The following files have been updated. Deploy them immediately:

```bash
git add -A
git commit -m "fix(seo): critical fixes for canonical hijacking recovery

- 404 page now returns noindex, nofollow meta tags
- vercel.json updated to prevent 404 indexing
- Added asseryassin.com to disavow.txt
- Vercel subdomain now redirects to main domain
- Updated robots.txt with spam URL patterns"

git push origin main
```

---

## STEP 2: Upload Disavow File to Google Search Console (2 minutes)

**This is CRITICAL - do it RIGHT NOW.**

1. Download the updated `disavow.txt` from this repo
2. Go to: https://search.google.com/search-console/disavow-links
3. Select property: `kyleguilfoyle.com`
4. Upload the file
5. Click Submit

The updated disavow file now includes:
- `asseryassin.com` (CURRENT attacker - from your screenshot)
- `kemcappeladobogados.com.br`
- `vilamedievalsti.com.br`
- `jimpinson.com`
- And others

---

## STEP 3: Request URL Removal for Spam Pages (10 minutes)

Go to Google Search Console → Removals → New Request

Request **temporary removal** for these URLs that show spam content:

1. `https://kyleguilfoyle.com/Louis-Vuitton-Mini*`
2. `https://kyleguilfoyle.com/Madewell*`
3. `https://kyleguilfoyle.com/Daily-WIG*`
4. `https://kyleguilfoyle.com/Salvatore-Ferragamo*`
5. `https://kyleguilfoyle.com/My-Little-Pony*`
6. `https://kyleguilfoyle.com/BRUCE-SPRINGSTEEN*`

Use the wildcard (`*`) to catch variants.

---

## STEP 4: Request Indexing for Your Real Pages (5 minutes)

In Google Search Console → URL Inspection:

1. Enter `https://kyleguilfoyle.com/`
2. Click "Request Indexing"
3. Repeat for:
   - `https://kyleguilfoyle.com/about`
   - `https://kyleguilfoyle.com/contact`
   - `https://kyleguilfoyle.com/guides/restaurant-alchemist.html`
   - `https://kyleguilfoyle.com/thoughts`

---

## STEP 5: Contact Google Support (15 minutes)

Go to Google Search Console → Help → Contact Support

**Subject**: Canonical Hijacking Attack - Site Not Indexed for 7 Months

**Message**:
```
My site kyleguilfoyle.com has been under a canonical hijacking attack since 
May 2025. Despite having correct canonical tags, Google is selecting spam 
domains as the canonical.

Current attacker: asseryassin.com (see attached screenshot showing Google 
selected canonical)

Evidence:
1. My HTML has correct canonical: <link rel="canonical" href="https://kyleguilfoyle.com/">
2. Google Search Console shows Google-selected canonical as spam sites
3. A site: search shows fake e-commerce products (Louis Vuitton, Madewell, etc.)
4. These URLs return 404 on my site - they never existed
5. I've submitted a disavow file for malicious domains

Actions taken:
- Updated disavow.txt with all known attacker domains
- Added noindex to 404 pages
- Submitted URL removal requests for spam URLs
- Verified all HTML canonical tags are correct

Request: Please manually review my site and clear the spam from the index. 
This is preventing my legitimate business site from appearing in search.

Domain: kyleguilfoyle.com
```

---

## STEP 6: Check Cloudflare Settings (5 minutes)

Your robots.txt is being modified by Cloudflare. Check if you have "Managed Content Signals" enabled:

1. Log into Cloudflare
2. Go to your site → Speed → Optimization
3. Look for "Crawler Hints" or "Content Signals"
4. Consider disabling if it's interfering

The Cloudflare additions aren't blocking Googlebot, but they add complexity that could cause issues.

---

## STEP 7: Monitor Daily for 2 Weeks

### Daily Checks:
- URL Inspection for homepage - look for canonical match
- Check for new spam URLs in site: search

### Weekly Checks:
- Coverage report in GSC
- Backlinks report for new spam domains

---

## Expected Timeline

| Timeframe | Expected Result |
|-----------|----------------|
| Today | Disavow submitted, code deployed |
| 3-5 days | Google processes disavow file |
| 1 week | Spam URLs start dropping from index |
| 2-3 weeks | First legitimate pages start indexing |
| 4-6 weeks | Site fully recovers |

---

## Why WordPress Won't Fix This

Moving to WordPress **will NOT solve this problem**. The attack is happening at the domain level - spam sites are creating fake backlinks/references to `kyleguilfoyle.com`. 

Changing platforms won't stop:
- Spam sites referencing your domain
- Google selecting wrong canonicals
- Fake product URLs appearing in search

The only solutions are:
1. ✅ Disavow the spam domains (done)
2. ✅ Return noindex for non-existent URLs (done)
3. ⏳ Request Google remove spam URLs (you need to do this)
4. ⏳ Contact Google support (you need to do this)

---

## If Nothing Works After 4 Weeks

### Nuclear Option: Domain Migration

If Google cannot recover `kyleguilfoyle.com`, you may need to:

1. Register a new domain (e.g., `kyleguilfoyle.io` or `restaurantgrowth.co`)
2. Set up proper 301 redirects from old domain
3. Submit change of address in Search Console
4. Start fresh with the new domain

But try the above steps first - they should work within 4-6 weeks.

---

## Files Changed in This Fix

1. `public/404.html` - Added noindex meta tags
2. `src/404.html` - Added noindex meta tags  
3. `vercel.json` - Removed wildcard index header, added subdomain redirect
4. `disavow.txt` - Added asseryassin.com and other domains
5. `robots.txt` - Explicit Disallow for 404.html
6. `public/robots.txt` - Explicit Disallow for 404.html

---

## Questions?

The fixes in this repo address the technical issues. But you MUST complete the manual Google Search Console steps above. No code change can force Google to re-index - you need to explicitly request it.


