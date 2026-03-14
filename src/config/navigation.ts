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
    title: "Clients",
    path: "/clients",
    icon: "PeopleAlt",
  },
];

export const navigationConfig = {
  navWidth: 260,
  collapsedWidth: 80,
};
