// Navigation Configuration

export interface NavItemType {
  title: string;
  path?: string;
  icon?: string; // Icon name from MUI icons
  children?: NavItemType[];
}

export const navigationItems: NavItemType[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "Dashboard",
  },
  {
    title: "Assets",
    path: "/assets",
    icon: "Savings",
  },
  {
    title: "Liabilities",
    path: "/liabilities",
    icon: "AccountBalance",
  },
  {
    title: "Custom Categories",
    path: "/custom-categories",
    icon: "Category",
  },
  {
    title: "Settings",
    path: "/settings",
    icon: "Settings",
  },
];

export const navigationConfig = {
  navWidth: 260,
  collapsedWidth: 80,
};
