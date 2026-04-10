'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  FolderOpen,
  Image,
  Star,
  MessageCircle,
  Users,
  HeadphonesIcon,
  ChevronRight,
  Settings,
  Tag,
  Megaphone,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import type { AdminRole } from '@prakash/types';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: FolderOpen },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Returns', href: '/returns', icon: ArrowLeftRight },
  { name: 'Coupons', href: '/coupons', icon: Tag },
  { name: 'Support', href: '/support', icon: HeadphonesIcon },
  { name: 'Offers', href: '/offers', icon: Megaphone },
  { name: 'Banners', href: '/banners', icon: Image },
  { name: 'Reviews', href: '/reviews', icon: Star },
  { name: 'Enquiries', href: '/enquiries', icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user, admin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSuperAdmin = admin?.role === 'super_admin';

  const handleSignOut = async () => {
    await signOut();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Logo size="md" variant="full" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-semibold !text-white uppercase tracking-wider">
          Main Menu
        </p>
        {navigation.slice(0, 7).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-terracotta !text-white shadow-lg shadow-terracotta/30'
                  : '!text-white hover:bg-white/10'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? '!text-white' : '!text-white')} />
              <span className="!text-white">{item.name}</span>
              {isActive && <ChevronRight className="h-4 w-4 ml-auto !text-white" />}
            </Link>
          );
        })}

        <p className="px-3 py-2 mt-6 text-xs font-semibold !text-white uppercase tracking-wider">
          Content
        </p>
        {navigation.slice(7).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-terracotta !text-white shadow-lg shadow-terracotta/30'
                  : '!text-white hover:bg-white/10'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? '!text-white' : '!text-white')} />
              <span className="!text-white">{item.name}</span>
              {isActive && <ChevronRight className="h-4 w-4 ml-auto !text-white" />}
            </Link>
          );
        })}

        {/* Settings - visible to all but Admin Management only for super_admin */}
        <p className="px-3 py-2 mt-6 text-xs font-semibold !text-white uppercase tracking-wider">
          Settings
        </p>
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
            pathname.startsWith('/settings')
              ? 'bg-terracotta !text-white shadow-lg shadow-terracotta/30'
              : '!text-white hover:bg-white/10'
          )}
        >
          <Settings className={cn('h-5 w-5', pathname.startsWith('/settings') ? '!text-white' : '!text-white')} />
          <span className="!text-white">Settings</span>
          {pathname.startsWith('/settings') && <ChevronRight className="h-4 w-4 ml-auto !text-white" />}
        </Link>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="mb-3 px-3 py-2 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-terracotta/50 to-terracotta rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {admin?.displayName?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {admin?.displayName || 'Admin'}
              </p>
              <p className="text-slate-400 text-xs truncate capitalize">
                {admin?.role?.replace('_', ' ') || 'Admin'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-white/90 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-sidebar rounded-xl text-white shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-sidebar transform transition-transform duration-300 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:w-72 lg:fixed lg:inset-y-0 bg-sidebar">
        <SidebarContent />
      </div>
    </>
  );
}
