import {
  Gamepad2,
  Sword,
  Gem,
  Trophy,
  Coins,
  Crown,
  Zap,
  Flame,
  Sparkles,
  Shield,
  Target,
  Crosshair,
  Rocket,
  Gift,
  Package,
  Boxes,
  ShoppingBag,
  ShoppingCart,
  Store,
  Ticket,
  Medal,
  Star,
  Ghost,
  Skull,
  Droplets,
  Fish,
  PawPrint,
  Banknote,
  Wallet,
  CreditCard,
  BadgeDollarSign,
  Heart,
  Map,
  Compass,
  Mountain,
  Plane,
  Car,
  Bike,
  Music,
  Camera,
  Film,
  BookOpen,
  Key,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: { name: string; component: LucideIcon }[] = [
  { name: "Gamepad2", component: Gamepad2 },
  { name: "Sword", component: Sword },
  { name: "Gem", component: Gem },
  { name: "Trophy", component: Trophy },
  { name: "Coins", component: Coins },
  { name: "Crown", component: Crown },
  { name: "Zap", component: Zap },
  { name: "Flame", component: Flame },
  { name: "Sparkles", component: Sparkles },
  { name: "Shield", component: Shield },
  { name: "Target", component: Target },
  { name: "Crosshair", component: Crosshair },
  { name: "Rocket", component: Rocket },
  { name: "Gift", component: Gift },
  { name: "Package", component: Package },
  { name: "Boxes", component: Boxes },
  { name: "ShoppingBag", component: ShoppingBag },
  { name: "ShoppingCart", component: ShoppingCart },
  { name: "Store", component: Store },
  { name: "Ticket", component: Ticket },
  { name: "Medal", component: Medal },
  { name: "Star", component: Star },
  { name: "Ghost", component: Ghost },
  { name: "Skull", component: Skull },
  { name: "Droplets", component: Droplets },
  { name: "Fish", component: Fish },
  { name: "PawPrint", component: PawPrint },
  { name: "Banknote", component: Banknote },
  { name: "Wallet", component: Wallet },
  { name: "CreditCard", component: CreditCard },
  { name: "BadgeDollarSign", component: BadgeDollarSign },
  { name: "Heart", component: Heart },
  { name: "Map", component: Map },
  { name: "Compass", component: Compass },
  { name: "Mountain", component: Mountain },
  { name: "Plane", component: Plane },
  { name: "Car", component: Car },
  { name: "Bike", component: Bike },
  { name: "Music", component: Music },
  { name: "Camera", component: Camera },
  { name: "Film", component: Film },
  { name: "BookOpen", component: BookOpen },
  { name: "Key", component: Key },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map((i) => [i.name, i.component]),
);

const LUCIDE_PREFIX = "lucide:";

function lucideIconName(logo?: string | null): string | null {
  if (!logo || !logo.startsWith(LUCIDE_PREFIX)) return null;
  const name = logo.slice(LUCIDE_PREFIX.length);
  return name in ICON_MAP ? name : null;
}

export function CategoryLogo({ logo, className }: { logo?: string | null; className?: string }) {
  const iconName = lucideIconName(logo);

  if (iconName) {
    const Icon = ICON_MAP[iconName];
    return <Icon className={className} aria-hidden="true" />;
  }

  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt="" className={className} aria-hidden="true" />;
  }

  return null;
}
