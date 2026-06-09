import { Outlet } from 'react-router-dom'
import FooterPage from './footer/footerPage'
import HeaderPage from './header/headerPage'
import Sidebar from './sidebar/Sidebar'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.shell}>
        <HeaderPage />
        <div className={styles.content}>
          <Outlet />
        </div>
        <FooterPage />
      </div>
    </div>
  )
}
