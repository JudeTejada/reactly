# Free Widget Hosting Guide

The best **100% FREE** way to host your embeddable widget.

## Recommended Solution: NPM + jsDelivr CDN

This approach is:
- ✅ **Completely Free** - No costs, ever
- ✅ **Unlimited Bandwidth** - jsDelivr is free for open source
- ✅ **Global CDN** - Fast worldwide
- ✅ **Automatic Updates** - Version management built-in
- ✅ **Two Integration Methods** - NPM install OR script tag

---

## Step 1: Prepare Widget Package

### Update package.json

Make sure `apps/widget/package.json` is ready for publishing:

```json
{
  "name": "@yourusername/reactly-widget",
  "version": "1.0.0",
  "description": "Embeddable feedback widget with AI-powered sentiment analysis",
  "main": "./dist/widget.umd.js",
  "module": "./dist/widget.es.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "keywords": [
    "feedback",
    "widget",
    "sentiment-analysis",
    "customer-feedback",
    "embeddable"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/reactly.git",
    "directory": "apps/widget"
  },
  "homepage": "https://github.com/yourusername/reactly#readme"
}
```

### Build the Widget

```bash
cd apps/widget
pnpm build
```

This creates `dist/` folder with:
- `widget.umd.js` - For script tag usage
- `widget.es.js` - For bundlers
- `index.d.ts` - TypeScript types

---

## Step 2: Publish to NPM

### Create NPM Account

1. Go to https://www.npmjs.com/signup
2. Create free account (no credit card needed)
3. Verify email

### Login via CLI

```bash
npm login
```

Enter your credentials.

### Publish Package

```bash
cd apps/widget
npm publish --access public
```

That's it! Your widget is now on NPM: `https://www.npmjs.com/package/@yourusername/reactly-widget`

### Update Package

When you make changes:

```bash
# Update version in package.json (e.g., 1.0.0 -> 1.0.1)
# Build
pnpm build

# Publish update
npm publish
```

---

## Step 3: Use jsDelivr CDN (FREE!)

Once published to NPM, jsDelivr automatically provides a global CDN.

### Latest Version (Auto-updates)

```html
<script src="https://cdn.jsdelivr.net/npm/@yourusername/reactly-widget@latest/dist/widget.umd.js"></script>
```

### Specific Version (Stable)

```html
<script src="https://cdn.jsdelivr.net/npm/@yourusername/reactly-widget@1.0.0/dist/widget.umd.js"></script>
```

### With Auto-initialization

```html
<script 
  src="https://cdn.jsdelivr.net/npm/@yourusername/reactly-widget@latest/dist/widget.umd.js"
  data-reactly-api-key="YOUR_API_KEY"
  data-reactly-project-id="YOUR_PROJECT_ID"
  data-position="bottom-right">
</script>
```

---

## Integration Methods for Customers

### Method 1: Script Tag (Easiest)

Perfect for non-technical users:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>My Website</h1>
  
  <!-- Add before </body> -->
  <script 
    src="https://cdn.jsdelivr.net/npm/@yourusername/reactly-widget@latest/dist/widget.umd.js"
    data-reactly-api-key="rly_xxxxxxxxxxxxx"
    data-reactly-project-id="proj_xxxxxxxxxx"
    data-position="bottom-right">
  </script>
</body>
</html>
```

### Method 2: NPM Install (For Developers)

For React/Vue/Angular apps:

```bash
npm install @yourusername/reactly-widget
```

```javascript
import { initFeedbackWidget } from '@yourusername/reactly-widget';

initFeedbackWidget({
  apiKey: 'rly_xxxxxxxxxxxxx',
  projectId: 'proj_xxxxxxxxxx',
  apiUrl: 'https://api.yourdomain.com/api',
  position: 'bottom-right',
  theme: {
    primaryColor: '#3b82f6',
  }
});
```

---

## Alternative Free Options

### Option 2: GitHub Pages (Free)

Host directly from your GitHub repository:

#### Setup

1. Create `docs/` folder in root:
   ```bash
   mkdir -p docs
   cp apps/widget/dist/* docs/
   ```

2. Enable GitHub Pages:
   - Go to repo Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: /docs
   - Save

3. Access at: `https://yourusername.github.io/reactly/widget.umd.js`

#### Usage

```html
<script src="https://yourusername.github.io/reactly/widget.umd.js"></script>
```

**Pros**: Simple, version controlled
**Cons**: Not a CDN, slower globally

### Option 3: Cloudflare Pages (Free)

Generous free tier with global CDN:

#### Setup

1. Go to https://pages.cloudflare.com
2. Connect GitHub repo
3. Configure:
   - Project name: `reactly-widget`
   - Build command: `cd apps/widget && pnpm install && pnpm build`
   - Build output: `apps/widget/dist`
4. Deploy

5. Access at: `https://reactly-widget.pages.dev/widget.umd.js`

**Pros**: True CDN, great performance
**Cons**: Requires account setup

### Option 4: Vercel Edge (Free)

100GB bandwidth/month free:

#### Setup

```bash
cd apps/widget
vercel --prod
```

Configure in `vercel.json`:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "cleanUrls": false
}
```

Access at: `https://your-widget.vercel.app/widget.umd.js`

**Pros**: Easy deployment, great DX
**Cons**: 100GB bandwidth limit (generous though)

---

## Recommended: NPM + jsDelivr

Here's why this is the **best free option**:

| Feature | NPM + jsDelivr | GitHub Pages | Cloudflare | Vercel |
|---------|----------------|--------------|------------|--------|
| **Cost** | Free | Free | Free | Free |
| **Bandwidth** | Unlimited | Limited | Unlimited | 100GB/mo |
| **Global CDN** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Setup Time** | 5 min | 2 min | 10 min | 5 min |
| **Versioning** | ✅ Built-in | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual |
| **NPM Install** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Auto Updates** | ✅ @latest | ❌ No | ❌ No | ❌ No |

---

## Publishing Workflow

### Initial Publish

```bash
# 1. Update version in package.json
cd apps/widget
nano package.json  # Change version to 1.0.0

# 2. Build
pnpm build

# 3. Test build
ls -la dist/  # Verify files exist

# 4. Publish to NPM
npm publish --access public

# 5. Verify on NPM
# Visit: https://www.npmjs.com/package/@yourusername/reactly-widget

# 6. Test CDN link
# Visit: https://cdn.jsdelivr.net/npm/@yourusername/reactly-widget@latest/
```

### Update Workflow

```bash
# 1. Make changes to widget
cd apps/widget/src
# ... edit files ...

# 2. Update version (semantic versioning)
# package.json: 1.0.0 -> 1.0.1 (patch)
#             1.0.1 -> 1.1.0 (minor)
#             1.1.0 -> 2.0.0 (major breaking change)

# 3. Build
pnpm build

# 4. Test locally
pnpm dev

# 5. Publish update
npm publish

# 6. jsDelivr updates automatically within minutes!
```

---

## Customer Documentation

### Embed Instructions (Script Tag)

```markdown
# Add Reactly Feedback Widget

1. Get your credentials from dashboard:
   - API Key: `rly_xxxxx`
   - Project ID: `proj_xxxxx`

2. Add this code before `</body>` tag:

   ```html
   <script 
     src="https://cdn.jsdelivr.net/npm/@yourusername/reactly-widget@latest/dist/widget.umd.js"
     data-reactly-api-key="YOUR_API_KEY"
     data-reactly-project-id="YOUR_PROJECT_ID"
     data-position="bottom-right">
   </script>
   ```

3. Replace YOUR_API_KEY and YOUR_PROJECT_ID with your actual values

4. Done! The feedback button will appear on your site.
```

### NPM Installation (For Developers)

```markdown
# Install Reactly Widget

1. Install package:
   ```bash
   npm install @yourusername/reactly-widget
   ```

2. Initialize in your app:
   ```javascript
   import { initFeedbackWidget } from '@yourusername/reactly-widget';
   
   initFeedbackWidget({
     apiKey: 'rly_xxxxx',
     projectId: 'proj_xxxxx',
     apiUrl: 'https://api.yourdomain.com/api',
     position: 'bottom-right',
     theme: {
       primaryColor: '#3b82f6',
     }
   });
   ```

3. Widget appears automatically on your site!
```

---

## Performance & Caching

### jsDelivr Performance

- **Global CDN**: 100+ locations worldwide
- **HTTP/2**: Faster loading
- **Automatic Compression**: Gzip/Brotli
- **Cache**: 7-day edge cache
- **Purge**: Updates propagate in <10 minutes

### Optimization Tips

1. **Use Versioned URLs** for production:
   ```html
   <!-- Good: Won't break if new version has bugs -->
   <script src=".../@yourusername/reactly-widget@1.0.0/..."></script>
   
   <!-- Avoid in production: Auto-updates might break things -->
   <script src=".../@yourusername/reactly-widget@latest/..."></script>
   ```

2. **Minification**: Already done by Vite build

3. **Lazy Loading**:
   ```html
   <script defer src="..."></script>
   ```

---

## Monitoring Usage

### NPM Download Stats

Check downloads at: `https://www.npmjs.com/package/@yourusername/reactly-widget`

Or via API:
```bash
curl https://api.npmjs.org/downloads/point/last-month/@yourusername/reactly-widget
```

### jsDelivr Stats

View traffic at: `https://www.jsdelivr.com/package/npm/@yourusername/reactly-widget`

---

## Cost Analysis

| Solution | Storage | Bandwidth | CDN | Total Cost |
|----------|---------|-----------|-----|------------|
| **NPM + jsDelivr** | Free | Unlimited | Free | **$0** |
| GitHub Pages | Free | 100GB | No | $0 |
| Cloudflare Pages | Free | Unlimited | Free | $0 |
| Vercel | Free | 100GB | Free | $0 |
| AWS S3 + CloudFront | $0.023/GB | $0.085/GB | $0.10/GB | ~$20/month |
| DigitalOcean CDN | $5 | $0.01/GB | $0.01/GB | $5+/month |

**Winner**: NPM + jsDelivr = **$0/month forever!**

---

## Security Considerations

### Package Security

1. **Enable 2FA** on NPM account
2. **Use .npmignore** to exclude unnecessary files
3. **Verify package contents** before publishing:
   ```bash
   npm pack --dry-run
   ```

### Content Integrity

Use Subresource Integrity (SRI) for extra security:

```html
<script 
  src="https://cdn.jsdelivr.net/npm/@yourusername/reactly-widget@1.0.0/dist/widget.umd.js"
  integrity="sha384-xxxxx"
  crossorigin="anonymous">
</script>
```

Generate SRI hash:
```bash
curl https://cdn.jsdelivr.net/npm/@yourusername/reactly-widget@1.0.0/dist/widget.umd.js | openssl dgst -sha384 -binary | openssl base64 -A
```

---

## Quick Start Checklist

- [ ] Update `package.json` with proper name and details
- [ ] Build widget: `pnpm build`
- [ ] Create NPM account (free)
- [ ] Login: `npm login`
- [ ] Publish: `npm publish --access public`
- [ ] Test CDN URL: `https://cdn.jsdelivr.net/npm/yourpackage@latest/`
- [ ] Update dashboard with embed code
- [ ] Document for customers

---

## Support & Resources

- **NPM Docs**: https://docs.npmjs.com
- **jsDelivr**: https://www.jsdelivr.com
- **Semantic Versioning**: https://semver.org
- **Package Best Practices**: https://docs.npmjs.com/packages-and-modules

---

**Bottom Line**: Use NPM + jsDelivr for a **completely free**, globally distributed, version-managed widget hosting solution! 🚀
