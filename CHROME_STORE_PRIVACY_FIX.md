# Chrome Web Store Privacy Policy Setup

## Issue Resolution

**Violation**: Privacy policy link is broken or unavailable  
**Solution**: Add a publicly accessible privacy policy URL to the manifest.json

## Files Created

1. `PRIVACY_POLICY.md` - Markdown version of the privacy policy
2. `privacy-policy.html` - HTML version ready for web hosting

## Steps to Resolve

### Option 1: GitHub Pages (Recommended)

1. **Enable GitHub Pages for your repository**:
   - Go to your GitHub repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save the settings

2. **Upload the privacy policy**:
   - Commit and push the `privacy-policy.html` file to your repository
   - The privacy policy will be available at: `https://tusharwasake.github.io/ClarityAI/privacy-policy.html`

3. **Verify the link works**:
   - Test the URL in your browser
   - Make sure it loads properly

### Option 2: Alternative Hosting

If you prefer to host elsewhere, update the `privacy_policy` URL in `manifest.json`:

```json
"privacy_policy": "https://your-domain.com/privacy-policy.html"
```

## Manifest Changes Made

- Updated version to `1.0.1`
- Added `homepage_url` field
- Added `privacy_policy` field pointing to GitHub Pages URL

## Next Steps for Chrome Web Store

1. Host the privacy policy file publicly
2. Verify the privacy policy URL is accessible
3. Rebuild the extension: `npm run build`
4. Create a new ZIP file for submission
5. Upload the new version to Chrome Web Store
6. Mention in the submission notes that you've added the privacy policy

## Privacy Policy Compliance

The privacy policy includes:
- ✅ What data is collected
- ✅ How data is used
- ✅ Data storage and security
- ✅ User rights and choices
- ✅ Contact information
- ✅ Compliance statements
- ✅ Third-party service disclosure (Google Gemini AI)

This should resolve the "Purple Nickel" violation reference.
