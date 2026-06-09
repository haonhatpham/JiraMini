import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginBodySchema, type LoginInput } from '@jiramini/shared/auth'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import Button from '@/components/Button/Button'
import type { ApiError } from '@/api/api'
import { notify } from '@/utils/notify'
import { authService } from '../../auth.service'
import { useAuthStore } from '../../auth.store'
import styles from './style.module.css'

type LoginPageProps = {
  onRegisterClick?: () => void
  onSuccess?: () => void
}

function getErrorMessage(error: unknown): string {
  return (error as ApiError | undefined)?.message ?? 'Unable to login'
}

export default function LoginPage({ onRegisterClick, onSuccess }: LoginPageProps) {
  const setAuth = useAuthStore((state) => state.setAuth)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const {
    formState: { errors, isSubmitting, isSubmitted, touchedFields },
    handleSubmit,
    register
  } = useForm<LoginInput>({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(loginBodySchema)
  })

  const getFieldError = (name: keyof LoginInput) => {
    const shouldShowError = Boolean(touchedFields[name] || isSubmitted)

    return shouldShowError ? errors[name]?.message : undefined
  }

  const emailError = getFieldError('email')
  const passwordError = getFieldError('password')

  const onSubmit = async (values: LoginInput) => {
    setApiError(null)

    try {
      const auth = await authService.login(values)
      setAuth(auth)
      notify.success('Đăng nhập thành công')
      onSuccess?.()
    } catch (error) {
      const message = getErrorMessage(error)
      setApiError(message)
      notify.error(message)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <LockKeyhole className={styles.headerIcon} aria-hidden='true' />
          <h1 className={styles.title}>Đăng nhập</h1>
        </header>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className={styles.field}>
            <span>Email</span>
            <input
              {...register('email')}
              aria-describedby={emailError ? 'login-email-error' : undefined}
              aria-invalid={Boolean(emailError)}
              autoComplete='email'
              placeholder='you@example.com'
              type='email'
            />
            {emailError && <small id='login-email-error'>{emailError}</small>}
          </label>

          <label className={styles.field}>
            <span>Mật khẩu</span>
            <div className={styles.passwordControl}>
              <input
                {...register('password')}
                aria-describedby={passwordError ? 'login-password-error' : undefined}
                aria-invalid={Boolean(passwordError)}
                autoComplete='current-password'
                placeholder='Nhập mật khẩu'
                type={showPassword ? 'text' : 'password'}
              />
              <button
                type='button'
                className={styles.eyeButton}
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && <small id='login-password-error'>{passwordError}</small>}
          </label>

          {apiError && <p className={styles.error}>{apiError}</p>}

          <Button type='submit' width='full' loading={isSubmitting}>
            Đăng nhập
          </Button>
        </form>

        <footer className={styles.footer}>
          <span>Chưa có tài khoản?</span>
          <button type='button' className={styles.linkButton} onClick={onRegisterClick}>
            Đăng ký
          </button>
        </footer>
      </section>
    </main>
  )
}
