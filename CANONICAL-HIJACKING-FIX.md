# Canonical Hijacking Attack - Action Plan
**Date**: October 12, 2025  
**Status**: MITIGATED - MONITORING (Nuclear Option Deployed)

## The Problem

Your site is under a **negative SEO canonical hijacking attack**. Spam sites in Brazil are:
1. Creating pages on their domains that scrape/reference your content
2. Setting up backlinks that confuse Google
3. Making Google think YOUR site is a duplicate of THEIR spam

**Current attacker**: `kemcappeladobogados.com.br/products/o198/2377/omsu/`  
**Previous attackers**: `vilamedievalsti.com.br`, `jimpinson.com`

Your site code is clean. The attack is external.

## Why You're Not Indexed

Google sees:
- **User-declared canonical**: `https://kyleguilfoyle.com/` ✅
- **Google-selected canonical**: `https://www.kemcappeladobogados.com.br/...` ❌

Result: Google refuses to index your pages because it thinks they're duplicates.

---

## IMMEDIATE ACTIONS (Do This Today)

### 1. Submit Updated Disavow File
**Time required**: 5 minutes

1. Go to [Google Disavow Tool](https://search.google.com/search-console/disavow-links)
2. Select property: `kyleguilfoyle.com`
3. Upload the updated `disavow.txt` file from this repo
4. Click "Submit"

**What this does**: Tells Google to ignore all backlinks from the spam domains

### 2. File a Manual Action Report
**Time required**: 10 minutes

1. Go to Search Console → **Help** → **Contact Support**
2. Select **"Manual Action or Spam"**
3. Use this message:

```
Subject: Canonical Hijacking Attack - Request Manual Review

My site (kyleguilfoyle.com) is experiencing a negative SEO attack. 
Spam sites are creating fake backlinks that confuse Google's canonical 
selection algorithm.

Evidence:
- My site HTML has correct canonical: https://kyleguilfoyle.com/
- Google is selecting wrong canonical: kemcappeladobogados.com.br
- This is preventing all pages from being indexed (0 pages indexed)
- Site code is clean - verified by URL inspection
- I've submitted a disavow file for malicious domains

Request: Please manually review and re-index my site. This is a 
clear case of negative SEO preventing legitimate indexing.

Thank you.
```

### 3. Request Indexing for Homepage
**Time required**: 2 minutes

1. Go to Search Console → **URL Inspection**
2. Enter: `https://kyleguilfoyle.com/`
3. Click "Test Live URL"
4. Click "Request Indexing"

### 4. Deploy Updated Disavow File
**Time required**: 2 minutes

The disavow.txt file has been updated in this repo. You need to:

1. Commit the changes:
```bash
git add disavow.txt
git commit -m "fix: update disavow file with Brazilian spam domains"
git push origin main
```

2. Download the file from this repo
3. Submit to Google (see Step 1)

---

## MONITORING (Next 2 Weeks)

### Check Daily:
1. **URL Inspection** for homepage
   - Look for: "Google-selected canonical" should match "User-declared canonical"
   
2. **Page Indexing** report
   - Watch for pages moving from "Not indexed" to "Indexed"

### Check Weekly:
1. **Site search**: Google `site:kyleguilfoyle.com`
   - Should start showing pages within 1-2 weeks

---

## EXPECTED TIMELINE

| Timeframe | Expected Result |
|-----------|----------------|
| Today | Disavow submitted |
| 3-5 days | Google processes disavow file |
| 1 week | First pages start indexing |
| 2 weeks | Homepage and main pages indexed |
| 4 weeks | Full site recovery |

---

## IF ATTACK CONTINUES (After 2 Weeks)

If Google is still selecting wrong canonical after 2 weeks:

### Nuclear Option: Strengthen Canonical Signals (✅ DEPLOYED DEC 2025)

Add these to every HTML page `<head>`:

```html
<!-- Ultra-strong canonical signals -->
<link rel="canonical" href="https://kyleguilfoyle.com/PAGE_URL" />
<meta property="og:url" content="https://kyleguilfoyle.com/PAGE_URL" />
<meta name="robots" content="index,follow" />
<link rel="alternate" hreflang="en" href="https://kyleguilfoyle.com/PAGE_URL" />
```

### Last Resort: Domain Migration
If all else fails (unlikely), we can migrate to a new domain. But this should only be considered after exhausting all other options.

---

## PREVENTION

To prevent future attacks:

1. ✅ **Disavow file** - Updated and submitted
2. ✅ **Robots.txt** - Already blocks spam patterns
3. ✅ **Canonical tags** - Properly set on all pages
4. ✅ **Server Headers** - X-Robots-Tag added to vercel.json
5. ✅ **Strong Robots Meta** - Direct index directive added to all pages
6. ⚠️ **Monitor backlinks** - Check monthly for new spam domains
7. ⚠️ **Set up alerts** - Enable email notifications in Search Console

---

## TECHNICAL NOTES

**Why this is happening:**
- Negative SEO attack targeting your domain
- Attackers create spam pages that reference your URL
- They use sophisticated techniques to confuse Google
- This is NOT a compromise of your site

**Why your site is clean:**
- Verified HTML source has correct canonical
- No malicious code detected
- Vercel deployment is secure
- All files in repo are clean

**Why it persists:**
- Google's algorithm gets confused by fake backlinks
- Takes time for disavow file to process
- Manual intervention sometimes needed
- Previous attackers moved on, new ones emerged

---

## Questions?

If Google hasn't re-indexed your site within 2 weeks, or if new spam domains appear, we may need to escalate further. But the actions above should resolve this within 1-2 weeks.

**Status tracking**: Update this file with progress as you complete each step.

