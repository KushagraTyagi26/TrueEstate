import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'TrueEstate — Know What a Property Is Really Worth', description: 'Rental decision intelligence for estimating rent, evaluating listings, discovering localities, and comparing properties.', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f5f3ed' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html> }
