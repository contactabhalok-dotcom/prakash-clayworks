'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Shield, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { admin, hasPermission } = useAuth();
  const isSuperAdmin = admin?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage admin panel settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Management - Only for super_admin */}
        {isSuperAdmin && (
          <Link href="/settings/admins">
            <Card className="hover:border-terracotta/50 hover:shadow-md transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-terracotta/10 rounded-xl">
                    <Users className="h-6 w-6 text-terracotta" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
                <CardTitle className="mt-4">Admin Users</CardTitle>
                <CardDescription>
                  Manage admin accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">
                  Add new admins, change roles, or deactivate accounts
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Role Info - For all admins */}
        <Card className="h-full">
          <CardHeader>
            <div className="p-3 bg-blue-100 rounded-xl w-fit">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="mt-4">Your Role</CardTitle>
            <CardDescription>
              Current permissions and access level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Role</span>
                <span className="text-sm font-medium text-slate-900 capitalize">
                  {admin?.role?.replace('_', ' ') || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Email</span>
                <span className="text-sm font-medium text-slate-900">
                  {admin?.email || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Link href="/settings/general">
          <Card className="hover:border-terracotta/50 hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-green-100 rounded-xl">
                  <SettingsIcon className="h-6 w-6 text-green-600" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
              <CardTitle className="mt-4">General Settings</CardTitle>
              <CardDescription>
                Store configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Business info, contact details, shipping, and more
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
