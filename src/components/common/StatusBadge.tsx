import React from 'react';
import { translateStatus } from '../../utils/formatters';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const label = translateStatus(status);

  let badgeClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ';

  switch (status) {
    case 'ACTIVE':
    case 'PAID':
    case 'VERIFIED':
    case 'RESOLVED':
    case 'PUBLISHED':
      badgeClasses += 'bg-emerald-100 text-emerald-800';
      break;
    case 'PENDING':
    case 'PENDING_VERIFICATION':
    case 'SUBMITTED':
    case 'IN_PROGRESS':
    case 'SCHEDULED':
      badgeClasses += 'bg-amber-100 text-amber-800';
      break;
    case 'SUSPENDED':
    case 'REJECTED':
    case 'OVERDUE':
    case 'CANCELLED':
      badgeClasses += 'bg-rose-100 text-rose-800';
      break;
    default:
      badgeClasses += 'bg-slate-100 text-slate-800';
      break;
  }

  return (
    <span className={badgeClasses}>
      {label}
    </span>
  );
};
