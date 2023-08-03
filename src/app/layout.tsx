import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import ToasterContent from './context/ToasterContext'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Messenger Clone',
  description: 'Lets....',
}

export default function RootLayout({ children }: { children: ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ToasterContent />
        {children}
      </body>
    </html>
  )
}
