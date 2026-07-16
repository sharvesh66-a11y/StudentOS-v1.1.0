/**
 * Auth flow tests.
 *
 * Renders the login + signup pages and exercises:
 *   - Form validation (email format, password length, password match, terms consent)
 *   - Successful submission fires the auth service with the right payload
 *   - Failed submission surfaces the error message
 *
 * `useAuth` is mocked so we can assert on the `signIn` / `signUp` calls
 * without touching Firebase Auth.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// --- Mocks --------------------------------------------------------------
//
// `vi.mock` factories are hoisted to the top of the file by vitest's
// transformer, so any variable referenced inside the factory must be
// declared via `vi.hoisted()` to be available when the factory runs.

const authMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  clearError: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  sendVerificationEmail: vi.fn(),
  refreshProfile: vi.fn(),
}));

const { signIn, signUp, clearError } = authMocks;

// Both `@/features/auth` (used by LoginPage/SignupPage) and the relative
// `../hooks/use-auth` (used by OAuthButtons) resolve to the same hook —
// we mock both paths so neither imports the real `useAuth`.
vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    ...authMocks,
  }),
}));
vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    ...authMocks,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// session-persistence + auth-redirect are side-effectful on real Firebase
// session storage. Mock them to no-ops.
vi.mock('@/features/auth/utils/session-persistence', () => ({
  setSessionPersistence: vi.fn().mockResolvedValue(undefined),
  getCurrentPersistence: vi.fn().mockReturnValue('local'),
  DEFAULT_PERSISTENCE: 'local',
}));

// Import AFTER mocks are registered.
import LoginPage from '@/app/(auth)/login/page';
import SignupPage from '@/app/(auth)/signup/page';

// --- Reset ---------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---------------------------------------------------------------

describe('Login flow', () => {
  it('renders the email + password fields and a submit button', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    // Use exact match — `/Password/i` also matches the "Show password"
    // aria-label on the visibility-toggle button.
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('submits with valid email + password and calls signIn', async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ success: true, data: { uid: 'u1' } });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    // Use exact match — `/Password/i` also matches the "Show password"
    // aria-label on the visibility-toggle button.
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledTimes(1);
    });
    expect(signIn).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'password1',
    });
  });

  it('clears the previous error when the user submits again', async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ success: true, data: { uid: 'u1' } });

    render(<LoginPage />);
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => expect(clearError).toHaveBeenCalled());
  });

  it('surfaces the error message when signIn fails', async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({
      success: false,
      error: {
        code: 'auth/wrong-password',
        message: 'Incorrect password. Please try again.',
        service: 'auth',
      },
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpass1');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Incorrect password/)).toBeInTheDocument();
    });
  });

  it('shows a loading state on the submit button while submitting', async () => {
    const user = userEvent.setup();
    // Never-resolving promise keeps the button in the loading state.
    signIn.mockReturnValue(new Promise(() => {}));

    render(<LoginPage />);
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Signing in/i })).toBeDisabled();
    });
  });
});

describe('Signup flow — validation', () => {
  it('renders all required fields', () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Password/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/I agree to the/i)).toBeInTheDocument();
  });

  it('requires a display name of at least 2 characters', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Display name/i), 'A');
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Password1');
    await user.click(screen.getByLabelText(/I agree to the/i));
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
    expect(signUp).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Display name/i), 'Ada');
    await user.type(screen.getByLabelText(/Email/i), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Password1');
    await user.click(screen.getByLabelText(/I agree to the/i));
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
    expect(signUp).not.toHaveBeenCalled();
  });

  it('rejects a password shorter than 8 characters', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Display name/i), 'Ada');
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'Pass1');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Pass1');
    await user.click(screen.getByLabelText(/I agree to the/i));
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
    expect(signUp).not.toHaveBeenCalled();
  });

  it('rejects a password without a letter or number', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Display name/i), 'Ada');
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    // Letters only, no number — fails the `/\d/` rule.
    await user.type(screen.getByLabelText('Password'), 'Password');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Password');
    await user.click(screen.getByLabelText(/I agree to the/i));
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least one number/i)).toBeInTheDocument();
    });
    expect(signUp).not.toHaveBeenCalled();
  });

  it('rejects when the passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Display name/i), 'Ada');
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Password2');
    await user.click(screen.getByLabelText(/I agree to the/i));
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
    expect(signUp).not.toHaveBeenCalled();
  });

  it('requires agreeing to the terms', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Display name/i), 'Ada');
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Password1');
    // Deliberately skip clicking the agree-to-terms checkbox.
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/agree to the Terms/i)).toBeInTheDocument();
    });
    expect(signUp).not.toHaveBeenCalled();
  });
});

describe('Signup flow — successful submission', () => {
  it('calls signUp with the email, password, and display name', async () => {
    const user = userEvent.setup();
    signUp.mockResolvedValue({ success: true, data: { uid: 'u1' } });

    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Display name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Password1');
    await user.click(screen.getByLabelText(/I agree to the/i));
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledTimes(1);
    });
    expect(signUp).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'Password1',
      displayName: 'Ada Lovelace',
    });
  });

  it('surfaces the error message when signUp fails', async () => {
    const user = userEvent.setup();
    signUp.mockResolvedValue({
      success: false,
      error: {
        code: 'auth/email-already-in-use',
        message: 'An account with this email already exists.',
        service: 'auth',
      },
    });

    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Display name/i), 'Ada');
    await user.type(screen.getByLabelText(/Email/i), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Password1');
    await user.click(screen.getByLabelText(/I agree to the/i));
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });
});
