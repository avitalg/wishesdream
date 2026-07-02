export interface NavItem {
  label: string;
  to: string;
  end?: boolean;
}

export const mainNavItems: NavItem[] = [
  { label: 'Home', to: '/', end: true },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'FAQ', to: '/faq' },
];

export const footerNavGroups = {
  product: [
    { label: 'Home', to: '/' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Create a List', to: '/register' },
  ],
  accountGuest: [
    { label: 'Log In', to: '/login' },
    { label: 'Sign Up', to: '/register' },
  ],
  accountHost: [
    { label: 'My Lists', to: '/dashboard' },
  ],
  legal: [
    { label: 'Privacy', to: '/privacy' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
};
