/**
 * Unit tests for the AuthContext module.
 *
 * The context itself is a plain React Context. These tests verify:
 *   - The context is created (not undefined)
 *   - The default value is undefined (so useAuth can detect missing-provider misuse)
 *   - A consumer inside <AuthProvider> receives the value the provider assigns
 *
 * The AuthProvider's full Firebase wiring is exercised in
 * `tests/flows/auth-flow.test.tsx` instead — these tests focus on the
 * context plumbing in isolation.
 */
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthContext, type AuthContextValue } from '@/features/auth/context/auth-context';

describe('AuthContext', () => {
  it('is defined (a React context object was created)', () => {
    expect(AuthContext).toBeDefined();
    expect(AuthContext.Provider).toBeDefined();
    expect(AuthContext.Consumer).toBeDefined();
  });

  it('defaults to undefined (so useAuth can detect missing-provider misuse)', () => {
    expect(AuthContext.displayName).toBe('StudentOSAuthContext');
    // The default value is undefined — consumers outside a provider get undefined.
    const Consumer: React.FC = () => {
      const value = React.useContext(AuthContext);
      return <span>{value === undefined ? 'no-provider' : 'has-provider'}</span>;
    };
    render(<Consumer />);
    expect(screen.getByText('no-provider')).toBeInTheDocument();
  });

  it('provides the assigned value to a consumer inside a provider', () => {
    const value: AuthContextValue = {
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      sendVerificationEmail: vi.fn(),
      refreshProfile: vi.fn(),
      clearError: vi.fn(),
    };

    const Consumer: React.FC = () => {
      const v = React.useContext(AuthContext);
      return (
        <span>
          {v === value ? 'matches' : 'no-match'} | isLoading={String(v?.isLoading)}
        </span>
      );
    };

    render(
      <AuthContext.Provider value={value}>
        <Consumer />
      </AuthContext.Provider>,
    );

    expect(screen.getByText(/matches/)).toBeInTheDocument();
    expect(screen.getByText(/isLoading=false/)).toBeInTheDocument();
  });
});
