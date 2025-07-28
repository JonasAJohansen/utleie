import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { ScrollToTop } from '@/components/ScrollToTop'
import { metadata } from './metadata'
import Navigation from './Navigation'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-white overflow-y-auto`}>
          <div className="flex min-h-screen flex-col">
            <ScrollToTop />
            <Navigation />
            <main className="flex-1 mt-24">
              {children}
            </main>
            <footer className="bg-gray-50 border-t border-gray-200">
              <div className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Utforsk</h3>
                    <ul className="space-y-3">
                      <li><Link href="/listings" className="text-gray-600 hover:text-emerald-600 transition-colors">Alle annonser</Link></li>
                      <li><Link href="/categories" className="text-gray-600 hover:text-emerald-600 transition-colors">Kategorier</Link></li>
                      <li><Link href="/search" className="text-gray-600 hover:text-emerald-600 transition-colors">Søk</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-900">For utleiere</h3>
                    <ul className="space-y-3">
                      <li><Link href="/listings/new" className="text-gray-600 hover:text-emerald-600 transition-colors">Legg ut annonse</Link></li>
                      <li><Link href="/profile/listings" className="text-gray-600 hover:text-emerald-600 transition-colors">Mine annonser</Link></li>
                      <li><Link href="/rental-requests" className="text-gray-600 hover:text-emerald-600 transition-colors">Utleieforespørsler</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Support</h3>
                    <ul className="space-y-3">
                      <li><Link href="/help" className="text-gray-600 hover:text-emerald-600 transition-colors">Hjelpesenter</Link></li>
                      <li><Link href="/about" className="text-gray-600 hover:text-emerald-600 transition-colors">Om oss</Link></li>
                      <li><Link href="/chat" className="text-gray-600 hover:text-emerald-600 transition-colors">Kontakt support</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Juridisk</h3>
                    <ul className="space-y-3">
                      <li><Link href="/terms" className="text-gray-600 hover:text-emerald-600 transition-colors">Vilkår og betingelser</Link></li>
                      <li><Link href="/privacy" className="text-gray-600 hover:text-emerald-600 transition-colors">Personvernpolicy</Link></li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-gray-300">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                      <div className="bg-emerald-500 p-2 rounded-2xl">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <span className="text-xl font-black text-gray-900">PriceTag</span>
                    </div>
                    <p className="text-gray-500 text-center md:text-right">
                      &copy; {new Date().getFullYear()} PriceTag. Alle rettigheter reservert.
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}

