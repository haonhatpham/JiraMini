import styles from './style.module.css'

export default function FooterPage() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© 2026 Mini Jira System. All rights reserved.</span>
        <nav className={styles.links} aria-label='Footer links'>
          <a href='/'>Điều khoản</a>
          <a href='/'>Bảo mật</a>
          <a href='/'>Liên hệ</a>
        </nav>
      </div>
    </footer>
  )
}
