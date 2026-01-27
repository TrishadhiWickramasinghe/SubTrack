/**
 * Mock Data for SubTrack
 * Development/Testing data with realistic subscription examples
 */

export interface MockSubscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  category: string;
  status: 'active' | 'trial' | 'cancelled';
  icon: string;
  color: string;
  nextBillingDate: string;
  paymentMethod: string;
}

export interface MockBudget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  currency: string;
}

export const MOCK_SUBSCRIPTIONS: MockSubscription[] = [
  {
    id: '1',
    name: 'Netflix',
    amount: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Entertainment',
    status: 'active',
    icon: 'film',
    color: '#E50914',
    nextBillingDate: '2026-02-15',
    paymentMethod: 'Visa ••••1234',
  },
  {
    id: '2',
    name: 'Spotify',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Entertainment',
    status: 'active',
    icon: 'music',
    color: '#1DB954',
    nextBillingDate: '2026-02-05',
    paymentMethod: 'Mastercard ••••5678',
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    amount: 54.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    status: 'active',
    icon: 'briefcase',
    color: '#FF0000',
    nextBillingDate: '2026-02-10',
    paymentMethod: 'Visa ••••1234',
  },
  {
    id: '4',
    name: 'Gym Membership',
    amount: 49.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Health',
    status: 'active',
    icon: 'dumbbell',
    color: '#FF6B9D',
    nextBillingDate: '2026-02-20',
    paymentMethod: 'Debit Card ••••9012',
  },
  {
    id: '5',
    name: 'Cloud Storage (Google One)',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    status: 'active',
    icon: 'cloud',
    color: '#4285F4',
    nextBillingDate: '2026-02-03',
    paymentMethod: 'Visa ••••1234',
  },
  {
    id: '6',
    name: 'Canva Premium',
    amount: 14.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    status: 'active',
    icon: 'palette',
    color: '#8B5CF6',
    nextBillingDate: '2026-02-12',
    paymentMethod: 'Mastercard ••••5678',
  },
  {
    id: '7',
    name: 'ChatGPT Plus',
    amount: 20.0,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    status: 'trial',
    icon: 'lightbulb',
    color: '#10A37F',
    nextBillingDate: '2026-02-28',
    paymentMethod: 'Visa ••••1234',
  },
];

export const MOCK_BUDGETS: MockBudget[] = [
  {
    id: '1',
    category: 'Entertainment',
    limit: 50,
    spent: 25.98,
    currency: 'USD',
  },
  {
    id: '2',
    category: 'Productivity',
    limit: 150,
    spent: 99.97,
    currency: 'USD',
  },
  {
    id: '3',
    category: 'Health',
    limit: 100,
    spent: 49.99,
    currency: 'USD',
  },
];

export const MOCK_STATISTICS = {
  totalMonthlySpending: 175.94,
  totalAnnualSpending: 2111.28,
  activeSubscriptions: 7,
  potentialSavings: 15.99,
  monthlyChange: 12.5,
  topCategory: 'Productivity',
};

export const MOCK_UPCOMING_PAYMENTS = [
  { name: 'Cloud Storage (Google One)', date: '2026-02-03', amount: 9.99 },
  { name: 'Spotify', date: '2026-02-05', amount: 9.99 },
  { name: 'Adobe Creative Cloud', date: '2026-02-10', amount: 54.99 },
  { name: 'Canva Premium', date: '2026-02-12', amount: 14.99 },
  { name: 'Netflix', date: '2026-02-15', amount: 15.99 },
];

export const CATEGORY_COLORS = {
  Entertainment: '#6366F1',
  Utilities: '#10B981',
  Productivity: '#F59E0B',
  Health: '#A855F7',
  Education: '#EC4899',
  Finance: '#3B82F6',
  Shopping: '#F97316',
  Food: '#EF4444',
  Travel: '#06B6D4',
  Other: '#6B7280',
};
