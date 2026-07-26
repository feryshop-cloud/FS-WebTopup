'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getMenuList } from '@/lib/menu-list'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function BottomNavbar() {
  const { data: session } = useSession()
  const isLoggedIn = !!session
  const pathname = usePathname()
  const menuList = getMenuList(pathname, isLoggedIn)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background border-t border-muted shadow-md">
      <div className="flex justify-around items-center h-13 sm:h-16">
        {menuList
          .flatMap(group => group.menus)
          .map(({ href, icon: Icon, label }) => {
            const isActive =
              href === '/'
                ? pathname === '/'
                : pathname === href || pathname.startsWith(`${href}/`)

            return (
              <motion.div
                key={href}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link href={href} className="flex flex-col items-center text-xs">
                  <Icon
                    className={cn(
                      'w-4 h-4 sm:w-5 sm:h-5 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 transition-colors text-center truncate max-w-[60px]',
                      isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </motion.div>
            )
          })}
      </div>
    </nav>
  )
}