import { ClipboardList, HelpCircle, LayoutDashboard, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import styles from './style.module.css'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Board',
    icon: LayoutDashboard
  },
  {
    to: '/',
    label: 'My Tasks',
    icon: ClipboardList
  },
  {
    to: '/',
    label: 'Settings',
    icon: Settings
  }
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label='Main navigation'>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden='true'>
          <span />
        </span>
        <span className={styles.brandText}>Mini Jira System</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon

          return (
            <NavLink
              key={`${item.label}-${index}`}
              to={item.to}
              end={index === 0}
              className={({ isActive }) => `${styles.navItem} ${isActive && index === 0 ? styles.active : ''}`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className={styles.helpBox}>
        <HelpCircle size={16} />
        <div>
          <strong>Cần hỗ trợ?</strong>
          <span>Liên hệ quản trị</span>
        </div>
      </div>
    </aside>
  )
}
