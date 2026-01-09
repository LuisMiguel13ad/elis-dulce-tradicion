import { Order } from '@/types/order';

export const printOrderTicket = (order: Order) => {
  console.log('Legacy print triggered (suppressed)', order);
  // Implementation disabled to support new PrintPreviewModal
  // If you need the old logic, check git history.
};
