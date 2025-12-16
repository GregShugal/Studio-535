# 🔧 STUDIO 535 - SHOULD CHANGE / WORK ON LIST

**Generated**: 2025-12-15
**Audit Status**: Comprehensive codebase audit completed
**Overall Grade**: C+ (Functional but needs hardening)
**Security Grade**: D (Critical issues exist)

---

## 🚨 CRITICAL - FIX IMMEDIATELY (Before ANY Deployment)

### Security Issues

- [ ] **1.1 ROTATE DATABASE CREDENTIALS** ⚠️ URGENT
  - **File**: `drizzle.config.ts` (Lines 8-12)
  - **Issue**: Production database password hardcoded in repository
  - **Action**:
    1. Generate new database password in TiDB Cloud
    2. Store in environment variable only
    3. Update drizzle.config.ts to use `process.env.DATABASE_URL`
  - **Risk**: Anyone with repo access can access production database

- [ ] **1.2 ROTATE GOOGLE OAUTH CREDENTIALS** ⚠️ URGENT
  - **File**: `.env` (Lines 16-17)
  - **Issue**: OAuth secrets committed to git
  - **Action**:
    1. Revoke current OAuth credentials in Google Console
    2. Generate new credentials
    3. Add `.env` to `.gitignore`
    4. Remove from git history: `git filter-branch --index-filter 'git rm --cached --ignore-unmatch .env'`
  - **Risk**: Attackers can impersonate your OAuth application

- [ ] **1.3 ADD AUTHORIZATION TO QUOTE UPDATES**
  - **File**: `server/routers.ts` (Lines 273-278)
  - **Issue**: Any user can approve/reject any quote
  - **Action**: Add `await verifyProjectAccess()` before `updateQuoteStatus()`
  - **Risk**: Users can manipulate quotes for projects they don't own

- [ ] **1.4 ADD AUTHORIZATION TO ORDER QUERIES**
  - **File**: `server/stripe-router.ts` (Lines 420-433)
  - **Issue**: Users can view payment info for any project
  - **Action**: Verify project ownership before returning orders
  - **Risk**: Privacy violation, financial data exposure

- [ ] **1.5 VALIDATE STRIPE WEBHOOK SECRET**
  - **File**: `server/_core/stripe-webhook-endpoint.ts` (Line 28)
  - **Issue**: Accepts empty webhook secret
  - **Action**: Throw error on startup if `STRIPE_WEBHOOK_SECRET` is not set
  - **Risk**: Unverified webhooks could be processed

- [ ] **1.6 GENERATE STRONG JWT SECRET**
  - **File**: `.env` (Line 13)
  - **Current**: `"studio535-super-secret-jwt-key-change-this-in-production"`
  - **Action**: Run `openssl rand -base64 64` and update
  - **Risk**: Weak secret allows session hijacking

- [ ] **1.7 FIX ALL 25 TYPESCRIPT ERRORS**
  - **Files**: `App.tsx`, `Admin.tsx`, `auth-routes.ts`, and others
  - **Issue**: Code won't compile in strict mode
  - **Action**: Run `pnpm check` and fix all errors
  - **Risk**: Runtime failures in production

---

## 🔴 HIGH PRIORITY - Fix Within 1 Week

### Database Schema

- [ ] **2.1 ADD FOREIGN KEY CONSTRAINTS**
  - **File**: `drizzle/schema.ts`
  - **Missing FK's**:
    ```typescript
    intakeForms.projectId → projects.id
    quotes.projectId → projects.id
    designs.projectId → projects.id
    statusUpdates.projectId → projects.id
    productionSetups.projectId → projects.id
    fulfillments.projectId → projects.id
    orders.projectId → projects.id
    ```
  - **Action**: Add `.references(() => projects.id, { onDelete: 'cascade' })`
  - **Impact**: Prevents orphaned records, ensures data integrity

- [ ] **2.2 ADD DATABASE INDEXES**
  - **File**: `drizzle/schema.ts`
  - **Add Indexes On**:
    ```typescript
    projects.clientEmail
    projects.status
    orders.userId
    orders.projectId
    catalogProducts.categoryId
    catalogProducts.isFeatured
    projectMessages.projectId
    ```
  - **Action**: Add `.index('idx_column_name', [column])`
  - **Impact**: 10-100x query performance improvement

### Code Quality

- [ ] **2.3 REMOVE 'ANY' TYPES (25+ instances)**
  - **Files**: `routers.ts`, `db.ts`, `Admin.tsx`, `ClientPortal.tsx`, `catalog-router.ts`
  - **Lines**: 47, 54, 90, 96, 204 (routers.ts) and many more
  - **Action**: Create proper TypeScript interfaces
  - **Example**:
    ```typescript
    // BAD
    async function verifyProjectAccess(projectId: number, user: any)

    // GOOD
    interface User {
      id: number;
      email: string;
      role: 'admin' | 'user';
    }
    async function verifyProjectAccess(projectId: number, user: User)
    ```

- [ ] **2.4 ADD COMPREHENSIVE ERROR HANDLING**
  - **Files**: Throughout codebase (only 16 try-catch blocks found)
  - **Priority Areas**:
    - File upload mutations (`routers.ts:588-615`)
    - Database queries
    - Network requests in components
  - **Action**: Wrap risky operations in try-catch with user-friendly messages

### Security

- [ ] **2.5 ADD RATE LIMITING**
  - **File**: `server/_core/index.ts`
  - **Issue**: No protection against DoS attacks
  - **Action**: Install `express-rate-limit` and configure
  - **Example**:
    ```typescript
    import rateLimit from 'express-rate-limit';
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    app.use('/api/', limiter);
    ```

- [ ] **2.6 CONFIGURE CORS PROPERLY**
  - **File**: `server/_core/index.ts`
  - **Issue**: No CORS headers configured
  - **Action**: Add CORS middleware with allowlist
  - **Example**:
    ```typescript
    import cors from 'cors';
    app.use(cors({
      origin: process.env.FRONTEND_URL,
      credentials: true
    }));
    ```

- [ ] **2.7 SANITIZE SEARCH INPUTS**
  - **File**: `server/catalog-router.ts` (Lines 112-114)
  - **Action**: Add length limits and character validation
  - **Example**:
    ```typescript
    .input(z.object({
      search: z.string().max(100).regex(/^[a-zA-Z0-9\s\-_]+$/),
    }))
    ```

### Configuration

- [ ] **2.8 VALIDATE REQUIRED ENV VARS ON STARTUP**
  - **File**: `server/_core/index.ts` (add at top of startup)
  - **Action**: Check all required variables exist
  - **Example**:
    ```typescript
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];

    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    });
    ```

---

## 🟡 MEDIUM PRIORITY - Fix Within 1 Month

### Frontend

- [ ] **3.1 ADD ACCESSIBILITY ATTRIBUTES**
  - **Files**: All pages in `client/src/pages/`
  - **Issue**: 0 instances of ARIA labels found
  - **Action**: Add `aria-label`, `role`, and `alt` attributes
  - **Example**:
    ```tsx
    <button aria-label="Submit quote request" role="button">
    <img src="/logo.svg" alt="Studio 535 Logo" />
    ```

- [ ] **3.2 SPLIT LARGE COMPONENTS**
  - **Files**:
    - `ComponentShowcase.tsx`: 1,437 lines → Split into test files
    - `ClientProjectDetail.tsx`: 536 lines → Extract sections
    - `ProjectDetail.tsx`: 417 lines → Extract forms
    - `CatalogCategory.tsx`: 336 lines → Extract product grid
  - **Action**: Keep components under 300 lines

- [ ] **3.3 ADD LOADING STATES**
  - **Files**: `ProjectDetail.tsx`, `CatalogCategory.tsx`, `ClientProjectDetail.tsx`
  - **Action**: Add skeleton loaders during data fetching
  - **Example**:
    ```tsx
    {isLoading ? <SkeletonLoader /> : <ActualContent />}
    ```

- [ ] **3.4 ADD GRANULAR ERROR BOUNDARIES**
  - **File**: Currently only in `main.tsx`
  - **Action**: Wrap critical sections in error boundaries
  - **Example**:
    ```tsx
    <ErrorBoundary fallback={<ErrorMessage />}>
      <CriticalSection />
    </ErrorBoundary>
    ```

### Code Quality

- [ ] **3.5 EXTRACT DUPLICATED CODE**
  - **Locations**:
    - Project access verification (duplicated in `stripe-router.ts` Lines 207-220, 303-317)
    - Order creation logic (3x in stripe router)
  - **Action**: Create shared utility functions
  - **Example**:
    ```typescript
    // utils/auth.ts
    export async function verifyProjectOwnership(
      projectId: number,
      userId: number,
      userRole: string
    ): Promise<Project> {
      // Shared logic
    }
    ```

- [ ] **3.6 IMPLEMENT STRUCTURED LOGGING**
  - **Issue**: 47 console.log statements across codebase
  - **Action**: Install `pino` or `winston`
  - **Example**:
    ```typescript
    import pino from 'pino';
    const logger = pino({
      level: process.env.LOG_LEVEL || 'info',
    });
    logger.info({ projectId, userId }, 'Project accessed');
    ```

- [ ] **3.7 ADD FORM VALIDATION FEEDBACK**
  - **Files**: `RequestQuote.tsx`, `ProjectDetail.tsx`
  - **Action**: Show inline validation errors
  - **Example**:
    ```tsx
    {errors.email && <span className="error">{errors.email.message}</span>}
    ```

### Database

- [ ] **3.8 STANDARDIZE NAMING CONVENTIONS**
  - **File**: `drizzle/schema.ts`
  - **Issue**: Mixed snake_case and camelCase
  - **Action**: Choose one convention (prefer snake_case for SQL)
  - **Tables to Rename**:
    ```
    intakeForms → intake_forms
    portfolioItems → portfolio_items
    statusUpdates → status_updates
    productionSetups → production_setups
    ```

- [ ] **3.9 ADD UNIQUE CONSTRAINTS**
  - **File**: `drizzle/schema.ts`
  - **Action**: Add unique constraints to prevent duplicates
  - **Example**:
    ```typescript
    oauthAccounts: mysqlTable("oauth_accounts", {
      // ...
    }, (table) => ({
      uniqueProviderAccount: unique().on(table.provider, table.providerAccountId)
    }))
    ```

- [ ] **3.10 ADD SOFT DELETE SUPPORT**
  - **File**: `drizzle/schema.ts`
  - **Tables**: `projects`, `quotes`, `designs`
  - **Action**: Add `deletedAt` timestamp column
  - **Example**:
    ```typescript
    deletedAt: timestamp("deleted_at"),
    ```

### Configuration

- [ ] **3.11 CREATE ENVIRONMENT-SPECIFIC CONFIGS**
  - **Current**: Single `.env` file
  - **Action**: Create `.env.development`, `.env.staging`, `.env.production`
  - **Update**: `.gitignore` to exclude all `.env.*` except `.env.example`

- [ ] **3.12 FIX DOCKERFILE TO USE PNPM**
  - **File**: `Dockerfile` (Line 5)
  - **Issue**: Uses npm instead of pnpm
  - **Action**: Already fixed in multi-stage build ✓ (verify deployment uses new Dockerfile)

- [ ] **3.13 ENABLE FULL TYPESCRIPT STRICT MODE**
  - **File**: `tsconfig.json`
  - **Action**: Add strict options
  - **Example**:
    ```json
    {
      "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true
      }
    }
    ```

### Deployment

- [ ] **3.14 ADD MIGRATION TO DEPLOYMENT PIPELINE**
  - **File**: Deployment scripts
  - **Action**: Run `pnpm deploy:migrate` before starting server
  - **Latest Migration**: `0006_violet_human_torch.sql`

- [ ] **3.15 CONFIGURE HEALTH CHECK MONITORING**
  - **Endpoint**: `/api/health` exists
  - **Action**: Add monitoring in deployment platform
  - **Test**: `curl http://localhost:8080/api/health`

- [ ] **3.16 ADD BUILD VALIDATION**
  - **File**: `package.json` build script
  - **Action**: Verify build artifacts exist
  - **Example**:
    ```json
    "build": "vite build && esbuild ... && node scripts/verify-build.js"
    ```

---

## 🟢 NICE-TO-HAVE - Improve Over Time

### Testing

- [ ] **4.1 ADD E2E TEST SUITE**
  - **Framework**: Playwright or Cypress
  - **Priority Tests**:
    - User authentication flow
    - Quote request submission
    - Payment processing
    - Project creation and tracking

- [ ] **4.2 ADD UNIT TESTS FOR UTILITIES**
  - **Target**: 80% coverage for business logic
  - **Priority**: Database queries, validation functions

### Performance

- [ ] **4.3 IMPLEMENT CACHING STRATEGY**
  - **Session Store**: Switch from cookies to Redis
  - **Static Assets**: Configure CDN
  - **API Responses**: Cache catalog queries

- [ ] **4.4 OPTIMIZE BUNDLE SIZE**
  - **Current**: 699KB JavaScript bundle
  - **Actions**:
    - Code split by route
    - Lazy load heavy components
    - Remove `ComponentShowcase.tsx` from production build
  - **Target**: <300KB per route

- [ ] **4.5 ADD IMAGE OPTIMIZATION**
  - **Tools**: Sharp, ImageMagick, or Cloudinary
  - **Actions**:
    - Compress uploaded images
    - Generate thumbnails
    - Serve WebP format

### Monitoring

- [ ] **4.6 SET UP APM MONITORING**
  - **Tools**: Sentry, DataDog, or New Relic
  - **Track**:
    - Error rates
    - Response times
    - Database query performance

- [ ] **4.7 ADD DATABASE QUERY MONITORING**
  - **Action**: Log slow queries (>100ms)
  - **Tool**: Drizzle ORM logger or database-level monitoring

- [ ] **4.8 CREATE MONITORING DASHBOARD**
  - **Metrics**:
    - Project creation rate
    - Quote conversion rate
    - Payment success rate
    - User engagement

### DevOps

- [ ] **4.9 ADD PRE-COMMIT HOOKS**
  - **Tool**: Husky
  - **Hooks**:
    - Run Prettier on commit
    - Run TypeScript check
    - Run linter
  - **Example**:
    ```json
    "husky": {
      "hooks": {
        "pre-commit": "lint-staged"
      }
    }
    ```

- [ ] **4.10 SET UP AUTOMATED BACKUPS**
  - **Database**: Daily backups to S3/Cloud Storage
  - **Files**: Sync uploaded files to backup bucket
  - **Retention**: 30 days

- [ ] **4.11 IMPLEMENT CI/CD PIPELINE**
  - **Current**: GitHub Actions for build/test exists ✓
  - **Add**: Automated deployment on merge to main

### Documentation

- [ ] **4.12 WRITE README.md**
  - **Current**: 11 bytes (nearly empty)
  - **Include**:
    - Project overview
    - Setup instructions
    - Architecture diagram
    - Contributing guidelines

- [ ] **4.13 ADD API DOCUMENTATION**
  - **Tool**: tRPC built-in docs or Swagger
  - **Coverage**: All public endpoints

- [ ] **4.14 CREATE ARCHITECTURE DIAGRAM**
  - **Tool**: Mermaid, Draw.io, or Excalidraw
  - **Show**: Frontend → Backend → Database → External Services

### Code Quality

- [ ] **4.15 ADD CODE FORMATTING ENFORCEMENT**
  - **Tool**: Prettier (already configured ✓)
  - **Action**: Run on save and in pre-commit hook

- [ ] **4.16 SET UP DEPENDENCY UPDATES**
  - **Tool**: Dependabot or Renovate
  - **Action**: Automated PRs for dependency updates

---

## 📊 PROGRESS TRACKING

### Security Issues
- [ ] 0 / 7 Critical security issues fixed
- **Blocking Deployment**: YES ⛔

### Code Quality
- [ ] 0 / 25 TypeScript errors fixed
- [ ] 0 / 25 'any' types replaced
- **Blocking Deployment**: YES ⛔

### Database
- [ ] 0 / 7 Foreign keys added
- [ ] 0 / 7 Indexes added
- **Blocking Deployment**: NO (but impacts performance)

### Configuration
- [ ] 0 / 8 Environment variables configured
- **Blocking Deployment**: YES ⛔ (AWS, Stripe required for features)

### Deployment
- [ ] Database migrations run: NO
- [ ] Health checks configured: NO
- [ ] Monitoring set up: NO
- **Ready for Production**: NO ⛔

---

## 🎯 RECOMMENDED WORKFLOW

### Week 1: Security Hardening
1. Rotate all credentials (database, OAuth, JWT)
2. Fix authorization vulnerabilities
3. Add environment variable validation
4. Fix TypeScript errors

### Week 2: Core Stability
1. Add database foreign keys and indexes
2. Remove 'any' types
3. Add comprehensive error handling
4. Configure rate limiting and CORS

### Week 3: Production Readiness
1. Add accessibility attributes
2. Implement structured logging
3. Run and verify database migrations
4. Set up health check monitoring

### Week 4: Quality & Testing
1. Refactor large components
2. Add E2E tests
3. Implement caching
4. Set up APM monitoring

---

## 📞 GETTING HELP

If you need assistance with any of these items:

1. **Security Issues**: Refer to OWASP guidelines or consult security expert
2. **Database Design**: Review Drizzle ORM docs and SQL best practices
3. **TypeScript**: Enable strict mode gradually, fix errors one file at a time
4. **Deployment**: Use `GEMINI_GOOGLE_CLOUD_DEPLOY.md` guide with Gemini AI

---

## ✅ DEFINITION OF DONE

**Production Ready When:**
- [ ] All 7 critical security issues fixed
- [ ] All 25 TypeScript errors resolved
- [ ] Database migrations run successfully
- [ ] Environment variables configured and validated
- [ ] Rate limiting and CORS configured
- [ ] Health checks passing
- [ ] At least 10 high-priority items completed

**Current Status**: 🔴 **NOT READY FOR PRODUCTION**

---

**Last Updated**: 2025-12-15
**Audit By**: Claude Code
**Next Review**: After fixing critical issues
