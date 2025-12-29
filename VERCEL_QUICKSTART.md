# Vercel Quick Start Guide

Deploy TrackMate to Vercel in 10 minutes.

## ⚠️ Critical: Set Root Directory to `client`

**If you skip this step, deployment WILL fail!**

When importing your project, you MUST set the Root Directory to `client`. This tells Vercel your Next.js app is in a subdirectory.

## Quick Deploy - Client Only

This is the fastest way to get started. Deploy the client to Vercel, use your existing backend.

### 1. Prepare Repository

```bash
# Ensure code is committed and pushed
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Import to Vercel

1. Visit: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `track-mate` repository
4. Click "Import"

### 3. Configure Project

**IMPORTANT - Set Root Directory First!**

Before anything else, configure:
1. **Root Directory**: Type `client` and click "Edit"
   - This tells Vercel your Next.js app is in the client folder
2. Vercel will auto-detect Framework as "Next.js" ✓
3. Leave Build Command and Install Command as defaults

**Then Add Environment Variable:**
1. Scroll to "Environment Variables" section
2. Add this variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: Your backend URL (e.g., `https://your-api.railway.app` or `https://your-server.vercel.app`)
3. Click "Add"

### 4. Deploy

Click "Deploy" and wait 2-5 minutes.

Done! Your client is now live at `https://your-project.vercel.app`

## Quick Deploy - Full Stack (Client + Server)

Deploy both client and server to Vercel.

### 1. Deploy Client (Main Project)

Follow steps 1-3 above:
1. Import repository
2. Set **Root Directory** to `client`
3. Add environment variable `NEXT_PUBLIC_API_URL` (you can use a placeholder like `https://placeholder.vercel.app` - you'll update this after deploying server)
4. Deploy

### 2. Deploy Server (Separate Project)

1. Create new project: https://vercel.com/new
2. Select same repository
3. In "Configure Project":
   - **Root Directory**: Select `server`
4. **Click "Environment Variables"** and add each one individually:
   - `MONGODB_URI` = `mongodb+srv://user:pass@cluster.mongodb.net/trackmate`
   - `JWT_SECRET` = `your-secret-key-here` (use a strong random string)
   - `REFRESH_TOKEN_SECRET` = `your-refresh-secret-here` (use a different strong random string)
   - `NODE_ENV` = `production`

   Click "Add" after entering each variable.
5. Click "Deploy"
6. Copy your server URL (e.g., `https://trackmate-server.vercel.app`)

### 3. Update Client

1. Go to client project in Vercel
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` to your server URL
4. Save and redeploy

Done! Both client and server are now live on Vercel.

## Environment Variables Checklist

### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-server-url.vercel.app
```

### Server (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/trackmate
JWT_SECRET=your-32-character-secret-key
REFRESH_TOKEN_SECRET=your-32-character-refresh-key
NODE_ENV=production
```

## Post-Deployment

1. **Test Login**: Visit your client URL and register/login
2. **Update CORS**: Add your Vercel domains to server CORS settings
3. **Test Tracking**: Copy tracking snippet from settings
4. **Custom Domain**: (Optional) Add in Vercel project settings

## Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check logs in Vercel dashboard, verify package.json |
| CORS errors | Update CORS in `server/src/server.js` or `server/api/index.js` |
| Database errors | Verify MongoDB URI and whitelist IP `0.0.0.0/0` |
| 404 on API | Verify `NEXT_PUBLIC_API_URL` is set correctly |

## Need Help?

See full documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Vercel CLI (Alternative)

```bash
# Install CLI
npm install -g vercel

# Deploy client
vercel --prod

# Deploy server
cd server
vercel --prod
```

---

**Deployment Status**: ✅ Ready for Vercel

**Next Steps**:
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy
