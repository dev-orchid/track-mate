# TrackMate - Vercel Deployment Guide

This guide explains how to deploy TrackMate to Vercel. The project consists of a Next.js client and Express.js server that can be deployed separately or together.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Option 1: Deploy Client Only](#option-1-deploy-client-only-recommended-for-testing)
- [Option 2: Deploy Client + Server on Vercel](#option-2-deploy-both-client-and-server-on-vercel)
- [Environment Variables](#environment-variables)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Troubleshooting](#troubleshooting)

## Overview

TrackMate uses a monorepo structure:
- **Client**: Next.js 15 admin dashboard (port 3000 locally)
- **Server**: Express.js REST API with MongoDB (port 8000 locally)

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Repository must be hosted on a Git provider
3. **MongoDB Atlas**: A MongoDB database (get one free at [mongodb.com/atlas](https://www.mongodb.com/atlas))
4. **Environment Variables**: Have your MongoDB URI and JWT secrets ready

## Deployment Options

### Option 1: Deploy Client Only (Recommended for Testing)

This option deploys only the Next.js client to Vercel. You'll need to host the server elsewhere (Railway, Render, DigitalOcean, etc.) or keep it running locally.

#### Critical Setup Requirements ⚠️

**MUST DO** or deployment will fail:

1. **Set Root Directory to `client`** in Vercel dashboard
   - Without this, you'll get "No Next.js version detected" error
   - This tells Vercel your app is in the client subfolder

2. **Add environment variables via Vercel UI only**
   - Never add them in vercel.json files
   - Add during project setup or in Settings → Environment Variables

#### Steps:

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Click "Import"

3. **Configure Build Settings**

   **IMPORTANT**: You must set the Root Directory!

   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `client` ⚠️ **MUST SET THIS!**
   - **Build Command**: Leave as default (`npm run build`)
   - **Output Directory**: Leave as default
   - **Install Command**: Leave as default (`npm install`)

4. **Add Environment Variables**

   Click "Environment Variables" and add:

   | Key | Value | Example |
   |-----|-------|---------|
   | `NEXT_PUBLIC_API_URL` | Your backend API URL | `https://your-api.railway.app` or `http://localhost:8000` for local testing |

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Visit your deployment URL

#### Deploy Server Separately

For the backend, consider these options:
- **Railway**: [railway.app](https://railway.app) - Easy setup, generous free tier
- **Render**: [render.com](https://render.com) - Free tier available
- **DigitalOcean App Platform**: [digitalocean.com](https://www.digitalocean.com/products/app-platform)
- **Heroku**: Classic option with free hobby tier
- **Self-hosted**: VPS with Docker

### Option 2: Deploy Both Client and Server on Vercel

This option deploys both the client and server to Vercel using serverless functions. The server will run as Vercel serverless functions.

#### Steps:

1. **Deploy Client** (Main Project)

   Follow steps 1-5 from Option 1 above.

2. **Deploy Server** (Separate Vercel Project)

   a. **Create New Project in Vercel**
      - Go to [vercel.com/new](https://vercel.com/new)
      - Select the same repository
      - Click "Import"

   b. **Configure Server Project**
      - **Framework Preset**: Other
      - **Root Directory**: `server`
      - **Build Command**: `npm install`
      - **Output Directory**: Leave empty
      - **Install Command**: `npm install`

   c. **Add Server Environment Variables**

      **IMPORTANT**: Add these in the Vercel dashboard during setup, NOT in vercel.json!

      During project import, click "Environment Variables" and add each one:

      | Key | Value | Example |
      |-----|-------|---------|
      | `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/trackmate` |
      | `JWT_SECRET` | Strong random string | `your-super-secret-jwt-key-here` |
      | `REFRESH_TOKEN_SECRET` | Another strong random string | `your-refresh-token-secret-here` |
      | `NODE_ENV` | `production` | `production` |

      Click "Add" after entering each variable.

   d. **Deploy Server**
      - Click "Deploy"
      - Copy your server deployment URL (e.g., `https://trackmate-server.vercel.app`)

3. **Update Client Environment Variable**

   - Go back to your client project in Vercel
   - Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your server URL
   - Example: `https://trackmate-server.vercel.app`
   - Click "Save"
   - Go to Deployments tab and redeploy

## Environment Variables

### Client Environment Variables

Create `client/.env.local` for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production (set in Vercel dashboard):

```env
NEXT_PUBLIC_API_URL=https://your-server-url.vercel.app
```

### Server Environment Variables

Create `server/.env` for local development:

```env
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trackmate?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
NODE_ENV=development
LOG_LEVEL=info
```

For production (set in Vercel dashboard):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trackmate?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
NODE_ENV=production
LOG_LEVEL=info
```

**Important Security Notes:**
- Use strong, random strings for JWT secrets (minimum 32 characters)
- Never commit `.env` files to Git
- Rotate secrets periodically
- Use different secrets for development and production

## Post-Deployment Configuration

### 1. Configure CORS

After deploying, you need to update CORS settings to allow your client domain.

**For serverless deployment** (server/api/index.js):
```javascript
app.use(cors({
  origin: ['https://your-client-url.vercel.app', 'https://your-custom-domain.com'],
  credentials: true
}));
```

**For separate hosting**, update `server/src/server.js`:
```javascript
app.use(cors({
  origin: ['https://your-client-url.vercel.app', 'https://your-custom-domain.com'],
  credentials: true
}));
```

### 2. Database Indexes

Ensure your MongoDB has proper indexes for optimal performance. Run this in MongoDB shell or Compass:

```javascript
// Profile indexes
db.profiles.createIndex({ "email": 1, "company_id": 1 }, { unique: true });
db.profiles.createIndex({ "company_id": 1, "createdAt": -1 });
db.profiles.createIndex({ "company_id": 1, "lastActive": -1 });

// Event indexes
db.events.createIndex({ "sessionId": 1, "company_id": 1 });
db.events.createIndex({ "userId": 1, "company_id": 1 });
db.events.createIndex({ "company_id": 1, "events.timestamp": -1 });

// WebhookLog indexes
db.webhooklogs.createIndex({ "company_id": 1, "created_at": -1 });
db.webhooklogs.createIndex({ "account_id": 1, "created_at": -1 });
```

### 3. Custom Domain (Optional)

**For Client:**
1. Go to your Vercel project → Settings → Domains
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Follow DNS configuration instructions
4. Update environment variables with new domain

**For Server:**
1. Repeat for server project (e.g., `api.yourdomain.com`)
2. Update `NEXT_PUBLIC_API_URL` in client to use new API domain

### 4. Test Your Deployment

1. **Test Authentication:**
   - Visit your client URL
   - Register a new account
   - Login and verify JWT tokens work

2. **Test Tracking:**
   - Copy tracking snippet from account settings
   - Test on a sample HTML page
   - Verify events appear in dashboard

3. **Test Webhooks:**
   - Get API key from account settings
   - Send test webhook (see API_GUIDE.md)
   - Verify in webhook logs

## Vercel CLI Deployment (Alternative)

You can also deploy using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy client
cd /path/to/track-mate
vercel --prod

# Deploy server (separate project)
cd server
vercel --prod
```

## Continuous Deployment

Once set up, Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

Configure branch settings in: Project Settings → Git → Production Branch

## Troubleshooting

### Deployment Configuration

**Error**: `No Next.js version detected` or `Could not identify Next.js version`
- **Cause**: Root Directory is not set to `client` in Vercel settings
- **Solution**:
  1. During project import, click "Edit" next to Root Directory
  2. Type `client` and save
  3. Vercel will now detect Next.js in the client subdirectory
- **Note**: This is required for monorepo structures

**Error**: `Environment Variable "MONGODB_URI" references Secret "mongodb-uri", which does not exist`
- **Cause**: This happens if you have environment variable references in vercel.json
- **Solution**: Remove the `env` section from vercel.json (already fixed in this repo)
- **How to add vars**: Always add environment variables through the Vercel dashboard during project setup, NOT in vercel.json
- Go to project settings → Environment Variables → Add each variable individually

### Build Fails

**Error**: `Cannot find module` or `ENOENT`
- **Solution**: Check that package.json dependencies are correct
- Run `npm install` locally to verify
- Clear Vercel cache: Settings → General → Clear Cache

**Error**: `Module not found: Can't resolve './utils/...'`
- **Solution**: Check import paths (case-sensitive in production)
- Verify files exist in Git repository

### Runtime Errors

**Error**: `MONGODB_URI is not defined`
- **Solution**: Add environment variables in Vercel dashboard
- Verify variable names match exactly (case-sensitive)

**Error**: `CORS policy blocked`
- **Solution**: Update CORS configuration in server code
- Add your Vercel domains to allowed origins
- Redeploy server

**Error**: `Failed to fetch` or network errors
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check server is deployed and running
- Test API endpoint directly in browser

### Database Connection Issues

**Error**: `MongoServerError: Authentication failed`
- **Solution**: Verify MongoDB URI is correct
- Check database user permissions
- Ensure IP whitelist includes `0.0.0.0/0` in MongoDB Atlas

**Error**: `Connection timeout`
- **Solution**: Check MongoDB Atlas allows connections from anywhere
- Network Access → Add IP Address → Allow Access from Anywhere

### Serverless Function Limits

Vercel serverless functions have limits:
- **Execution Time**: 10s (Hobby), 60s (Pro), 900s (Enterprise)
- **Payload Size**: 4.5MB request, 4.5MB response
- **Memory**: 1024MB (Hobby), 3008MB (Pro)

If you hit these limits, consider:
- Deploy server on Railway/Render instead
- Optimize queries and reduce payload sizes
- Upgrade Vercel plan

## Monitoring and Logs

### View Logs in Vercel

1. Go to project → Deployments
2. Click on a deployment
3. View "Functions" tab for serverless logs
4. View "Build Logs" for build issues

### Production Logging

The server uses Winston for logging:
- Check logs in Vercel Functions tab
- For external hosting, check hosting provider logs
- Consider adding external logging service (Datadog, LogDNA, etc.)

## Rollback

If deployment fails or has issues:

1. **Via Dashboard**:
   - Go to Deployments
   - Find last working deployment
   - Click "⋯" → "Promote to Production"

2. **Via Git**:
   ```bash
   git revert HEAD
   git push origin main
   ```

## Next Steps

- [ ] Set up custom domain
- [ ] Configure SSL certificates (automatic with Vercel)
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure team access in Vercel
- [ ] Set up staging environment (separate branch/project)
- [ ] Enable Vercel Protection (Pro plan) for preview deployments

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [TrackMate API Guide](./API_GUIDE.md)

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Vercel deployment logs
3. Check MongoDB connection
4. Open issue on GitHub repository

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
