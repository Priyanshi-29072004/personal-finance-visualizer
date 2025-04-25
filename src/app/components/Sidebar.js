'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Menu,
  Wallet
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    {
      path: '/',
      name: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      path: '/transactions',
      name: 'Transactions',
      icon: Receipt
    },
    {
      path: '/budget',
      name: 'Budget',
      icon: Wallet
    }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:w-64
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Finance Tracker</h1>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-4 px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600
                  ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
} 