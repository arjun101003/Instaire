import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./components/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Instaire - Connect Brands with Influencers",
  description: "The premier platform for brand-influencer collaborations",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
