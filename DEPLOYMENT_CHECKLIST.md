# Studio 535 - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Fixes Applied
- [x] Fixed package.json dependency version (@lucia-auth/adapter-drizzle)
- [x] Removed vite-plugin-manus-runtime dependency
- [x] Build successfully completes without errors
- [x] All dependencies installed correctly

### 🔧 Configuration Files Created
- [x] `.env` - Environment variables template
- [x] `wrangler.toml` - Cloudflare Pages configuration
- [x] `CLOUDFLARE_DEPLOYMENT.md` - Comprehensive deployment guide

---

## Deployment Steps

### 1. Database Setup (TiDB Cloud)
- [ ] Create TiDB Cloud account
- [ ] Create serverless cluster
- [ ] Get connection string
- [ ] Run database migrations: `pnpm db:push`
- [ ] Verify tables are created

### 2. OAuth Configuration
- [ ] **Google OAuth**
  - [ ] Create project in Google Cloud Console
  - [ ] Enable Google+ API
  - [ ] Create OAuth 2.0 credentials
  - [ ] Add authorized redirect URIs
  - [ ] Save Client ID and Secret
  
- [ ] **GitHub OAuth**
  - [ ] Create OAuth App in GitHub Settings
  - [ ] Configure callback URL
  - [ ] Save Client ID and Secret

### 3. File Storage Setup
- [ ] **Choose storage provider:**
  - [ ] Option A: Cloudflare R2 (recommended, free)
  - [ ] Option B: AWS S3
- [ ] Create bucket: `studio535-uploads`
- [ ] Generate access credentials
- [ ] Configure CORS if needed

### 4. Cloudflare Pages Deployment
- [ ] Connect GitHub repository to Cloudflare Pages
- [ ] Configure build settings:
  - Build command: `pnpm install && pnpm build`
  - Build output: `dist/public`
  - Node version: 18+
- [ ] Add all environment variables
- [ ] Deploy and verify build succeeds

### 5. Custom Domain (Optional)
- [ ] Add custom domain in Cloudflare Pages
- [ ] Update DNS records
- [ ] Update OAuth redirect URIs with new domain
- [ ] Verify HTTPS is working

### 6. Stripe Setup (Optional)
- [ ] Create Stripe account
- [ ] Get API keys (test and live)
- [ ] Configure webhook endpoint
- [ ] Add Stripe environment variables
- [ ] Test payment flow

### 7. Testing
- [ ] Visit deployed URL
- [ ] Test Google OAuth login
- [ ] Test GitHub OAuth login
- [ ] Test file upload functionality
- [ ] Submit test quote request
- [ ] Verify database entries
- [ ] Test admin dashboard access
- [ ] Check mobile responsiveness

### 8. Post-Deployment
- [ ] Set up monitoring/analytics
- [ ] Configure email notifications
- [ ] Review security settings
- [ ] Enable Cloudflare WAF (optional)
- [ ] Set up CI/CD for auto-deployments
- [ ] Document any custom configurations

---

## Environment Variables Required

### Essential Variables
```bash
DATABASE_URL=                    # TiDB connection string
JWT_SECRET=                      # 32+ character random string
GOOGLE_CLIENT_ID=                # From Google Cloud Console
GOOGLE_CLIENT_SECRET=            # From Google Cloud Console
GOOGLE_REDIRECT_URI=             # Your domain + /api/auth/google/callback
GITHUB_CLIENT_ID=                # From GitHub OAuth App
GITHUB_CLIENT_SECRET=            # From GitHub OAuth App
GITHUB_REDIRECT_URI=             # Your domain + /api/auth/github/callback
OWNER_EMAIL=                     # Admin email
AWS_ACCESS_KEY_ID=               # R2/S3 access key
AWS_SECRET_ACCESS_KEY=           # R2/S3 secret key
AWS_REGION=                      # auto (for R2) or us-east-1 (for S3)
AWS_S3_BUCKET=                   # Bucket name
VITE_APP_URL=                    # Production URL
```

### Optional Variables
```bash
STRIPE_SECRET_KEY=               # Stripe API key
VITE_STRIPE_PUBLISHABLE_KEY=     # Stripe public key
STRIPE_WEBHOOK_SECRET=           # Stripe webhook secret
VITE_APP_TITLE=                  # App title (default: Studio 535)
VITE_APP_LOGO=                   # Logo path (default: /logo.svg)
VITE_ANALYTICS_ENDPOINT=         # Analytics endpoint
VITE_ANALYTICS_WEBSITE_ID=       # Analytics site ID
```

---

## Troubleshooting Guide

### Build Failures
**Issue**: Build fails with module not found
- **Fix**: Run `pnpm install` and verify all dependencies are in package.json

**Issue**: TypeScript errors during build
- **Fix**: Run `pnpm check` locally to identify and fix type errors

### Database Connection
**Issue**: Cannot connect to database
- **Fix**: Verify DATABASE_URL format and TiDB cluster status
- **Fix**: Check IP whitelist settings in TiDB Cloud

### OAuth Issues
**Issue**: Redirect URI mismatch
- **Fix**: Ensure OAuth redirect URIs match your deployed domain exactly
- **Fix**: Include both .pages.dev and custom domain in OAuth settings

### File Upload Problems
**Issue**: File uploads fail with access denied
- **Fix**: Verify R2/S3 credentials are correct
- **Fix**: Check bucket permissions and CORS configuration

---

## Success Criteria

Your deployment is successful when:
- ✅ Site loads without errors at your domain
- ✅ Google OAuth login works
- ✅ GitHub OAuth login works
- ✅ File uploads save to R2/S3
- ✅ Quote form submissions save to database
- ✅ Admin dashboard is accessible
- ✅ HTTPS is enabled and working
- ✅ No console errors in browser

---

## Estimated Time

- **Database Setup**: 15 minutes
- **OAuth Configuration**: 20 minutes
- **File Storage Setup**: 10 minutes
- **Cloudflare Deployment**: 15 minutes
- **Testing**: 20 minutes
- **Total**: ~80 minutes

---

## Support Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **TiDB Cloud Docs**: https://docs.pingcap.com/tidbcloud
- **Google OAuth Setup**: https://console.cloud.google.com
- **GitHub OAuth Setup**: https://github.com/settings/developers
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2

---

**Ready to deploy? Follow the steps in CLOUDFLARE_DEPLOYMENT.md!**
