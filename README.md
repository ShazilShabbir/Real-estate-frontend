# Real Estate App - Frontend

A modern real estate listing platform built with [Next.js](https://nextjs.org), featuring property browsing, user authentication, and account management.

## Features

- **Property Listings**: Browse and search available properties
- **User Authentication**: Secure login and registration system
- **User Accounts**: Manage profile, change password, and update avatar
- **Property Management**: Create and manage property listings
- **Responsive Design**: Beautiful UI with theme toggle support
- **Featured Properties**: Showcase premium listings on the homepage

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) with TypeScript
- **Styling**: CSS with theme support
- **Authentication**: Custom auth context with axios
- **UI Components**: Custom reusable components (buttons, cards, dropdowns, tabs, avatar)
- **Deployment**: Ready for Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation & Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

The page auto-updates as you edit files in `app/page.tsx` or other component files.

## Project Structure

```
app/                    # Next.js app directory
├── create-property/    # Create new property listing
├── listings/          # View all properties
├── properties/        # Property details
├── account/           # User account management
├── login/             # Login page
├── register/          # Registration page
├── services/          # Services page
└── about/             # About page

components/            # Reusable React components
├── account/          # Account-related forms
├── ui/               # UI components (button, card, etc.)
└── ...              # Layout components (header, footer, hero, etc.)

hooks/                 # Custom React hooks
├── use-auth.ts       # Authentication hook
└── use-properties.ts # Properties hook

lib/                   # Utilities and context
├── auth-context.tsx  # Auth provider and context
├── axios.ts          # Axios configuration
└── utils.ts          # Helper functions
```

## Key Components

- **Header/Footer**: Navigation and site information
- **Hero Section**: Landing page showcase
- **Featured Properties**: Highlight premium listings
- **Search Section**: Property search and filtering
- **Contact Form**: User inquiries

## Environment Variables

Create a `.env.local` file for your API configuration:

```
NEXT_PUBLIC_API_URL=your_api_url_here
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
