import { describe, expect, it, vi } from 'vitest';
import { PUBLIC_LANGUAGE_STORAGE_KEY, readStoredPublicLanguage, resolvePublicLanguage, writeStoredPublicLanguage } from './i18n';

describe('public homepage i18n helpers', () => {
  it('falls back to English for unsupported values', () => {
    expect(resolvePublicLanguage('fr')).toBe('en');
    expect(resolvePublicLanguage(null)).toBe('en');
  });

  it('reads supported language from storage', () => {
    expect(readStoredPublicLanguage({ getItem: () => 'vi' })).toBe('vi');
  });

  it('writes language preference to storage', () => {
    const setItem = vi.fn();

    writeStoredPublicLanguage('vi', { setItem });

    expect(setItem).toHaveBeenCalledWith(PUBLIC_LANGUAGE_STORAGE_KEY, 'vi');
  });
});
