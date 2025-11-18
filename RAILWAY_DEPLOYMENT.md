# 🚂 Railway Deployment Guide

Complete step-by-step guide to deploy Movie Review Aggregator to Railway.

## Prerequisites

- GitHub account with your repository
- Railway account (sign up at [railway.app](https://railway.app))
- Google Cloud Console account (for OAuth)
- OpenAI API key

---

## Part 1: Deploy PostgreSQL Database

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Click **"Deploy PostgreSQL"**
4. Railway will create a PostgreSQL database

### Step 2: Get Database Credentials

1. Click on the **PostgreSQL service**
2. Go to **"Variables"** tab
3. You'll see several variables. Look for these:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

4. **Copy the DATABASE_URL** (or construct it):
   ```
   postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
   ```

   Or click **"Connect"** and copy the **"Postgres Connection URL"**

5. **Save this URL** - you'll need it in Step 5!

---

## Part 2: Deploy Next.js Application

### Step 3: Add Next.js Service to Railway

1. In the same Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Authorize Railway to access your GitHub
4. Select your repository: `review_aggregator_app`
5. Select branch: `claude/movie-review-aggregator-01HbLcQfpmtffdHo74Fx4SMY`
6. Click **"Deploy"**

### Step 4: Wait for Initial Build

Railway will start building your app (this will fail first time - that's OK!)
- You'll see logs in the **"Deployments"** tab
- Wait for it to fail (missing environment variables)

### Step 5: Configure Environment Variables

1. Click on your **Next.js service**
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add the following variables one by one:

#### Required Variables:

**DATABASE_URL**
```
postgresql://postgres:password@hostname:port/database
```
👉 Use the URL from Step 2!

**NEXTAUTH_URL**
```
https://your-app-name.up.railway.app
```
👉 Get this from the "Settings" tab → "Domains" (you'll set this in Step 6)

**NEXTAUTH_SECRET**
```bash
# Generate on your local machine:
openssl rand -base64 32
# Then paste the output here
```

**GOOGLE_CLIENT_ID**
```
your-google-client-id.apps.googleusercontent.com
```

**GOOGLE_CLIENT_SECRET**
```
GOCSPX-your-google-client-secret
```

**OPENAI_API_KEY**
```
sk-proj-your-openai-key
```

**NODE_ENV**
```
production
```

### Step 6: Generate Public Domain

1. Still in your Next.js service, go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Railway will create a URL like: `your-app-name.up.railway.app`
5. **Copy this URL**
6. Go back to **"Variables"** tab
7. Update **NEXTAUTH_URL** with this domain:
   ```
   https://your-app-name.up.railway.app
   ```

### Step 7: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click on your OAuth 2.0 Client ID
5. Under **"Authorized redirect URIs"**, add:
   ```
   https://your-app-name.up.railway.app/api/auth/callback/google
   ```
6. Keep the localhost one for local development:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **"Save"**

### Step 8: Redeploy Application

1. Go back to Railway
2. Click on your Next.js service
3. Go to **"Deployments"** tab
4. Click the **three dots** (⋮) on the latest deployment
5. Click **"Redeploy"**

Or simply:
- Make a small change to your code and push to GitHub
- Railway will auto-deploy

---

## Part 3: Initialize Database Schema

### Step 9: Run Prisma Migrations

You need to push your Prisma schema to the Railway database:

**Option A: From Local Machine**

1. Copy the DATABASE_URL from Railway
2. On your local machine, create a temporary `.env.production` file:
   ```env
   DATABASE_URL="postgresql://user:pass@host:port/db"
   ```

3. Run Prisma push:
   ```bash
   dotenv -e .env.production -- npx prisma db push
   ```

**Option B: Using Railway CLI**

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Run Prisma migration:
   ```bash
   railway run npx prisma db push
   ```

---

## Part 4: Verify Deployment

### Step 10: Test Your Application

1. Visit your Railway URL: `https://your-app-name.up.railway.app`
2. You should see the homepage
3. Try signing in at `/admin`:
   - Click "Sign in with Google"
   - Should redirect to Google
   - After authentication, should return to admin dashboard

### Step 11: Check Logs

If something isn't working:

1. In Railway, click your Next.js service
2. Go to **"Logs"** tab
3. Look for errors in the deployment logs
4. Common issues:
   - Missing environment variables
   - Database connection errors
   - Google OAuth redirect URI mismatch

---

## Environment Variables Summary

Here's a checklist of all required variables:

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `DATABASE_URL` | Railway PostgreSQL service | `postgresql://...` |
| `NEXTAUTH_URL` | Railway generated domain | `https://app.up.railway.app` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Random 32-char string |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | `GOCSPX-...` |
| `OPENAI_API_KEY` | OpenAI Platform | `sk-proj-...` |
| `NODE_ENV` | Manual | `production` |

---

## Troubleshooting

### Error: "Can't reach database server"

**Solution:**
- Check DATABASE_URL is correct
- Verify PostgreSQL service is running in Railway
- Check if DATABASE_URL includes `?schema=public` if needed

### Error: "redirect_uri_mismatch" (Google OAuth)

**Solution:**
- Verify redirect URI in Google Console matches exactly:
  ```
  https://your-app-name.up.railway.app/api/auth/callback/google
  ```
- No trailing slash
- Must use HTTPS (not HTTP)

### Error: "Prisma Client did not initialize yet"

**Solution:**
```bash
# Run this on Railway CLI or redeploy
railway run npx prisma generate
```

### Application is slow to load

**Solution:**
- Railway hobby plan has cold starts
- First request after inactivity takes ~30 seconds
- Consider upgrading to paid plan for persistent instances

### Error: "OpenAI API Error"

**Solution:**
- Verify API key is correct
- Check you have credits/billing set up on OpenAI
- Review API usage limits

---

## Cost Estimation

**Railway Pricing:**
- Free tier: $5 credit/month
- Hobby plan: $5/month
- Estimated usage:
  - PostgreSQL: ~$2-3/month
  - Next.js app: ~$2-3/month
  - Total: ~$4-6/month

**Tips to reduce costs:**
- Use Railway's free tier for testing
- Deploy to Vercel (free) + Railway DB only
- Optimize API calls to reduce compute time

---

## Alternative: Deploy to Vercel + Railway DB

If you want to use Vercel for the frontend (free tier):

1. **Keep PostgreSQL on Railway** (follow Part 1)
2. **Deploy Next.js to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Configure environment variables on Vercel:**
   - Use Railway DATABASE_URL
   - Set NEXTAUTH_URL to Vercel domain
   - Add all other env vars

---

## Post-Deployment

### Monitor Your Application

1. **Railway Metrics:**
   - View CPU, Memory, Network usage
   - Monitor deployment logs
   - Set up usage alerts

2. **Application Monitoring:**
   - Consider adding Sentry for error tracking
   - Use PostHog or Mixpanel for analytics
   - Monitor OpenAI API usage

### Automatic Deployments

Railway will automatically deploy when you push to your branch:

```bash
git add .
git commit -m "Update feature"
git push origin claude/movie-review-aggregator-01HbLcQfpmtffdHo74Fx4SMY
```

Railway detects the push and redeploys automatically!

---

## Custom Domain (Optional)

To use your own domain like `moviereviews.com`:

1. In Railway, go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter your domain: `moviereviews.com`
4. Railway provides DNS records
5. Add these records to your domain registrar:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `your-app.up.railway.app`
6. Wait for DNS propagation (5-60 minutes)
7. Update `NEXTAUTH_URL` to your custom domain
8. Update Google OAuth redirect URI to match

---

## Backup Strategy

**Database Backups:**

1. Railway doesn't auto-backup free tier
2. Use Prisma to export data:
   ```bash
   railway run npx prisma db pull
   ```

3. Or use pg_dump:
   ```bash
   railway run pg_dump $DATABASE_URL > backup.sql
   ```

**Recommended:** Upgrade to Railway Pro for automatic backups

---

## Success! 🎉

Your Movie Review Aggregator is now live on Railway!

**Next Steps:**
1. Share your URL with users
2. Create your first movie in the admin panel
3. Test the full workflow (add reviews, generate summaries)
4. Monitor usage and costs
5. Set up a custom domain (optional)

**Your Live URLs:**
- 🌐 Public Site: `https://your-app-name.up.railway.app`
- 🔐 Admin Panel: `https://your-app-name.up.railway.app/admin`

---

**Need help?** Check Railway docs at [docs.railway.app](https://docs.railway.app)
