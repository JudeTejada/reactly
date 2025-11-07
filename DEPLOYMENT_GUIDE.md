# Reactly Deployment Guide

Complete guide to deploy your AI-powered feedback platform to production.

## Overview

The Reactly platform consists of 3 main components:
1. **Backend API** (NestJS) - Handle feedback, authentication, AI analysis
2. **Frontend Dashboard** (Next.js) - Admin dashboard and landing pages
3. **Feedback Widget** (React) - Embeddable widget for customer websites

## Table of Contents

- [Prerequisites](#prerequisites)
- [Database Setup (NeonDB)](#database-setup-neondb)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Widget Deployment](#widget-deployment)
- [Domain & DNS Setup](#domain--dns-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account (for code repository)
- [ ] Vercel account (for frontend) - https://vercel.com
- [ ] Railway account (for backend) - https://railway.app
- [ ] NeonDB account (database) - https://neon.tech
- [ ] Clerk account (authentication) - https://clerk.com
- [ ] Google AI Studio account (Gemini API) - https://aistudio.google.com
- [ ] Domain name (optional but recommended)

---

## Database Setup (NeonDB)

### Step 1: Create NeonDB Project

1. Go to https://console.neon.tech
2. Click "Create a project"
3. Choose:
   - Name: `reactly-production`
   - Region: Choose closest to your users
   - Postgres version: 16 (latest)
4. Click "Create Project"

### Step 2: Get Connection String

1. In your NeonDB dashboard, go to "Connection Details"
2. Select "Pooled connection" (recommended for serverless)
3. Copy the connection string:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this for later use

### Step 3: Run Migrations

```bash
# Update backend .env with production DATABASE_URL
cd apps/backend
pnpm db:push
```

This creates all necessary tables in your production database.

---

## Backend Deployment

We'll use **Railway** for backend deployment (free tier available).

### Option 1: Railway (Recommended)

#### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Ready for deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/reactly.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `reactly` repository
5. Select root directory
6. Railway will auto-detect the monorepo

#### Step 3: Configure Railway

1. **Set Root Directory**:
   - Go to Settings → Service
   - Set "Root Directory" to `apps/backend`

2. **Set Build Command**:
   ```bash
   cd apps/backend && pnpm install && pnpm build
   ```

3. **Set Start Command**:
   ```bash
   cd apps/backend && pnpm start:prod
   ```

4. **Add Environment Variables**:
   - Go to Variables tab
   - Add all variables (see [Environment Variables](#environment-variables) section)

5. **Generate Domain**:
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Save the URL: `https://your-app.railway.app`

#### Step 4: Verify Deployment

Visit: `https://your-app.railway.app/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-06T...",
  "database": "connected"
}
```

### Option 2: Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: `reactly-backend`
   - **Root Directory**: `apps/backend`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start:prod`
   - **Add Environment Variables**
5. Click "Create Web Service"

### Option 3: Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create reactly-backend

# Set buildpacks
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set DATABASE_URL="postgresql://..."
heroku config:set CLERK_SECRET_KEY="sk_..."
# ... add all other env vars

# Deploy
git push heroku main
```

---

## Frontend Deployment

We'll use **Vercel** for frontend deployment (free tier with excellent Next.js support).

### Step 1: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 2: Configure Vercel

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `apps/web`
3. **Build Command**: `cd apps/web && pnpm install && pnpm build`
4. **Output Directory**: `apps/web/.next`

### Step 3: Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# API
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### Step 4: Deploy

Click "Deploy" and wait for build to complete.

Your dashboard will be live at: `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Update DNS records as shown
4. Wait for SSL certificate (automatic)

---

## Widget Deployment

The widget needs to be hosted on a CDN for customers to embed.

### Option 1: Vercel Edge (Recommended)

#### Step 1: Build Widget

```bash
cd apps/widget
pnpm build
```

This creates:
- `dist/widget.umd.js` - Universal module
- `dist/widget.es.js` - ES module
- `dist/style.css` - Styles (if not injected)

#### Step 2: Deploy Widget to Vercel

Create a new Vercel project for the widget:

```bash
cd apps/widget
vercel --prod
```

Or via Vercel dashboard:
1. New Project → Import `apps/widget`
2. Build Command: `pnpm build`
3. Output Directory: `dist`
4. Deploy

Your widget will be at: `https://widget.vercel.app/widget.umd.js`

### Option 2: Cloudflare Pages

1. Go to Cloudflare Pages
2. Connect GitHub repo
3. Root Directory: `apps/widget`
4. Build Command: `pnpm install && pnpm build`
5. Build Output: `dist`
6. Deploy

### Option 3: AWS S3 + CloudFront

```bash
# Build widget
cd apps/widget
pnpm build

# Upload to S3
aws s3 sync dist/ s3://your-bucket/widget/ --acl public-read

# CloudFront distribution for CDN
# Create distribution pointing to S3 bucket
```

### Widget Embed Code

Customers will use:

```html
<script src="https://widget.vercel.app/widget.umd.js" 
        data-reactly-api-key="customer_api_key"
        data-reactly-project-id="project_id"
        data-position="bottom-right">
</script>
```

---

## Domain & DNS Setup

### Backend Domain

1. **Railway Custom Domain**:
   - Go to Railway → Settings → Networking
   - Add custom domain: `api.yourdomain.com`
   - Add CNAME record in your DNS:
     ```
     CNAME api.yourdomain.com → your-app.railway.app
     ```

### Frontend Domain

1. **Vercel Custom Domain**:
   - Add domain in Vercel settings
   - Update DNS:
     ```
     A @ 76.76.21.21
     CNAME www your-project.vercel.app
     ```

### Update CORS

In backend `.env` or Railway variables:

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://widget.yourdomain.com
```

---

## Environment Variables

### Backend Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=production

# Database (NeonDB)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxx

# Google Gemini AI
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxx

# Discord Webhook (Optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://widget.yourdomain.com
```

### Frontend Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Widget Configuration

Passed via embed code, no build-time env vars needed.

---

## Post-Deployment

### 1. Update Clerk Settings

1. Go to Clerk Dashboard → Applications
2. Update **Authorized domains**:
   - Add `yourdomain.com`
   - Add `www.yourdomain.com`
3. Update **Authorized redirect URLs**:
   - `https://yourdomain.com/sign-in`
   - `https://yourdomain.com/sign-up`
   - `https://yourdomain.com/dashboard`

### 2. Test Complete Flow

#### Test Authentication
1. Visit: `https://yourdomain.com`
2. Click "Sign Up"
3. Complete registration
4. Should redirect to dashboard

#### Test Project Creation
1. Go to Projects page
2. Create a new project
3. Copy API key and Project ID

#### Test Widget
Create test HTML file:

```html
<!DOCTYPE html>
<html>
<head><title>Widget Test</title></head>
<body>
  <h1>Test Page</h1>
  
  <script src="https://widget.yourdomain.com/widget.umd.js" 
          data-reactly-api-key="YOUR_API_KEY"
          data-reactly-project-id="YOUR_PROJECT_ID"
          data-position="bottom-right">
  </script>
</body>
</html>
```

#### Test Feedback Submission
1. Open test page
2. Click feedback button
3. Submit feedback
4. Verify it appears in dashboard
5. Check sentiment analysis worked

### 3. Set Up Monitoring

#### Railway Monitoring
- View logs: Railway Dashboard → Logs
- Set up alerts for errors
- Monitor resource usage

#### Vercel Analytics
- Enable Vercel Analytics
- Track page views, errors
- Monitor Core Web Vitals

#### Database Monitoring
- NeonDB dashboard shows:
  - Connection count
  - Query performance
  - Storage usage

### 4. Performance Optimization

#### Enable Caching
```typescript
// In API responses
res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
```

#### CDN for Widget
- Use CDN for widget distribution
- Enable compression (gzip/brotli)
- Set long cache times for widget files

#### Database Optimization
- Add indexes for frequently queried fields
- Use connection pooling (already configured with Neon)
- Monitor slow queries

---

## Monitoring & Maintenance

### Health Checks

Set up automated health checks:

```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend health
curl https://yourdomain.com
```

### Backup Strategy

#### Database Backups
- NeonDB provides automatic daily backups
- To restore: NeonDB Dashboard → Backups → Restore

#### Code Backups
- Keep GitHub repository updated
- Tag releases: `git tag v1.0.0 && git push --tags`

### Update Dependencies

Regularly update packages:

```bash
# Check for updates
pnpm outdated

# Update all packages
pnpm update --latest

# Test thoroughly after updates
pnpm build
pnpm test
```

### SSL Certificates

- Vercel: Automatic SSL (Let's Encrypt)
- Railway: Automatic SSL
- Custom domains: Verify SSL is active

### Scaling Considerations

#### Backend Scaling
- Railway auto-scales with usage
- Monitor response times
- Consider upgrading plan if needed

#### Database Scaling
- NeonDB can scale compute and storage
- Monitor connection count
- Add read replicas if needed

#### Widget CDN
- CDN automatically handles scaling
- Global edge distribution
- No action needed

---

## Troubleshooting

### Common Issues

#### CORS Errors
**Problem**: Widget can't connect to backend

**Solution**: Update `ALLOWED_ORIGINS` in backend env vars to include widget domain

#### Authentication Failures
**Problem**: Can't sign in/up

**Solution**: 
- Verify Clerk keys are correct
- Check authorized domains in Clerk dashboard
- Ensure redirect URLs are configured

#### Database Connection Issues
**Problem**: "Database disconnected" health check

**Solution**:
- Verify DATABASE_URL is correct
- Check NeonDB is active (not paused)
- Verify IP is whitelisted (usually not needed with Neon)

#### Widget Not Loading
**Problem**: Widget doesn't appear on page

**Solution**:
- Check browser console for errors
- Verify widget URL is accessible
- Ensure API key and project ID are correct
- Check CORS settings

### Support Resources

- **Railway Support**: https://help.railway.app
- **Vercel Support**: https://vercel.com/support
- **NeonDB Docs**: https://neon.tech/docs
- **Clerk Docs**: https://clerk.com/docs
- **Gemini API**: https://ai.google.dev/docs

---

## Cost Estimation

### Free Tier (Development/Small Apps)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Railway | $5 free credits/month | ~50 hours runtime |
| Vercel | 100GB bandwidth | Unlimited projects |
| NeonDB | 0.5GB storage | 1 project |
| Clerk | 10,000 MAU | Unlimited apps |
| Gemini | 60 req/min | 1,500/day |

**Total Cost**: $0/month for <10K users

### Paid Tier (Production)

| Service | Plan | Cost |
|---------|------|------|
| Railway | Pro | $20/month |
| Vercel | Pro | $20/month |
| NeonDB | Scale | $19/month |
| Clerk | Pro | $25/month |
| Gemini | Pay-as-you-go | ~$0.50/1K req |

**Estimated**: $84-100/month for 10K-100K users

---

## Checklist

Use this checklist for deployment:

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database schema finalized

### Database
- [ ] NeonDB project created
- [ ] Connection string obtained
- [ ] Migrations run successfully
- [ ] Backup configured

### Backend
- [ ] Deployed to Railway/Render
- [ ] Environment variables set
- [ ] Health check passing
- [ ] API docs accessible
- [ ] Custom domain configured (optional)

### Frontend
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Authentication working
- [ ] Dashboard accessible
- [ ] Custom domain configured (optional)

### Widget
- [ ] Built and deployed to CDN
- [ ] Embed code tested
- [ ] CORS configured correctly
- [ ] Loading on test page

### Post-Deployment
- [ ] Clerk domains updated
- [ ] End-to-end testing complete
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team notified

---

## Next Steps

After deployment:

1. **Monitor Usage**: Track API calls, database queries, user signups
2. **Gather Feedback**: Use your own platform to collect feedback!
3. **Iterate**: Deploy updates regularly
4. **Scale**: Upgrade plans as you grow
5. **Market**: Share with potential customers

## Support

For deployment help:
- Open an issue on GitHub
- Check troubleshooting section
- Review platform documentation

---

**Congratulations on deploying Reactly! 🎉**

Your AI-powered feedback platform is now live and ready to help businesses understand their customers better.
