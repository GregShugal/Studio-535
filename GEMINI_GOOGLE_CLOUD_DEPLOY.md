# 🤖 Gemini-Assisted Google Cloud Platform Deployment Guide

> **For Gemini AI**: This guide provides step-by-step instructions to deploy Studio 535 to Google Cloud Platform. Read this entire document to understand the deployment architecture, then guide the user through each step.

---

## 📋 Deployment Overview

**What We're Deploying:**
- **Application**: Studio 535 (Express + React + TypeScript)
- **Platform**: Google Cloud Run (serverless containers)
- **Database**: TiDB Cloud (already configured externally)
- **File Storage**: Google Cloud Storage (S3-compatible)
- **Authentication**: Google OAuth (already configured)
- **Domain**: studio-535.com (or your custom domain)

**Estimated Monthly Cost:**
- Cloud Run: $0-5 (2M requests free)
- Cloud Storage: $0-1 (5GB free)
- **Total**: ~$0-10/month

---

## 🎯 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Google Cloud Account** - https://console.cloud.google.com
- [ ] **Billing Enabled** - Required even for free tier
- [ ] **gcloud CLI Installed** - https://cloud.google.com/sdk/docs/install
- [ ] **Docker Installed** - https://docs.docker.com/get-docker/
- [ ] **GitHub Repository** - gregsuptown/Studio-535 (already done ✅)
- [ ] **TiDB Database** - Already configured ✅
- [ ] **Google OAuth Credentials** - Already have ✅

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Google Cloud SDK

**For Windows PowerShell:**

```powershell
# Download and run installer
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

**Verify Installation:**

```bash
gcloud --version
```

Expected output: `Google Cloud SDK 4xx.x.x`

---

### Step 2: Authenticate and Set Up Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create studio-535 --name="Studio 535"

# Set as active project
gcloud config set project studio-535

# Enable billing (REQUIRED - you'll be prompted to link billing account)
gcloud beta billing projects link studio-535 --billing-account=YOUR_BILLING_ACCOUNT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  artifactregistry.googleapis.com
```

**⏱️ This takes ~2-3 minutes**

---

### Step 3: Create Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
# Use official Node.js 20 runtime
FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm@10

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port (Cloud Run uses PORT env var)
ENV PORT=8080
EXPOSE 8080

# Start application
CMD ["node", "dist/index.js"]
```

**Save this file as `Dockerfile` in the Studio535 directory.**

---

### Step 4: Create .dockerignore

Create `.dockerignore` to speed up builds:

```
node_modules
dist
.git
.env
.env.local
.env.production
*.md
.github
examples
patches
```

---

### Step 5: Set Up Secret Manager

Store sensitive environment variables in Google Secret Manager:

```bash
# Database URL
echo -n "mysql://H4QVmWV8yUYXjmz.root:hClcTcbkYgB3seLY@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test" | \
  gcloud secrets create database-url --data-file=-

# JWT Secret (generate new secure one)
openssl rand -base64 64 | tr -d '\n' | gcloud secrets create jwt-secret --data-file=-

# Google OAuth Client ID
echo -n "YOUR_GOOGLE_CLIENT_ID" | gcloud secrets create google-client-id --data-file=-

# Google OAuth Client Secret
echo -n "YOUR_GOOGLE_CLIENT_SECRET" | gcloud secrets create google-client-secret --data-file=-

# Owner Email
echo -n "greg141421@gmail.com" | gcloud secrets create owner-email --data-file=-
```

**⚠️ Replace YOUR_GOOGLE_CLIENT_ID and YOUR_GOOGLE_CLIENT_SECRET with actual values**

---

### Step 6: Create Cloud Storage Bucket for File Uploads

```bash
# Create bucket (must be globally unique)
gsutil mb -p studio-535 -c STANDARD -l us-central1 gs://studio-535-uploads/

# Make bucket publicly readable (for uploaded files)
gsutil iam ch allUsers:objectViewer gs://studio-535-uploads/

# Set CORS configuration
cat > cors.json <<EOF
[
  {
    "origin": ["https://studio-535.com", "https://*.run.app"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://studio-535-uploads/
```

---

### Step 7: Build and Deploy to Cloud Run

```bash
# Build container image using Cloud Build
gcloud builds submit --tag gcr.io/studio-535/studio-535-app

# Deploy to Cloud Run
gcloud run deploy studio-535 \
  --image gcr.io/studio-535/studio-535-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,VITE_APP_TITLE=Studio 535" \
  --set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,OWNER_EMAIL=owner-email:latest"
```

**⏱️ This takes ~5-10 minutes**

**Expected Output:**
```
Service [studio-535] revision [studio-535-00001-xxx] has been deployed
Service URL: https://studio-535-xxxxxxxx-uc.a.run.app
```

**✅ Your app is now live!**

---

### Step 8: Update OAuth Redirect URIs

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://studio-535-xxxxxxxx-uc.a.run.app/api/auth/google/callback
   ```
4. Click **Save**

---

### Step 9: Set Up Custom Domain (Optional)

```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service studio-535 \
  --domain studio-535.com \
  --region us-central1
```

**Follow the DNS configuration instructions shown.**

Then update OAuth redirect URI to:
```
https://studio-535.com/api/auth/google/callback
```

---

### Step 10: Run Database Migrations

```bash
# Install dependencies locally
pnpm install

# Run migrations against production database
pnpm deploy:migrate
```

**This creates all 22 tables in your TiDB Cloud database.**

---

## 🔄 Updating Your Deployment

Whenever you make code changes:

```bash
# 1. Commit to GitHub
git add .
git commit -m "Your changes"
git push origin main

# 2. Rebuild and redeploy
gcloud builds submit --tag gcr.io/studio-535/studio-535-app && \
gcloud run deploy studio-535 \
  --image gcr.io/studio-535/studio-535-app \
  --region us-central1
```

**⏱️ Takes ~3-5 minutes**

---

## 🤖 Gemini Usage Instructions

**When helping the user deploy:**

1. **Read this entire guide** before starting
2. **Execute steps sequentially** - don't skip ahead
3. **Wait for confirmation** before proceeding to next step
4. **Check for errors** after each command
5. **Provide context** - explain what each command does

**Common Issues to Watch For:**

- **Billing not enabled**: User must link billing account first
- **API not enabled**: Run the `gcloud services enable` commands
- **Port mismatch**: Cloud Run uses PORT=8080 by default
- **Secret not found**: Ensure all secrets are created in Step 5
- **OAuth redirect mismatch**: Must update Google Console after deployment

**Helpful Troubleshooting Commands:**

```bash
# Check service status
gcloud run services describe studio-535 --region us-central1

# View logs
gcloud run services logs read studio-535 --region us-central1

# List secrets
gcloud secrets list

# Test local Docker build
docker build -t studio-535-test .
docker run -p 8080:8080 studio-535-test
```

---

## 📊 Architecture Diagram

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│  studio-535.com         │
│  (Cloud Run)            │
│  ┌──────────────────┐   │
│  │ Node.js/Express  │   │
│  │ React Frontend   │   │
│  └──────────────────┘   │
└────┬────────────┬───────┘
     │            │
     ↓            ↓
┌──────────┐  ┌──────────────┐
│  TiDB    │  │ Cloud Storage│
│  Cloud   │  │ (Uploads)    │
│ (MySQL)  │  │              │
└──────────┘  └──────────────┘
```

---

## 💰 Cost Breakdown

**Cloud Run:**
- Free tier: 2M requests/month, 360,000 GB-seconds
- After free tier: $0.00002400/request
- **Your usage**: ~$0-5/month

**Cloud Storage:**
- Free tier: 5GB storage, 5,000 Class A operations
- After: $0.020/GB/month
- **Your usage**: ~$0-1/month

**Cloud Build:**
- Free tier: 120 build-minutes/day
- After: $0.003/build-minute
- **Your usage**: ~$0 (within free tier)

**Total Estimated**: **$0-10/month**

---

## ✅ Deployment Checklist

Use this checklist with Gemini:

**Pre-Deployment:**
- [ ] Google Cloud account created
- [ ] Billing enabled
- [ ] gcloud CLI installed
- [ ] Docker installed
- [ ] GitHub repository ready

**Initial Setup:**
- [ ] Project created in Google Cloud
- [ ] APIs enabled
- [ ] Dockerfile created
- [ ] .dockerignore created
- [ ] Secrets stored in Secret Manager
- [ ] Cloud Storage bucket created

**Deployment:**
- [ ] Container image built
- [ ] Service deployed to Cloud Run
- [ ] Service URL obtained
- [ ] OAuth redirect URIs updated
- [ ] Database migrations run
- [ ] App tested in production

**Post-Deployment:**
- [ ] Custom domain configured (optional)
- [ ] Stripe webhooks updated (when ready)
- [ ] File uploads tested
- [ ] Authentication tested
- [ ] Payment flow tested (when Stripe configured)

---

## 🆘 Getting Help

**If deployment fails:**

1. **Check logs:**
   ```bash
   gcloud run services logs read studio-535 --region us-central1 --limit 50
   ```

2. **Verify secrets:**
   ```bash
   gcloud secrets list
   gcloud secrets versions access latest --secret=database-url
   ```

3. **Test locally:**
   ```bash
   docker build -t test .
   docker run -p 8080:8080 -e DATABASE_URL="your-db-url" test
   ```

4. **Common Fixes:**
   - Port issues: Ensure app listens on `process.env.PORT || 8080`
   - Database SSL: Already fixed in `server/db.ts`
   - Build failures: Check Dockerfile syntax
   - Permission denied: Run `gcloud auth login` again

---

## 🎓 What You Learned

By following this guide, you've:
- ✅ Deployed a full-stack app to Google Cloud
- ✅ Used containerization with Docker
- ✅ Managed secrets securely with Secret Manager
- ✅ Set up Cloud Storage for file uploads
- ✅ Configured OAuth authentication
- ✅ Implemented database migrations
- ✅ Set up custom domains (optional)

---

## 🔗 Useful Links

- **Google Cloud Console**: https://console.cloud.google.com
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager
- **Cloud Storage**: https://console.cloud.google.com/storage
- **Billing**: https://console.cloud.google.com/billing
- **Service Logs**: https://console.cloud.google.com/run

---

**Last Updated**: 2025-12-15
**Repository**: https://github.com/gregsuptown/Studio-535
**Owner**: Greg (greg141421@gmail.com)

---

## 🤖 Gemini Quick Start Commands

**Copy these commands for Gemini to guide you through:**

```bash
# 1. Setup
gcloud auth login
gcloud config set project studio-535
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com storage.googleapis.com

# 2. Create secrets
echo -n "your-db-url" | gcloud secrets create database-url --data-file=-
openssl rand -base64 64 | tr -d '\n' | gcloud secrets create jwt-secret --data-file=-

# 3. Build and deploy
gcloud builds submit --tag gcr.io/studio-535/studio-535-app
gcloud run deploy studio-535 --image gcr.io/studio-535/studio-535-app --platform managed --region us-central1 --allow-unauthenticated

# 4. Get service URL
gcloud run services describe studio-535 --region us-central1 --format='value(status.url)'
```

**Now you're ready to deploy with Gemini!** 🚀
