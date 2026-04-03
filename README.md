# Think Different - Clothing Brand Website

A minimal, mobile-first foundation website for **Think Different** clothing brand. Built to build anticipation, collect leads, and showcase brand values before product launch.

## Brand Vision

**Think Different** fosters creativity, celebrates individuality, and encourages unique ideas. The brand challenges the status quo and acknowledges those who see the world differently.

### Core Values
- **Creativity**: Fostering imagination and innovation
- **Individuality**: Celebrating those who see differently
- **Curiosity**: Questioning assumptions, exploring ideas

## Features

- 🎨 **Minimal Black & White Design** - Paper white (#f9f9f7) and soft black (#111) color scheme
- 📱 **Mobile-First** - Optimized for mobile devices with responsive design
- 📧 **Lead Collection** - Email/phone opt-in modal with 10% discount code activation (THINK10)
- 🎭 **Mystery & Traction** - "Coming Soon" messaging to build anticipation
- ✍️ **Handwritten Typography** - Caveat font for accent text (taglines)
- 🎬 **Micro-Animations** - Subtle fade-ins and button press effects
- 🔒 **Secure Lead Storage** - Supabase integration with Row Level Security (RLS)
- 📋 **Return Policy Page** - Clear, scannable return policy information
- 🛠️ **Admin Builder** - Drag-and-drop page builder with proposal saving and GitHub PR creation
- 📷 **Social Links** - Instagram (@uthinkdifferent) and TikTok (@uthinkdifferent)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Form Handling**: React Hook Form + Zod validation
- **Fonts**: Geist Sans (main), Caveat (handwritten accent)
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (for lead collection)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd thinkdifferent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_default_key
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL schema in the Supabase SQL editor (see `supabase-schema.sql` if available)
   - The schema creates a `leads` table with secure RLS policies

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
thinkdifferent/
├── app/
│   ├── admin/              # Admin dashboard & builder
│   │   ├── builder/         # Drag-and-drop page builder
│   │   └── page.tsx         # Admin login
│   ├── api/
│   │   ├── admin/          # Admin & proposals API
│   │   └── leads/          # Lead collection API
│   ├── return-policy/      # Return policy page
│   ├── globals.css         # Global styles & animations
│   ├── layout.tsx          # Root layout with fonts
│   └── page.tsx            # Homepage
├── components/
│   ├── admin/              # Admin builder components
│   ├── ui/                 # Reusable UI components
│   ├── EmailOptInModal.tsx  # Lead collection modal
│   └── Navigation.tsx      # Mobile-first navigation
└── lib/
    ├── supabase.ts         # Supabase client
    ├── github-app.ts       # GitHub App auth for PR creation
    └── types/              # Shared types
```

## Key Features Explained

### Lead Collection Modal
- Appears once per user (localStorage tracking)
- Triggers after 4 seconds or 50% scroll
- Collects email OR phone number
- Activates 10% discount code "THINK10"
- Stores leads securely in Supabase

### Design Philosophy
- **Less is more**: Minimal design, no clutter
- **Color from products**: UI is black/white; color comes from product images
- **Mobile-first**: Designed for mobile, enhanced for desktop
- **Micro-interactions**: Subtle animations for better UX

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Your Supabase publishable key | Yes |
| `NEXT_PUBLIC_DROP_DATETIME` | Drop datetime (ISO string). Powers `/waitlist` countdown. If unset/invalid, countdown defaults to 7 days from first page load. | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin operations) | For admin builder |
| `ADMIN_PASSWORD` | Password for `/admin` routes | For admin access |
| `GITHUB_APP_ID` | GitHub App ID | For PR creation from builder |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key (PEM, single line) | For PR creation |
| `GITHUB_APP_INSTALLATION_ID` | GitHub App installation ID | For PR creation |
| `GITHUB_REPO_OWNER` | Repository owner (e.g. codycordova) | Optional |
| `GITHUB_REPO_NAME` | Repository name (e.g. thinkdifferent) | Optional |

## Build & Deploy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy
The easiest way to deploy is using [Vercel](https://vercel.com):
1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your environment variables
4. Deploy!

## Social

- **Instagram**: [@uthinkdifferent](https://instagram.com/uthinkdifferent)
- **TikTok**: [@uhinkdifferent](https://tiktok.com/@uhinkdifferent)

## Security

See [SECURITY.md](SECURITY.md) for supported versions and how to report vulnerabilities.

## License

Private project - All rights reserved
