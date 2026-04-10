import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import getCurrentUser from './actions/getCurrentUser'
import ToasterContent from './context/ToasterContext'
import AuthContext from './context/AuthContext'
import ActiveStatus from './components/ActiveStatus'
 
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Message App',
  description: 'Lets....',
}

export default async function RootLayout({ children }: { children: ReactNode
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthContext initialUser={currentUser}>
          <ToasterContent />
          <ActiveStatus />
          {children}
        </AuthContext>
      </body>
    </html>
  )
}
