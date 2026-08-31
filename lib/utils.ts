import { OrderStatus } from './types';

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function getStatusBadge(status: OrderStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'pending':
      return {
        label: 'En attente resto',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    case 'accepted':
      return {
        label: 'Acceptée',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'preparing':
      return {
        label: 'En cuisine 🍳',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
      };
    case 'ready_for_pickup':
      return {
        label: 'Prête pour coursier 🛵',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      };
    case 'in_transit':
      return {
        label: 'En route à Dakar 📍',
        bg: 'bg-emerald-500/10',
        text: 'text-[#008235]',
        border: 'border-[#008235]/30',
      };
    case 'delivered':
      return {
        label: 'Livrée avec succès 🎉',
        bg: 'bg-[#07431E]/10',
        text: 'text-[#07431E]',
        border: 'border-[#07431E]/30',
      };
    case 'cancelled':
      return {
        label: 'Annulée',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
      };
  }
}
