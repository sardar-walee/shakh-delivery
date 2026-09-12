# SHAKH (شاخ) - The Kurdish Super App

SHAKH is a multi-service production-ready super app designed for the Kurdish market, supporting Food, Supermarkets, Fashion, Umrah, Cars, Beauty, Delivery, and Marketplace functionalities.

## Architecture

*   **Frontend**: React 18, Vite, Tailwind CSS v4, Zustand, React Router v6.
*   **Internationalization**: i18next (Kurdish [Primary/RTL], Arabic [RTL], English [LTR]).
*   **Backend & Database**: Supabase (PostgreSQL, Realtime, Storage, Auth).
*   **Deployment**: Ready for Vercel.

## Setup Instructions

### 1. Supabase Configuration
1. Create a new Supabase project.
2. Run the SQL migration located at `supabase/migrations/00000_init.sql` in your Supabase SQL Editor.
3. This will create all required tables (`profiles`, `roles`, `user_roles`, `businesses`, `products`, `orders`, `wallets`, etc.) and establish Row Level Security (RLS).
4. Get your `Project URL` and `anon key` from Project Settings > API.

### 2. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Running the App
```bash
npm install
npm run dev
```

### 4. Vercel Deployment
1. Import the GitHub repository into Vercel.
2. Set the Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings.
3. Set the Domain to `https://daim-post.online` in the Vercel Domain Settings.
4. Deploy.

## Security & Architecture Rules Enforced

*   **No Mock Data**: The application relies entirely on Supabase for data fetching and mutations. If the Supabase instance is not configured, the app correctly shows loading/empty states instead of using fake data.
*   **RLS Policies**: Row Level Security ensures users can only access their own orders and profiles, while vendors can only manage their own businesses.
*   **Realtime**: `orders` subscriptions use Supabase channels to push instant updates.
*   **Roles System**: Uses a dedicated `user_roles` table for secure RBAC (Role-Based Access Control) which dictates frontend rendering and backend authorization.

## Known Limitations in Sandbox
*   As this is an automated sandbox environment, it cannot physically connect to your private Supabase credentials without you providing them in the `.env` file. You must follow the setup steps above to activate the live database connection.
