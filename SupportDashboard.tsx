import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  PhoneCall,
  User,
  ShieldAlert,
} from 'lucide-react';

interface Ticket {
  id: string;
  orderNumber: string;
  customerName: string;
  category: 'LATE_DELIVERY' | 'MISSING_ITEM' | 'WRONG_ADDRESS' | 'REFUND_REQUEST';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  time: string;
  message: string;
}

export default function SupportDashboard() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TCK-101',
      orderNumber: 'SHAKH-9012',
      customerName: 'Diyar Hawrami',
      category: 'LATE_DELIVERY',
      priority: 'HIGH',
      status: 'OPEN',
      time: '5 mins ago',
      message: 'Captain has been waiting at the restaurant for 25 minutes, order still not ready.',
    },
    {
      id: 'TCK-102',
      orderNumber: 'SHAKH-8841',
      customerName: 'Sara Ahmed',
      category: 'MISSING_ITEM',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      time: '18 mins ago',
      message: 'Delivered bag was missing the extra garlic sauce and 2x sodas.',
    },
    {
      id: 'TCK-103',
      orderNumber: 'SHAKH-8210',
      customerName: 'Mohammed K.',
      category: 'REFUND_REQUEST',
      priority: 'LOW',
      status: 'RESOLVED',
      time: '1 hour ago',
      message: 'Customer cancelled before food entered preparation stage.',
    },
  ]);

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(tickets[0]);
  const [search, setSearch] = useState('');

  const updateTicketStatus = (id: string, status: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    if (activeTicket?.id === id) {
      setActiveTicket((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Customer Support & Dispute Center
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Support Desk
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Resolve customer disputes, handle delivery incident reports, and process merchant compensation.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets or order #..."
            className="w-full py-1.5 ps-9 pe-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-900"
          />
        </div>
      </div>

      {/* Tickets Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setActiveTicket(ticket)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeTicket?.id === ticket.id
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {ticket.id} • {ticket.orderNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    ticket.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ticket.customerName}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ticket.message}</p>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {ticket.time}
                </span>
                <span
                  className={`font-bold ${
                    ticket.status === 'RESOLVED'
                      ? 'text-emerald-600'
                      : ticket.status === 'IN_PROGRESS'
                      ? 'text-blue-600'
                      : 'text-amber-600'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Details & Action Console (7 cols) */}
        <div className="lg:col-span-7 card p-6 space-y-5">
          {activeTicket ? (
            <>
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-primary-600">
                      {activeTicket.id}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {activeTicket.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                    {activeTicket.customerName}
                  </h3>
                  <span className="text-xs text-slate-400">Related Order: {activeTicket.orderNumber}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateTicketStatus(activeTicket.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateTicketStatus(activeTicket.id, 'RESOLVED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                  >
                    Resolve Ticket
                  </button>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Issue Description</span>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeTicket.message}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase block">Dispute Actions</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => alert('Call routed to customer')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-primary-600" />
                    Call Customer
                  </button>
                  <button
                    onClick={() => alert('Captain contacted')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    Ping Captain
                  </button>
                  <button
                    onClick={() => alert('Refund voucher of 5,000 IQD issued')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-600"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Issue Refund Credit
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <LifeBuoy className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Select a ticket to review dispute</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
