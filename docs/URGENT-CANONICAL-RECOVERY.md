# URGENT: Canonical Hijacking Still Active

**Date**: May 23, 2025  
**Issue**: Google Search Console still showing `jimpinson.com` as canonical for kyleguilfoyle.com

## Immediate Actions Required

### 1. Re-submit Disavow File (URGENT)
The updated disavow.txt file needs to be resubmitted immediately:

1. Go to [Google Disavow Tool](https://search.google.com/search-console/disavow-links)
2. Select your property: kyleguilfoyle.com
3. Upload the updated `disavow.txt` file
4. **Important**: Add a note explaining this is a resubmission due to persistent canonical hijacking

### 2. Force Re-indexing
1. In Google Search Console → URL Inspection
2. Test the live URL: `https://kyleguilfoyle.com/`
3. Click "Request Indexing" (even if it says already indexed)
4. Repeat for all main pages

### 3. Check for Hidden Compromises
Run these checks to ensure your site hasn't been compromised:

```bash
# Check for any hidden redirects in .htaccess
grep -i "redirect\|rewrite" .htaccess

# Check all HTML files for suspicious meta tags
grep -r "jimpinson\|refresh\|http-equiv" *.html

# Verify canonical tags in all pages
grep -r "canonical" *.html
```

### 4. Contact Google Support
Since this is a serious canonical hijacking issue that persists despite proper disavow submission:

1. Go to Google Search Console Help Center
2. Select "Contact Support" 
3. Explain the canonical hijacking issue
4. Provide evidence that you've properly set canonical tags and submitted disavow

### 5. Additional Security Measures

#### A. Add HTTP Security Headers
Your .htaccess already has some security headers, but add these if not present:
```apache
Header set Content-Security-Policy "default-src 'self'"
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

#### B. Monitor for New Issues
- Set up alerts in Google Search Console for new indexing issues
- Monitor your backlink profile weekly for new spam domains
- Check for any unauthorized changes to your DNS settings

### 6. Nuclear Option (If All Else Fails)
If the issue persists after 2 weeks:

1. **Change Primary Domain**: Consider moving to a subdomain temporarily
2. **Full Site Migration**: Document and implement a complete domain migration
3. **Legal Action**: If jimpinson.com is actively harming your site, consider legal options

## Timeline Expectations
- Disavow resubmission: **Immediate**
- Google processing: **2-4 weeks**
- Full recovery: **6-8 weeks**

## Red Flags to Watch For
- New spam domains in backlink profile
- Sudden drops in organic traffic
- Additional canonical hijacking attempts
- Unauthorized changes to site files

---

**Next Review Date**: June 6, 2025  
**Escalation Required If**: Issue persists beyond June 15, 2025 