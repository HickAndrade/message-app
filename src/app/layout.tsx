import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import ToasterContent from './context/ToasterContext'
import AuthContext from './context/AuthContext'
 
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Message App',
  description: 'Lets....',
}

export default function RootLayout({ children }: { children: ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthContext>
          <ToasterContent />
          {children}
        </AuthContext>
      </body>
    </html>
  )
}
