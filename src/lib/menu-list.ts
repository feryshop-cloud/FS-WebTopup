import { Home, ReceiptText, Headset, LucideIcon, BadgeDollarSign, Star, Store } from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(_pathname: string, _isLoggedIn: boolean): Group[] {
  const menu: Group[] = [
    {
      groupLabel: "Menu",
      menus: [
        {
          href: "/",
          label: "Beranda",
          icon: Home,
        },
        {
          href: "/marketplace",
          label: "Daftar Akun",
          icon: Store,
        },
        {
          href: "/price-list",
          label: "Daftar Harga",
          icon: BadgeDollarSign,
        },
        {
          href: "/invoices",
          label: "Cek Invoice",
          icon: ReceiptText,
        },
        {
          href: "/ulasan-produk",
          label: "Ulasan Produk",
          icon: Star,
        },
        {
          href: "/contact",
          label: "Hubungi Kami",
          icon: Headset,
        },
      ],
    },
  ];

  return menu;
}
