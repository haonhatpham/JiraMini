import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerBodySchema, type RegisterInput } from '@jiramini/shared/auth'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import Button from '@/components/Button/Button'
import type { ApiError } from '@/api/api'
import { notify } from '@/utils/notify'
import { authService } from '../../auth.service'
import { useAuthStore } from '../../auth.store'
import styles from './style.module.css'

type RegisterPageProps = {
  onLoginClick?: () => void
  onSuccess?: () => void
}

const registerFormSchema = registerBodySchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type RegisterFormInput = z.input<typeof registerFormSchema>
type RegisterFormValues = z.output<typeof registerFormSchema>

function getErrorMessage(error: unknown): string {
  return (error as ApiError | undefined)?.message ?? 'Unable to register'
}

export default function RegisterPage({ onLoginClick, onSuccess }: RegisterPageProps) {
  const setAuth = useAuthStore((state) => state.setAuth)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    formState: { errors, isSubmitting, isSubmitted, touchedFields },
    handleSubmit,
    register
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    defaultValues: {
      avatarUrl: '',
      confirmPassword: '',
      email: '',
      name: '',
      password: ''
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(registerFormSchema)
  })

  const getFieldError = (name: keyof RegisterFormInput) => {
    const shouldShowError = Boolean(touchedFields[name] || isSubmitted)

    return shouldShowError ? errors[name]?.message : undefined
  }

  const nameError = getFieldError('name')
  const emailError = getFieldError('email')
  const passwordError = getFieldError('password')
  const confirmPasswordError = getFieldError('confirmPassword')
  const avatarUrlError = getFieldError('avatarUrl')

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null)

    try {
      const input: RegisterInput = {
        avatarUrl: values.avatarUrl,
        email: values.email,
        name: values.name,
        password: values.password
      }
      const auth = await authService.register(input)
      setAuth(auth)
      notify.success('Đăng ký thành công')
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
          <UserPlus className={styles.headerIcon} aria-hidden='true' />
          <h1 className={styles.title}>Đăng ký tài khoản</h1>
        </header>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className={styles.field}>
            <span>Họ tên</span>
            <input
              {...register('name')}
              aria-describedby={nameError ? 'register-name-error' : undefined}
              aria-invalid={Boolean(nameError)}
              autoComplete='name'
              placeholder='Nhập họ tên'
            />
            {nameError && <small id='register-name-error'>{nameError}</small>}
          </label>

          <label className={styles.field}>
            <span>Email</span>
            <input
              {...register('email')}
              aria-describedby={emailError ? 'register-email-error' : undefined}
              aria-invalid={Boolean(emailError)}
              autoComplete='email'
              placeholder='you@example.com'
              type='email'
            />
            {emailError && <small id='register-email-error'>{emailError}</small>}
          </label>

          <label className={styles.field}>
            <span>Mật khẩu</span>
            <div className={styles.passwordControl}>
              <input
                {...register('password')}
                aria-describedby={passwordError ? 'register-password-error' : undefined}
                aria-invalid={Boolean(passwordError)}
                autoComplete='new-password'
                placeholder='Tối thiểu 8 ký tự'
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
            {passwordError && <small id='register-password-error'>{passwordError}</small>}
          </label>

          <label className={styles.field}>
            <span>Xác nhận mật khẩu</span>
            <div className={styles.passwordControl}>
              <input
                {...register('confirmPassword')}
                aria-describedby={confirmPasswordError ? 'register-confirm-password-error' : undefined}
                aria-invalid={Boolean(confirmPasswordError)}
                autoComplete='new-password'
                placeholder='Nhập lại mật khẩu'
                type={showConfirmPassword ? 'text' : 'password'}
              />
              <button
                type='button'
                className={styles.eyeButton}
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPasswordError && <small id='register-confirm-password-error'>{confirmPasswordError}</small>}
          </label>

          <label className={styles.field}>
            <span>Avatar URL</span>
            <input
              {...register('avatarUrl')}
              aria-describedby={avatarUrlError ? 'register-avatar-error' : undefined}
              aria-invalid={Boolean(avatarUrlError)}
              autoComplete='off'
              placeholder='https://example.com/avatar.png'
              type='url'
            />
            {avatarUrlError && <small id='register-avatar-error'>{avatarUrlError}</small>}
          </label>

          {apiError && <p className={styles.error}>{apiError}</p>}

          <Button type='submit' width='full' loading={isSubmitting}>
            Đăng ký
          </Button>
        </form>

        <footer className={styles.footer}>
          <span>Đã có tài khoản?</span>
          <button type='button' className={styles.linkButton} onClick={onLoginClick}>
            Đăng nhập
          </button>
        </footer>
      </section>
    </main>
  )
}
