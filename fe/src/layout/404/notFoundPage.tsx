import { Link } from 'react-router-dom'
import styles from './style.module.css'

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>The page you are looking for does not exist.</p>
        <Link className={styles.link} to='/'>
          Back home
        </Link>
      </section>
    </main>
  )
}
