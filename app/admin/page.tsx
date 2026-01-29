'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  discount_code: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const result = await response.json();
      setIsAuthenticated(result.authenticated === true);
      if (result.authenticated) {
        fetchLeads();
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid password');
      }

      setIsAuthenticated(true);
      setPassword('');
      fetchLeads();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
      });
      setIsAuthenticated(false);
      setLeads([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/leads');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leads');
      }

      setLeads(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center">
        <p className="text-[#111]/70 font-light">Loading...</p>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="border border-[#111] rounded-sm bg-[#f9f9f7] p-8">
            <h1 className="text-2xl font-light text-[#111] mb-2">Admin Login</h1>
            <p className="text-[#111]/70 font-light mb-6">
              Enter password to access the leads dashboard
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  id="admin-password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {loginError && (
                <p className="text-sm text-[#111]/70">{loginError}</p>
              )}
              <Button type="submit" variant="primary" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-[#111] mb-2">Leads Dashboard</h1>
            <p className="text-[#111]/70 font-light">
              View all collected leads and discount code activations
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 border border-[#111] text-[#111] hover:bg-[#111] hover:text-[#f9f9f7] transition-colors font-light"
          >
            Logout
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#111]/70 font-light">Loading leads...</p>
          </div>
        ) : error ? (
          <div className="bg-[#111]/5 border border-[#111] p-6 rounded-sm">
            <p className="text-[#111]/70 font-light mb-4">{error}</p>
            <button
              onClick={fetchLeads}
              className="px-4 py-2 border border-[#111] text-[#111] hover:bg-[#111] hover:text-[#f9f9f7] transition-colors font-light"
            >
              Retry
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#111]/70 font-light">No leads found yet.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[#111]/70 font-light">
                Total: {leads.length} lead{leads.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={fetchLeads}
                className="text-sm px-4 py-2 border border-[#111] text-[#111] hover:bg-[#111] hover:text-[#f9f9f7] transition-colors font-light"
              >
                Refresh
              </button>
            </div>

            <div className="border border-[#111] rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#111]/5 border-b border-[#111]">
                    <tr>
                      <th className="text-left p-4 text-sm font-light text-[#111]">Name</th>
                      <th className="text-left p-4 text-sm font-light text-[#111]">Phone</th>
                      <th className="text-left p-4 text-sm font-light text-[#111]">Discount Code</th>
                      <th className="text-left p-4 text-sm font-light text-[#111]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-[#111]/10 hover:bg-[#111]/5 transition-colors">
                        <td className="p-4 text-sm text-[#111]/70 font-light">
                          {lead.name || <span className="text-[#111]/30">—</span>}
                        </td>
                        <td className="p-4 text-sm text-[#111]/70 font-light">
                          {lead.phone || <span className="text-[#111]/30">—</span>}
                        </td>
                        <td className="p-4 text-sm text-[#111] font-light">
                          {lead.discount_code}
                        </td>
                        <td className="p-4 text-sm text-[#111]/70 font-light">
                          {formatDate(lead.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
