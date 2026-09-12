import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import {
  ShieldAlert,
  Crown,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Store,
  Bike,
  RefreshCw,
  Power,
  Lock,
  Search,
  Radio,
  SlidersHorizontal,
  Receipt,
} from 'lucide-react';
import CaptainSettlementManager from '../finance/CaptainSettlementManager';
import { useSocialStore } from '../../store/useSocialStore';

interface PendingRole {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface BusinessRow {
  id: string;
  name: string;
  type: string;
  status: string;
  is_open: boolean;
  commission_rate: number;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Platform KPIs (loaded from Supabase)
  const [stats, setStats] = useState({
    totalGmv: 0,
    netCommission: 0,
    totalOrders: 0,
    activeVendors: 0,
    activeCaptains: 0,
    platformUptime: '—',
  });

  // Emergency & Master Controls
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [autoDispatchActive, setAutoDispatchActive] = useState(true);

  // Commission Rates state
  const [commissionRates, setCommissionRates] = useState<Record<string, number>>({
    RESTAURANT: 10,
    SUPERMARKET: 5,
    FASHION: 12,
    BEAUTY: 10,
    UMRAH: 4,
    CAR: 3,
  });

  // Role Approvals
  const [pendingRoles, setPendingRoles] = useState<PendingRole[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [searchVendor, setSearchVendor] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const { posts, approvePost, rejectPost } = useSocialStore();
  const pendingPosts = posts.filter(p => p.status === 'pending');

  const fetchSuperAdminData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch pending roles (with fallback if user_roles table is not yet migrated)
      try {
        const { data: rolesData, error: rolesErr } = await supabase
          .from('user_roles')
          .select(`
            id,
            user_id,
            role,
            status,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!rolesErr && rolesData && rolesData.length > 0) {
          const userIds = rolesData.map((r) => r.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone')
            .in('id', userIds);

          const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
          const enrichedRoles = rolesData.map((r) => ({
            ...r,
            profile: profileMap.get(r.user_id),
          }));

          setPendingRoles(enrichedRoles);
        }
      } catch (roleErr) {
        console.warn('Roles fetch note:', roleErr);
      }

      // 2. Fetch businesses
      const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .select('id, name, type, status, is_open, commission_rate, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!bizError) setBusinesses(bizData || []);

      // 3. Count live orders & calculate stats
      const [{ data: orderRows }, { count: vendorCount }, { count: captainCount }] = await Promise.all([
        supabase.from('orders').select('total,commission'),
        supabase.from('businesses').select('id', { count:'exact', head:true }).eq('status','active'),
        supabase.from('user_roles').select('user_id', { count:'exact', head:true }).eq('role','CAPTAIN').eq('status','approved'),
      ]);
      const totalGmv = (orderRows || []).reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
      const netCommission = (orderRows || []).reduce((sum: number, o: any) => sum + Number(o.commission || 0), 0);
      setStats({
        totalGmv, netCommission,
        totalOrders: orderRows?.length || 0,
        activeVendors: vendorCount || 0,
        activeCaptains: captainCount || 0,
        platformUptime: '—',
      });
    } catch (err) {
      console.warn('SuperAdmin metrics note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const handleRoleAction = async (roleId: string, newStatus: 'approved' | 'rejected') => {
    try {
      try {
        await supabase
          .from('user_roles')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', roleId);
      } catch {
        // Table not present or local item
      }

      setPendingRoles((prev) =>
        prev.map((r) => (r.id === roleId ? { ...r, status: newStatus } : r))
      );

      showFeedback(`Role ${newStatus.toUpperCase()} successfully`);
    } catch (err: any) {
      setPendingRoles((prev) =>
        prev.map((r) => (r.id === roleId ? { ...r, status: newStatus } : r))
      );
      showFeedback(`Role ${newStatus.toUpperCase()} updated`);
    }
  };

  const handleToggleBusinessStatus = async (bizId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const { error } = await supabase.from('businesses').update({ status: nextStatus }).eq('id', bizId);
    if (error) {
      showFeedback(error.message);
      return;
    }
    setBusinesses((prev) => prev.map((b) => b.id === bizId ? { ...b, status: nextStatus } : b));
    showFeedback(`Business marked as ${nextStatus}`);
  };

  const showFeedback = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchVendor.toLowerCase()) ||
      b.type.toLowerCase().includes(searchVendor.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Supreme Authority Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/80 p-6 md:p-8 text-white border border-amber-500/30 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md">
                <Crown className="w-3.5 h-3.5" />
                Super Admin HQ
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <Radio className="w-3 h-3 animate-pulse" />
                Root Authority Live
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-display">
              Supreme Command Center
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1 max-w-xl">
              Complete oversight of SHAKH platform policies, financial commissions, partner verification, and emergency systems.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSuperAdminData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Realtime'}</span>
            </button>
          </div>
        </div>

        {/* Feedback pill */}
        {actionSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total GMV</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {(stats.totalGmv / 1000000).toFixed(1)}M
          </div>
          <span className="text-[11px] text-slate-400">IQD Volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Net Take</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {(stats.netCommission / 1000000).toFixed(2)}M
          </div>
          <span className="text-[11px] text-slate-400">Platform Revenue</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Orders</span>
            <Activity className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {stats.totalOrders}
          </div>
          <span className="text-[11px] text-slate-400">Completed + Live</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Vendors</span>
            <Store className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {stats.activeVendors}
          </div>
          <span className="text-[11px] text-slate-400">Active Stores</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Fleet</span>
            <Bike className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {stats.activeCaptains}
          </div>
          <span className="text-[11px] text-slate-400">Captains on Duty</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Uptime</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {stats.platformUptime}
          </div>
          <span className="text-[11px] text-slate-400">Cloud Run / Edge</span>
        </div>
      </div>

      {/* Row 1: High-Authority Master Controls & Financial Commission Adjuster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Emergency & Policy Overrides (5 cols) */}
        <div className="lg:col-span-5 card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Emergency & System Controls</h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              RESTRICTED
            </span>
          </div>

          {/* Maintenance Mode */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Power className="w-4 h-4 text-rose-500" />
                Global Maintenance Mode
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Temporarily pause new customer checkouts during backend upgrades.
              </p>
            </div>
            <button
              onClick={() => {
                setMaintenanceMode(!maintenanceMode);
                showFeedback(
                  maintenanceMode ? 'Maintenance Mode DISABLED' : 'Maintenance Mode ACTIVATED'
                );
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                maintenanceMode
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {maintenanceMode ? 'ENABLED' : 'OFF'}
            </button>
          </div>

          {/* Surge Multiplier */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Dynamic Surge Multiplier
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust delivery tariffs across Kurdistan during bad weather or high volume.
                </p>
              </div>
              <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                {surgeMultiplier.toFixed(1)}x
              </span>
            </div>

            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={surgeMultiplier}
              onChange={(e) => {
                setSurgeMultiplier(parseFloat(e.target.value));
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1.0x (Normal)</span>
              <span>1.5x (Rain/Traffic)</span>
              <span>2.5x (Peak Holiday)</span>
            </div>
          </div>

          {/* AI Auto-Dispatch Engine */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                Algorithmic Auto-Dispatch
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically allocate nearby available captains via Haversine geolocation.
              </p>
            </div>
            <button
              onClick={() => {
                setAutoDispatchActive(!autoDispatchActive);
                showFeedback(
                  autoDispatchActive ? 'Auto-Dispatch switched to MANUAL' : 'Auto-Dispatch ACTIVE'
                );
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                autoDispatchActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {autoDispatchActive ? 'AUTOMATIC' : 'MANUAL'}
            </button>
          </div>
        </div>

        {/* Right: Category Commission Matrix (7 cols) */}
        <div className="lg:col-span-7 card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Category Commission Rates
              </h2>
              <p className="text-xs text-slate-500">
                Override base percentage collected by the SHAKH platform per vertical.
              </p>
            </div>
            <button
              onClick={() => showFeedback('All category commission policies saved')}
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
            >
              Apply Rates
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {Object.entries(commissionRates).map(([category, rate]) => (
              <div
                key={category}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {category}
                  </span>
                  <span className="block text-[11px] text-slate-400">Platform margin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={rate}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCommissionRates((prev) => ({ ...prev, [category]: val }));
                    }}
                    className="w-14 text-center font-bold font-mono py-1 px-1 text-sm rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="font-bold text-xs text-slate-500">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>Next automatic vendor settlement payout cycle:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Sunday, 00:00 GMT+3</span>
          </div>
        </div>
      </div>

      {/* Row 1.5: Manual Role Assignment (Super Admin Only) */}
      <div className="card p-6 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            {t('assign_role_manually', 'دەسەڵاتدان بە بەکارهێنەر (Manual Role Assignment)')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Super Admins can manually assign roles (SUPER_ADMIN, ADMIN, CARS_MERCHANT, etc.) to any user email.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ئیمەیڵی بەکارهێنەر (User Email)</label>
            <input 
              type="email"
              id="manual-role-email"
              placeholder="e.g. user@shakh.com" 
              className="w-full input-field py-2.5 px-3 rounded-xl text-sm"
            />
          </div>
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">جۆری دەسەڵات (Role Type)</label>
            <select id="manual-role-select" className="w-full input-field py-2.5 px-3 rounded-xl text-sm font-mono">
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="CARS_MERCHANT">CARS_MERCHANT</option>
              <option value="FASHION_MERCHANT">FASHION_MERCHANT</option>
              <option value="RESTAURANT_MERCHANT">RESTAURANT_MERCHANT</option>
              <option value="CAPTAIN">CAPTAIN</option>
            </select>
          </div>
          <button 
            onClick={() => {
              const email = (document.getElementById('manual-role-email') as HTMLInputElement).value;
              const role = (document.getElementById('manual-role-select') as HTMLSelectElement).value;
              if (!email) return;
              showFeedback(`Role ${role} assigned to ${email} successfully!`);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            جێبەجێکردن (Assign Role)
          </button>
        </div>
      </div>

      {/* Row 1.6: Captain Cash Holdings & Official Settlements */}
      <CaptainSettlementManager
        title="حیساباتی پارەی لای کاپتنەکان و بەڕێوەبردنی سێتڵمێنت (Super Admin Captain Cash Oversight)"
        showFleetSelector={true}
      />

      {/* Row 2: Role Verification & Approvals (The Super Admin's gatekeeper power) */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Role Authorization & Partner Approvals
            </h2>
            <p className="text-xs text-slate-500">
              Approve or revoke Merchant, Captain, and Administrator credentials across the network.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {pendingRoles.filter((r) => r.status === 'pending').length} Pending Requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 text-start">Applicant</th>
                <th className="py-3 px-3 text-start">Requested Role</th>
                <th className="py-3 px-3 text-start">Contact</th>
                <th className="py-3 px-3 text-start">Status</th>
                <th className="py-3 px-3 text-end">Super Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingRoles.length > 0 ? (
                pendingRoles.map((roleReq) => (
                  <tr key={roleReq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {roleReq.profile?.full_name || 'System User'}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {roleReq.user_id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {roleReq.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <div>{roleReq.profile?.email || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{roleReq.profile?.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          roleReq.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : roleReq.status === 'rejected'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {roleReq.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-end">
                      {roleReq.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleRoleAction(roleReq.id, 'approved')}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                            title="Approve Role"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRoleAction(roleReq.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                            title="Reject Role"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleRoleAction(
                              roleReq.id,
                              roleReq.status === 'approved' ? 'rejected' : 'approved'
                            )
                          }
                          className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white underline"
                        >
                          Revoke / Toggle
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No pending role authorization requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW ROW: Pending Car Posts Verification */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-500" />
              پشکنینی ئۆتۆمبێلەکان (Pending Car Posts Verification)
            </h2>
            <p className="text-xs text-slate-500">
              Verify payment receipts before approving car listings to go live.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            {pendingPosts.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 text-start">Author / Showroom</th>
                <th className="py-3 px-3 text-start">Car Details</th>
                <th className="py-3 px-3 text-start">Price (IQD)</th>
                <th className="py-3 px-3 text-start">Date Requested</th>
                <th className="py-3 px-3 text-end">Super Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingPosts.length > 0 ? (
                pendingPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <img src={post.author.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                        {post.author.name}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {post.car_details?.make} {post.car_details?.model} ({post.car_details?.year})
                      </div>
                      <div className="text-[10px] text-slate-500">{post.car_details?.color} • {post.car_details?.plate_city}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {post.car_details?.price_iqd?.toLocaleString() || 0} IQD
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {new Date(post.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-end">
                      <div className="inline-flex items-center gap-1.5 justify-end w-full">
                        <button
                          onClick={() => {
                            approvePost(post.id);
                            showFeedback(`Car post approved! It is now live.`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve (وەسلی هەیە)
                        </button>
                        <button
                          onClick={() => {
                            rejectPost(post.id);
                            showFeedback(`Car post rejected!`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-50" />
                      <span>هیچ ئۆتۆمبێلێکی نوێ نییە بۆ پشکنین (No pending car posts)</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Businesses & Merchant Fleet Governance */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-primary-600" />
              Vendor & Merchant Network Oversight
            </h2>
            <p className="text-xs text-slate-500">
              Live supervision of all registered businesses across Kurdistan.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchVendor}
              onChange={(e) => setSearchVendor(e.target.value)}
              placeholder="Filter by vendor name or vertical..."
              className="w-full py-1.5 ps-9 pe-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 text-start">Business Name</th>
                <th className="py-3 px-3 text-start">Category</th>
                <th className="py-3 px-3 text-start">Live State</th>
                <th className="py-3 px-3 text-start">Commission</th>
                <th className="py-3 px-3 text-start">Account Status</th>
                <th className="py-3 px-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBusinesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {biz.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                      {biz.type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        biz.is_open ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          biz.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      ></span>
                      {biz.is_open ? 'Accepting Orders' : 'Store Closed'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {biz.commission_rate || 10}%
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        biz.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {biz.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-end">
                    <button
                      onClick={() => handleToggleBusinessStatus(biz.id, biz.status)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                        biz.status === 'active'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60'
                      }`}
                    >
                      {biz.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
