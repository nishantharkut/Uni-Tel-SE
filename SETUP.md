# UNI-TEL Setup Guide

## 🚨 **Quick Fix for Supabase Error**

The error you're seeing occurs because the Supabase environment variables are not configured. Follow these steps to fix it:

## Step 1: Create Environment File

Create a file named `.env.local` in your project root directory with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_public_key_here
```

## Step 2: Get Your Supabase Credentials

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (or create a new one if you don't have one)
3. **Go to Settings → API**
4. **Copy the following values**:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`

## Step 3: Update Your .env.local File

Replace the placeholder values in your `.env.local` file:

```env
# Example (replace with your actual values):
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2MDAwMCwiZXhwIjoyMDE0MzM2MDAwfQ.example_key_here
```

## Step 4: Set Up Database

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the migration SQL** from `supabase/migrations/20250827194740_9e5b13e5-435d-4c91-8fe6-a28d520bf2c0.sql`
4. **Run the migration** to create all necessary tables

## Step 5: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🔧 **Alternative: Quick Test Setup**

If you want to test the app quickly without setting up Supabase:

1. **Create a `.env.local` file** with dummy values:
```env
VITE_SUPABASE_URL=https://dummy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=dummy_key_for_testing
```

2. **The app will load** but won't be able to connect to the database
3. **You can see the UI** and navigate through the interface

## 🆘 **Still Having Issues?**

### Check Your Environment File
- Make sure the file is named exactly `.env.local` (not `.env` or `.env.example`)
- Make sure it's in the root directory (same level as `package.json`)
- Make sure there are no spaces around the `=` sign

### Verify Your Supabase Project
- Make sure your Supabase project is active
- Check that you're using the correct project URL and key
- Ensure your Supabase project has the database tables set up

### Common Issues
1. **File not found**: Make sure `.env.local` is in the project root
2. **Wrong credentials**: Double-check your Supabase URL and key
3. **Database not set up**: Run the migration SQL in Supabase
4. **Cache issues**: Try clearing browser cache or restarting the dev server

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for more detailed error messages
2. Verify your Supabase project is set up correctly
3. Make sure you've run the database migration
4. Try creating a fresh Supabase project if needed

---

**Once you've completed these steps, your UNI-TEL app should load successfully!** 🎉
