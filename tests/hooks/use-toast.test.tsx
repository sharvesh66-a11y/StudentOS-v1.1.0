/**
 * Unit tests for the useToast hook.
 *
 * The hook uses a module-level singleton store, so we need to clean up
 * between tests to avoid leaking state.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from '@/hooks/use-toast';

beforeEach(() => {
  // Dismiss any toasts left over from previous tests.
  const { result } = renderHook(() => useToast());
  act(() => {
    result.current.dismiss();
  });
});

describe('useToast', () => {
  it('starts with an empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('exposes a toast() function and a dismiss() function', () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.toast).toBe('function');
    expect(typeof result.current.dismiss).toBe('function');
  });

  it('adds a toast when toast() is called', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'Hello' });
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Hello');
    expect(result.current.toasts[0].open).toBe(true);
  });

  it('caps the toasts array at TOAST_LIMIT = 1', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'First' });
      result.current.toast({ title: 'Second' });
    });
    // TOAST_LIMIT = 1 → only the most recent toast is kept.
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Second');
  });

  it('marks the toast as closed (open=false) when dismiss(toastId) is called', () => {
    const { result } = renderHook(() => useToast());
    let id: string | undefined;
    act(() => {
      const ret = result.current.toast({ title: 'Hi' });
      id = ret.id;
    });
    act(() => {
      result.current.dismiss(id);
    });
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('returns an object with dismiss + update + id from toast()', () => {
    const { result } = renderHook(() => useToast());
    let ret: ReturnType<typeof toast> | undefined;
    act(() => {
      ret = result.current.toast({ title: 'X' });
    });
    expect(ret).toBeDefined();
    expect(typeof ret?.id).toBe('string');
    expect(typeof ret?.dismiss).toBe('function');
    expect(typeof ret?.update).toBe('function');
  });

  it('updates an existing toast via the update() method', () => {
    const { result } = renderHook(() => useToast());
    let ret: ReturnType<typeof toast> | undefined;
    act(() => {
      ret = result.current.toast({ title: 'Original' });
    });
    act(() => {
      // `update()` is typed to take a full ToasterToast (with id), but the
      // implementation overrides the id internally. Pass a dummy id to
      // satisfy the type checker.
      ret?.update({ id: ret.id, title: 'Updated' });
    });
    expect(result.current.toasts[0].title).toBe('Updated');
  });

  it('dismiss() with no arg marks all toasts as closed', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'A' });
    });
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.toasts[0].open).toBe(false);
  });
});
