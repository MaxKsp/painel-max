import { apiRequest } from './api-client';

export interface Subscription { plan: string; status: string; current_period_end: string | null }
export const getSubscription = () => apiRequest<Subscription>('/api/subscription.php');
