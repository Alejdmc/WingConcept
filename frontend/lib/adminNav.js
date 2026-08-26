import {
  BarChart3,
  ShoppingCart,
  Settings,
  Tag,
  Users,
  Handshake,
  FileText,
  Wrench,
  Globe,
  Sliders,
  Plane,
  Compass,
  Newspaper,
  Star,
  Wind,
  LayoutDashboard,
} from 'lucide-react'

/** Sidebar structure for the admin panel — grouped by purpose. */
export const ADMIN_NAV = [
  {
    type: 'link',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: BarChart3,
  },
  {
    type: 'group',
    label: 'Website content',
    items: [
      { label: 'Homepage texts', href: '/admin/site', icon: Globe, hint: 'Hero banner and homepage copy' },
      { label: 'Featured products', href: '/admin/featured', icon: Star, hint: 'Order and visibility on the home page' },
      { label: 'News', href: '/admin/news', icon: Newspaper, hint: 'Homepage news cards and /news page' },
      { label: 'Paramotors page', href: '/admin/paramotors', icon: Wind, hint: 'Cards on /paramotors' },
      { label: 'Paratrikes page', href: '/admin/paratrikes', icon: Plane, hint: 'Cards on /paratrike' },
      { label: 'Adventure & events', href: '/admin/contenido', icon: Compass, hint: 'Adventure, Shows and Events pages' },
    ],
  },
  {
    type: 'group',
    label: 'Catalog & pricing',
    items: [
      { label: 'Configurators', href: '/admin/configurador', icon: Sliders, hint: 'Engines, colors, accessories and prices' },
      { label: 'Parts & accessories', href: '/admin/parts', icon: Wrench, hint: 'Shop catalog, stock and photos' },
    ],
  },
  {
    type: 'group',
    label: 'Store',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Discounts', href: '/admin/descuentos', icon: Tag },
    ],
  },
  {
    type: 'group',
    label: 'Reference',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Dealers', href: '/admin/dealers', icon: Handshake },
      { label: 'Manuals', href: '/admin/manuals', icon: FileText },
      { label: 'All products', href: '/admin/products', icon: LayoutDashboard, hint: 'Advanced — most edits use the pages above' },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

export function isNavActive(pathname, href) {
  if (!pathname || !href) return false
  if (href === '/admin/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
