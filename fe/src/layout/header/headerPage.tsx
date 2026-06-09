import { Bell, ChevronDown, LogOut, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import IconButton from '@/components/IconButton/IconButton'
import { useAuthStore } from '@/features/auth/auth.store'
import styles from './style.module.css'

export default function HeaderPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const userName = user?.name || user?.email || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <label className={styles.quickSearch}>
          <Search size={14} />
          <input type='search' placeholder='Tìm kiếm nhanh...' />
        </label>

        <div className={styles.actions}>
          <IconButton type='button' variant='ghost' aria-label='Notifications'>
            <Bell size={16} />
          </IconButton>

          <button type='button' className={styles.userButton}>
            <span className={styles.avatar}>{userInitial}</span>
            <span className={styles.userName}>{userName}</span>
            <ChevronDown size={14} />
          </button>

          <button type='button' className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  )
}
