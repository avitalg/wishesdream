export interface NavItem {
  labelKey: string;
  to: string;
  end?: boolean;
}

export const mainNavItems: NavItem[] = [
  { labelKey: 'nav.home', to: '/', end: true },
  { labelKey: 'nav.howItWorks', to: '/how-it-works' },
  { labelKey: 'nav.faq', to: '/faq' },
];

export const footerNavGroups = {
  product: [
    { labelKey: 'nav.home', to: '/' },
    { labelKey: 'nav.howItWorks', to: '/how-it-works' },
    { labelKey: 'nav.faq', to: '/faq' },
    { labelKey: 'nav.createList', to: '/register' },
  ],
  accountGuest: [
    { labelKey: 'nav.logIn', to: '/login' },
    { labelKey: 'nav.signUp', to: '/register' },
  ],
  accountHost: [{ labelKey: 'nav.myLists', to: '/dashboard' }],
  legal: [
    { labelKey: 'nav.privacy', to: '/privacy' },
    { labelKey: 'nav.cookiePolicy', to: '/cookies' },
  ],
};
