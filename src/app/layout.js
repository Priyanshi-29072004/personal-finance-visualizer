import './globals.css'
import Sidebar from './components/Sidebar'

export const metadata = {
  title: 'Personal Finance Visualizer',
  description: 'Track and visualize your personal finances',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8 md:ml-64">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 