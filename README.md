# Think Different — Clothing Brand Website

**Version 0.1.6** — Public launch.

A minimal, mobile-first storefront for **Think Different**: homepage, shop, product detail pages, waitlist flow, discount capture, and return policy. Built with Next.js.

## Brand Vision

**Think Different** fosters creativity, celebrates individuality, and encourages unique ideas. The brand challenges the status quo and acknowledges those who see the world differently.

### Core Values

- **Creativity**: Fostering imagination and innovation
- **Individuality**: Celebrating those who think different
- **Curiosity**: Questioning assumptions, exploring ideas

## Features

- **Shop & product pages** — Catalog and per-product views with sizes, inventory hints, and “Buy now” → waitlist
- **Transparent product art** — Front/back hoodie PNGs (`public/frontside_transparent.PNG`, `public/backside_transparent.PNG`)
- **Minimal UI** — Paper white (`#f9f9f7`) and soft black (`#111`); Caveat for handwritten accents; piece titles styled as named works
- **Discount modal** — Name + phone, THINK10 code; optional timed / scroll trigger
- **Waitlist** — Name, email, size; optional countdown
- **Return policy** — Standalone `/return-policy` page
- **Site footer** — Creativity, Individuality, Curiosity pillars on every page
- **Social** — Instagram and TikTok in the homepage footer area

## Security (high level)

- **No admin panel** in this repo — no `/admin` or internal dashboards in the storefront
- **Secrets** — Never commit API keys or service credentials; configure only in your host’s environment (e.g. Vercel)
- **Vulnerability reports** — See [SECURITY.md](SECURITY.md)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form + Zod
- **Fonts**: Geist Sans, Caveat (Google Fonts via `next/font`)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Run locally

1. Clone the repository:

```bash
git clone <repository-url>
cd thinkdifferent
```

2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

No database or SQL setup is required to explore the UI. Lead capture and production APIs are configured in your deployment environment when you go live.

## Project Structure

```
thinkdifferent/
├── app/
│   ├── api/
│   │   └── leads/
│   ├── products/
│   ├── waitlist/
│   ├── return-policy/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── EmailOptInModal.tsx
│   ├── Navigation.tsx
│   ├── SiteFooter.tsx
│   └── ProductPieceTitle.tsx
├── lib/
│   ├── supabase.ts
│   └── products.ts
└── public/
```

## Behavior Notes

### Discount modal (`EmailOptInModal`)

- Shown once per browser (localStorage)
- Can open after a delay and/or around 50% scroll (`app/page.tsx`)
- Collects **name** and **phone**; shows **THINK10** after submit

### Waitlist (`/waitlist`)

- Collects **first name**, **last name**, **email**; optional **product** / **size** from query params after “Buy now”

### Design

- Less is more; product photography adds color on the neutral UI
- Mobile-first layout (product copy above images on small screens)

## Build & Deploy

### Production build

```bash
npm run build
```

### Production server

```bash
npm start
```

### Deploy (e.g. Vercel)

1. Push to GitHub (or your Git host)
2. Import the repo in [Vercel](https://vercel.com)
3. Add any environment variables your deployment needs (via the host’s dashboard — not in this README)
4. Deploy

## Social

- **Instagram**: [@uthinkdifferent](https://instagram.com/uthinkdifferent)
- **TikTok**: [@uthinkdifferent](https://www.tiktok.com/@uthinkdifferent)

## License

Private project — all rights reserved.
