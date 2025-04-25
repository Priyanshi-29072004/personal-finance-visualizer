import './globals.css'

export const metadata = {
  title: 'Personal Finance Visualizer',
  description: 'Track and visualize your personal finances',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <main className="container mx-auto py-6 px-4">
          {children}
        </main>
      </body>
    </html>
  )
} 