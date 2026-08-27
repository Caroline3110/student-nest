import { getDaysUntil } from '../examUtils';

const ERROR_INVALID_DATE = 'error, please add a valid date';
const ERROR_TOO_FAR_FUTURE = 'error, date cannot be more than 3 years away';

const isoDateOffsetBy = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

describe('getDaysUntil', () => {
  describe('null / missing input', () => {
    it('rejects null', () => {
      expect(getDaysUntil(null)).toBe(ERROR_INVALID_DATE);
    });

    it('rejects undefined', () => {
      expect(getDaysUntil(undefined)).toBe(ERROR_INVALID_DATE);
    });

    it('rejects empty string', () => {
      expect(getDaysUntil('')).toBe(ERROR_INVALID_DATE);
    });
  });

  describe('invalid strings', () => {
    it('rejects a non-date word', () => {
      expect(getDaysUntil('hello')).toBe(ERROR_INVALID_DATE);
    });

    it('rejects a malformed date string', () => {
      expect(getDaysUntil('2025-13-45')).toBe(ERROR_INVALID_DATE);
    });

    it('rejects random garbage input', () => {
      expect(getDaysUntil('not-a-date-at-all')).toBe(ERROR_INVALID_DATE);
    });
  });

  describe('dates too far in the past', () => {
    it('rejects a date more than 365 days ago', () => {
      expect(getDaysUntil(isoDateOffsetBy(-366))).toBe(ERROR_INVALID_DATE);
    });

    it('rejects a fixed date far in the past (1990)', () => {
      expect(getDaysUntil('1990-01-01')).toBe(ERROR_INVALID_DATE);
    });

    it('accepts a date exactly 365 days ago (boundary)', () => {
      expect(getDaysUntil(isoDateOffsetBy(-365))).toBe(-365);
    });
  });

  describe('dates too far in the future', () => {
    it('rejects a date more than 1095 days away', () => {
      expect(getDaysUntil(isoDateOffsetBy(1096))).toBe(ERROR_TOO_FAR_FUTURE);
    });

    it('rejects a fixed date far in the future (2099)', () => {
      expect(getDaysUntil('2099-01-01')).toBe(ERROR_TOO_FAR_FUTURE);
    });

    it('accepts a date exactly 1095 days away (boundary)', () => {
      expect(getDaysUntil(isoDateOffsetBy(1095))).toBe(1095);
    });
  });

  describe('valid dates', () => {
    it('returns 0 for today', () => {
      expect(getDaysUntil(isoDateOffsetBy(0))).toBe(0);
    });

    it('returns 1 for tomorrow', () => {
      expect(getDaysUntil(isoDateOffsetBy(1))).toBe(1);
    });

    it('returns -1 for yesterday', () => {
      expect(getDaysUntil(isoDateOffsetBy(-1))).toBe(-1);
    });

    it('returns 30 for a date 30 days out', () => {
      expect(getDaysUntil(isoDateOffsetBy(30))).toBe(30);
    });
  });
});
