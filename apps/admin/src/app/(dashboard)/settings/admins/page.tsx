'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getAllAdmins,
  createAdmin,
  updateAdminRole,
  deactivateAdmin,
  activateAdmin,
  deleteAdmin,
} from '@prakash/firebase';
import { getFirebaseAuth } from '@prakash/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { AdminUser, AdminRole } from '@prakash/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Plus,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminManagementPage() {
  const { admin: currentAdmin } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for adding new admin
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'admin' as AdminRole,
  });
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Check if current user is super_admin
  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/settings');
      return;
    }
    fetchAdmins();
  }, [isSuperAdmin, router]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAdmin(true);
    setAddError(null);

    try {
      // Create Firebase Auth user
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newAdminForm.email,
        newAdminForm.password
      );

      // Create admin record
      const newAdmin = await createAdmin(
        userCredential.user.uid,
        newAdminForm.email,
        newAdminForm.displayName,
        newAdminForm.role
      );

      setAdmins([newAdmin, ...admins]);
      setShowAddForm(false);
      setNewAdminForm({ email: '', password: '', displayName: '', role: 'admin' });
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      if (error.code === 'auth/email-already-in-use') {
        setAddError('This email is already registered');
      } else if (error.code === 'auth/weak-password') {
        setAddError('Password should be at least 6 characters');
      } else {
        setAddError('Failed to create admin');
      }
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AdminRole) => {
    if (userId === currentAdmin?.id) {
      alert("You can't change your own role");
      return;
    }

    setActionLoading(userId);
    try {
      await updateAdminRole(userId, newRole);
      setAdmins(admins.map((a) => (a.id === userId ? { ...a, role: newRole } : a)));
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    if (userId === currentAdmin?.id) {
      alert("You can't deactivate your own account");
      return;
    }

    setActionLoading(userId);
    try {
      if (isActive) {
        await deactivateAdmin(userId);
      } else {
        await activateAdmin(userId);
      }
      setAdmins(admins.map((a) => (a.id === userId ? { ...a, isActive: !isActive } : a)));
    } catch (err) {
      console.error('Error toggling admin status:', err);
      alert('Failed to update admin status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, displayName: string) => {
    if (userId === currentAdmin?.id) {
      alert("You can't delete your own account");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete "${displayName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(userId);
    try {
      await deleteAdmin(userId);
      setAdmins(admins.filter((a) => a.id !== userId));
    } catch (err) {
      console.error('Error deleting admin:', err);
      alert('Failed to delete admin');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'admin':
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-slate-500" />;
    }
  };

  const getRoleBadgeClass = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'moderator':
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading admins...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <Button onClick={fetchAdmins} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-500">Manage admin users and their roles</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchAdmins} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </div>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add New Admin</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowAddForm(false);
                setAddError(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {addError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  value={newAdminForm.displayName}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, displayName: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={newAdminForm.email}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, email: e.target.value })
                  }
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  value={newAdminForm.password}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, password: e.target.value })
                  }
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Role
                  </label>
                  <Select
                    value={newAdminForm.role}
                    onValueChange={(value: AdminRole) =>
                      setNewAdminForm({ ...newAdminForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addingAdmin}>
                  {addingAdmin ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Admin'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-terracotta" />
            All Admins ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No admins found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {admins.map((adminUser) => (
                <div
                  key={adminUser.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900 truncate">
                        {adminUser.displayName}
                      </h3>
                      {adminUser.id === currentAdmin?.id && (
                        <span className="px-2 py-0.5 bg-terracotta/10 text-terracotta text-xs rounded">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{adminUser.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                          adminUser.role
                        )}`}
                      >
                        {getRoleIcon(adminUser.role)}
                        {adminUser.role.replace('_', ' ')}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          adminUser.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {adminUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {adminUser.id !== currentAdmin?.id && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Role selector */}
                      <Select
                        value={adminUser.role}
                        onValueChange={(value: AdminRole) =>
                          handleRoleChange(adminUser.id, value)
                        }
                        disabled={actionLoading === adminUser.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Toggle active */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(adminUser.id, adminUser.isActive)}
                        disabled={actionLoading === adminUser.id}
                        title={adminUser.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {actionLoading === adminUser.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : adminUser.isActive ? (
                          <UserX className="h-4 w-4 text-red-500" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        )}
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(adminUser.id, adminUser.displayName)}
                        disabled={actionLoading === adminUser.id}
                        title="Delete"
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        {actionLoading === adminUser.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Super Admin</h4>
                <p className="text-sm text-slate-500">
                  Full access to all features including admin management
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Admin</h4>
                <p className="text-sm text-slate-500">
                  Full access to products, orders, categories, customers, banners, reviews, support, and enquiries
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Moderator</h4>
                <p className="text-sm text-slate-500">
                  Read-only access to products and categories. Can manage orders, reviews, support tickets, and enquiries
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
