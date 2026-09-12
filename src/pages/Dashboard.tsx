import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import MerchantDashboard from '../components/dashboard/MerchantDashboard';
import CaptainDashboard from '../components/dashboard/CaptainDashboard';
import SupportDashboard from '../components/dashboard/SupportDashboard';
import CustomerDashboard from '../components/dashboard/CustomerDashboard';
import CaptainSettlementManager from '../components/finance/CaptainSettlementManager';
import {
  Crown,
  Shield,
  Store,
  Bike,
  LifeBuoy,
  User,
  Sparkles,
  Layers,
  Receipt,
} from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { roles, activeRole, setActiveRole } = useAuthStore();

  // Roles catalogue
  const rolesList = [
    {
      id: 'SUPER_ADMIN',
      label: 'Super Admin',
      labelKu: 'سەرپەرشتیاری باڵا (Super Admin)',
      icon: Crown,
      color: 'from-amber-500 to-amber-700 text-amber-500',
      badge: 'Supreme Command',
    },
    {
      id: 'ADMIN',
      label: 'Admin (Operations)',
      labelKu: 'بەڕێوەبەری ئۆپەراسیۆن',
      icon: Shield,
      color: 'from-blue-600 to-blue-700 text-blue-600',
      badge: 'Dispatch & QA',
    },
    {
      id: 'RESTAURANT',
      label: 'Merchant / Vendor',
      labelKu: 'فرۆشیار و چێشتخانە',
      icon: Store,
      color: 'from-purple-600 to-purple-700 text-purple-600',
      badge: 'Store & Kitchen',
    },
    {
      id: 'CAPTAIN',
      label: 'Captain (Courier)',
      labelKu: 'کاپتن (گەیاندن)',
      icon: Bike,
      color: 'from-emerald-600 to-emerald-700 text-emerald-600',
      badge: 'Fleet & Delivery',
    },
    {
      id: 'CAPTAIN_FINANCE',
      label: 'Captain Cash & Settlements',
      labelKu: 'پارەی کاپتن و سێتڵمێنت',
      icon: Receipt,
      color: 'from-teal-600 to-teal-700 text-teal-600',
      badge: 'کاشی کاپتنەکان',
    },
    {
      id: 'SUPPORT',
      label: 'Customer Support',
      labelKu: 'پشتگیری و ناکۆکی',
      icon: LifeBuoy,
      color: 'from-indigo-600 to-indigo-700 text-indigo-600',
      badge: 'Help Desk',
    },
    {
      id: 'CUSTOMER',
      label: 'Customer',
      labelKu: 'کڕیار',
      icon: User,
      color: 'from-slate-600 to-slate-700 text-slate-600',
      badge: 'Buyer Portal',
    },
  ];

  // Current user permissions
  const approvedRoleNames = roles.filter(r => r.status === 'approved').map(r => r.role);
  const isSuperAdmin = approvedRoleNames.includes('SUPER_ADMIN');
  const isAdmin = isSuperAdmin || approvedRoleNames.includes('ADMIN');
  const isSupport = isAdmin || approvedRoleNames.includes('SUPPORT');
  const isCaptain = isAdmin || approvedRoleNames.includes('CAPTAIN');
  const isMerchant = isAdmin || approvedRoleNames.some(r => 
    ['RESTAURANT', 'SUPERMARKET', 'FASHION', 'BEAUTY', 'UMRAH', 'CAR_SELLER', 'FOOD_MERCHANT', 'MARKET_MERCHANT', 'FASHION_MERCHANT', 'CARS_MERCHANT', 'TECH_MERCHANT', 'TECH'].includes(r)
  );

  const canAccessRole = (roleId: string): boolean => {
    if (isSuperAdmin) return true;
    if (roleId === 'SUPER_ADMIN') return false;
    if (roleId === 'ADMIN') return isAdmin;
    if (roleId === 'SUPPORT') return isSupport;
    if (roleId === 'CAPTAIN') return isCaptain;
    if (roleId === 'CAPTAIN_FINANCE') return isAdmin;
    if (['RESTAURANT', 'SUPERMARKET', 'FASHION', 'BEAUTY', 'UMRAH', 'CAR_SELLER'].includes(roleId)) return isMerchant;
    if (roleId === 'CUSTOMER') return true;
    return false;
  };

  // Default allowed fallback role
  const defaultAllowedRole = isSuperAdmin
    ? 'SUPER_ADMIN'
    : isAdmin
    ? 'ADMIN'
    : isMerchant
    ? 'RESTAURANT'
    : isCaptain
    ? 'CAPTAIN'
    : isSupport
    ? 'SUPPORT'
    : 'CUSTOMER';

  const requestedRole = searchParams.get('role') || activeRole || defaultAllowedRole;
  const effectiveRole = canAccessRole(requestedRole) ? requestedRole : defaultAllowedRole;

  const handleSwitchRole = (newRole: string) => {
    if (!canAccessRole(newRole)) return;
    setActiveRole(newRole);
    setSearchParams({ role: newRole });
  };

  return (
    <div className="space-y-6">
      {/* Role Navigation Bar */}
      <div className="card p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Role Workspaces (داشبۆردی ڕۆڵەکان)
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {isSuperAdmin ? 'Full System Access (سەرپەرشتیاری گشتی)' : 'Authorized Workspaces (داشبۆردە ڕێگەپێدراوەکان)'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {rolesList.map((r) => {
            const Icon = r.icon;
            const isSelected = effectiveRole === r.id;
            const allowed = canAccessRole(r.id);

            return (
              <button
                key={r.id}
                onClick={() => allowed && handleSwitchRole(r.id)}
                disabled={!allowed}
                title={allowed ? r.label : 'Access restricted to approved role'}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-start transition-all relative overflow-hidden ${
                  !allowed
                    ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20'
                    : isSelected
                    ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/40 shadow-sm ring-1 ring-primary-500 cursor-pointer'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer'
                }`}
              >
                {r.id === 'SUPER_ADMIN' && allowed && (
                  <span className="absolute top-1 end-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {r.badge}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold leading-tight ${
                    isSelected
                      ? 'text-slate-900 dark:text-white font-extrabold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {r.labelKu}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Dedicated Role Dashboard */}
      {effectiveRole === 'SUPER_ADMIN' && <SuperAdminDashboard />}
      {effectiveRole === 'ADMIN' && <AdminDashboard />}
      {['RESTAURANT', 'SUPERMARKET', 'FASHION', 'BEAUTY', 'UMRAH', 'CAR_SELLER'].includes(effectiveRole) && (
        <MerchantDashboard />
      )}
      {effectiveRole === 'CAPTAIN' && <CaptainDashboard />}
      {effectiveRole === 'CAPTAIN_FINANCE' && (
        <CaptainSettlementManager
          title="حیساباتی پارەی لای کاپتن و تۆمارکردنی گەڕاندنەوە (Captain Cash Settlements Hub)"
          showFleetSelector={true}
        />
      )}
      {effectiveRole === 'SUPPORT' && <SupportDashboard />}
      {effectiveRole === 'CUSTOMER' && <CustomerDashboard />}
    </div>
  );
}
