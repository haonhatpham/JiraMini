import styles from './styles.module.css'

type ErrorFallbackProps = {
  error?: Error
  onReset: () => void
}

export default function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.kicker}>Application error</p>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.description}>
          The app hit an unexpected problem. Try again, or reload the page if it keeps happening.
        </p>

        {error?.message && <pre className={styles.errorMessage}>{error.message}</pre>}

        <div className={styles.actions}>
          <button type='button' className={styles.primaryButton} onClick={onReset}>
            Try again
          </button>
          <button type='button' className={styles.secondaryButton} onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      </section>
    </main>
  )
}
