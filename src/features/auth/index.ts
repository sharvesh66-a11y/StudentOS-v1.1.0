/**
 * StudentOS Auth Feature Barrel
 *
 * Import auth feature APIs from here:
 *   import { useAuth, AuthProvider, ProtectedRoute, authService } from '@/features/auth'
 */

// Provider + Context
export { AuthProvider } from './provider/auth-provider';
export { AuthContext, type AuthContextValue } from './context/auth-context';

// Hooks
export { useAuth } from './hooks/use-auth';
export { useAuthStore } from './store/auth.store';

// Service
export { authService, type AuthService } from './services/auth.service';

// Components
export { ProtectedRoute, GuestRoute, type ProtectedRouteProps } from './components/protected-route';
export { FullPageLoader } from './components/full-page-loader';
export { AuthFormCard, type AuthFormCardProps } from './components/auth-form-card';
export { AuthErrorAlert, type AuthErrorAlertProps } from './components/auth-error-alert';
export { PasswordInput, type PasswordInputProps } from './components/password-input';
export { PasswordStrength, type PasswordStrengthProps } from './components/password-strength';
export { OAuthButtons } from './components/oauth-buttons';

// Schemas
export {
  loginFormSchema,
  signupFormSchema,
  passwordResetFormSchema,
  emailSchema,
  passwordSchema,
  displayNameSchema,
  type LoginFormValues,
  type SignupFormValues,
  type PasswordResetFormValues,
} from './schemas/auth-schemas';

// Utils
export {
  setSessionPersistence,
  getCurrentPersistence,
  DEFAULT_PERSISTENCE,
  type PersistenceStrategy,
} from './utils/session-persistence';
export {
  scorePassword,
  type PasswordStrengthResult,
  type PasswordStrengthLevel,
} from './utils/password-strength';
export { sanitizeRedirect, getSafeRedirect } from './utils/auth-redirect';

// Types
export type {
  AuthState,
  AuthError,
  AuthResult,
  SignUpPayload,
  SignInPayload,
  OAuthProviderId,
} from './types';
