# Environment Variables Setup Guide

## 📋 Required Environment Variables

### 1. Database Configuration (Supabase)

**Get these from your Supabase project dashboard:** https://supabase.com/dashboard

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get them:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the URL and anon key (public)
4. Copy the service_role key (keep this secret!)

### 2. AI Service Configuration (OpenAI)

**Get from OpenAI:** https://platform.openai.com/api-keys

```bash
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
```

**How to get it:**
1. Sign up/login to OpenAI
2. Go to API Keys section
3. Create a new API key
4. Set usage limits to control costs

### 3. Payment Service (Polar)

**Get from Polar dashboard:** https://polar.sh

```bash
POLAR_ACCESS_TOKEN=polar_at_your_access_token
POLAR_WEBHOOK_SECRET=whsec_your_webhook_secret
POLAR_ORGANIZATION_ID=your_organization_uuid
```

**How to get them:**
1. Sign up/login to Polar
2. Go to Settings → API Keys for access token
3. Go to Webhooks section for webhook secret
4. Organization ID is in your organization settings

### 4. External Services

```bash
RESUME_PARSER_URL=https://your-resume-parser-service.com
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔧 Setup Instructions

### For Local Development

1. **Create `.env.local` file** in your project root:

```bash
# Copy this template and fill in your values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your_openai_key
POLAR_ACCESS_TOKEN=your_polar_token
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_ORGANIZATION_ID=your_org_id
RESUME_PARSER_URL=http://localhost:8000
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Restart your development server** after adding environment variables

### For Vercel Production Deployment

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add each variable:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiI...` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiI...` | Production |
| `OPENAI_API_KEY` | `sk-proj-...` | Production |
| `POLAR_ACCESS_TOKEN` | `polar_at_...` | Production |
| `POLAR_WEBHOOK_SECRET` | `whsec_...` | Production |
| `POLAR_ORGANIZATION_ID` | `your-org-uuid` | Production |
| `RESUME_PARSER_URL` | `https://your-parser.com` | Production |
| `NODE_ENV` | `production` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://hiregenie.io` | Production |

### For Other Hosting Platforms

#### Netlify
1. Go to Site Settings → Environment Variables
2. Add each variable with its value

#### Railway
1. Go to your project → Variables tab
2. Add each environment variable

#### Docker/Self-hosted
Create a `.env` file with all variables or pass them as environment variables to your container.

## 🔐 Security Best Practices

### ✅ DO:
- Keep service role keys and API keys secret
- Use different keys for development and production
- Regularly rotate API keys
- Set OpenAI usage limits
- Use environment-specific webhook URLs

### ❌ DON'T:
- Commit `.env.local` or `.env` files to git
- Share API keys in chat/email
- Use production keys in development
- Hardcode secrets in your code

## 🧪 Testing Your Setup

After setting up environment variables, test each service:

### 1. Test Supabase Connection
```bash
npm run dev
# Check browser console for any Supabase errors
```

### 2. Test OpenAI API
Try generating a cover letter to verify the OpenAI integration works.

### 3. Test Polar Integration
Try accessing the pricing page and ensure plans load correctly.

### 4. Test Resume Parser
Upload a resume to verify the parser service is accessible.

## 🚨 Common Issues & Solutions

### Issue: Supabase Connection Failed
- **Solution**: Double-check URL format and anon key
- **Check**: RLS policies are properly configured

### Issue: OpenAI API Errors
- **Solution**: Verify API key format starts with `sk-`
- **Check**: Account has sufficient credits

### Issue: Polar Payment Issues
- **Solution**: Ensure you're using production mode in production
- **Check**: Webhook URL is accessible from Polar

### Issue: Resume Parser Unavailable
- **Solution**: Deploy the Python service separately
- **Temporary**: Disable file upload, use text input only

## 📱 Environment Variable Reference

```bash
# Complete reference for copy-paste
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_ORGANIZATION_ID=
RESUME_PARSER_URL=
NODE_ENV=
NEXT_PUBLIC_APP_URL=
```

## 🚀 Quick Deploy Checklist

Before deploying to production:

- [ ] All environment variables set in hosting platform
- [ ] Supabase RLS policies configured
- [ ] OpenAI usage limits set
- [ ] Polar webhooks configured
- [ ] Resume parser service deployed
- [ ] Test all critical flows work

## 🆘 Need Help?

If you encounter issues:

1. **Check logs** in your hosting platform
2. **Verify** each service dashboard for errors
3. **Test** environment variables are properly set
4. **Ensure** all external services are accessible

---

**Next Step:** Once all environment variables are set, proceed with the deployment following the PRODUCTION_CHECKLIST.md 