import { act, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import Providers from '@/components/Providers';

const { listeners } = vi.hoisted(() => ({ listeners: new Set<(lng: string) => void>() }));

vi.mock('@/i18n/i18n', () => ({
  default: {
    on: (_event: string, fn: (lng: string) => void) => listeners.add(fn),
    off: (_event: string, fn: (lng: string) => void) => listeners.delete(fn),
  },
}));

// Without an appService, Providers skips settings loading and renders nothing,
// so only its UI language effect runs.
vi.mock('@/context/EnvContext', () => ({
  useEnv: () => ({ envConfig: {}, appService: null }),
}));

const changeLanguage = (lng: string) =>
  act(() => {
    localStorage.setItem('i18nextLng', lng);
    listeners.forEach((fn) => fn(lng));
  });

it('sets the html dir from the UI language', () => {
  render(<Providers>{null}</Providers>);

  changeLanguage('ar');
  expect(document.documentElement.lang).toBe('ar');
  expect(document.documentElement.dir).toBe('rtl');

  changeLanguage('en');
  expect(document.documentElement.dir).toBe('ltr');
});
