import { describe, expect, it } from 'vitest';
import { sessionExpired } from './session';

describe('sessionExpired', () => {
    it('401 com token guardado encerra a sessão', () => {
        expect(sessionExpired(401, 'um-token')).toBe(true);
    });

    it('401 sem token é só login inválido', () => {
        expect(sessionExpired(401, null)).toBe(false);
        expect(sessionExpired(401, '')).toBe(false);
    });

    it('outros erros não mexem na sessão', () => {
        expect(sessionExpired(400, 'um-token')).toBe(false);
        expect(sessionExpired(500, 'um-token')).toBe(false);
        expect(sessionExpired(undefined, 'um-token')).toBe(false);
    });
});
