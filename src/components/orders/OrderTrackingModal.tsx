import { X } from 'lucide-react';
import { TrackedOrder } from '../../types/order';
import OrderTrackingVisualizer from './OrderTrackingVisualizer';

interface OrderTrackingModalProps {
  order: TrackedOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderTrackingModal({
  order,
  isOpen,
  onClose,
}: OrderTrackingModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>بەدواداچوونی داواکاری / Live Order Tracking</span>
          </h3>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          <OrderTrackingVisualizer initialOrder={order} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
