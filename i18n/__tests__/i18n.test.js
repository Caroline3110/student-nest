jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

import en from '../en';
import zh from '../zh';
import { translate } from '../index';

// Every leaf key, with arrays reported by length so lists must match too.
const shape = (node, prefix = '') =>
  Object.entries(node).flatMap(([key, value]) => {
    const path = prefix + key;
    if (Array.isArray(value)) return [`${path}[${value.length}]`];
    if (value && typeof value === 'object') return shape(value, `${path}.`);
    return [path];
  });

const placeholders = (str) => (str.match(/\{\{\w+\}\}/g) || []).sort();

const leaves = (node, prefix = '') =>
  Object.entries(node).flatMap(([key, value]) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? leaves(value, `${prefix + key}.`)
      : [[prefix + key, value]]);

describe('translations', () => {
  it('Chinese has exactly the same keys as English', () => {
    expect(shape(zh).sort()).toEqual(shape(en).sort());
  });

  it('Chinese strings use the same {{placeholders}} as English', () => {
    leaves(en)
      .filter(([, value]) => typeof value === 'string')
      .forEach(([key, value]) => {
        expect([key, placeholders(translate('zh', key))]).toEqual([key, placeholders(value)]);
      });
  });

  it('has no empty strings', () => {
    [...leaves(en), ...leaves(zh)]
      .flatMap(([key, value]) => (Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]))
      .forEach(([key, value]) => expect([key, value.trim().length > 0]).toEqual([key, true]));
  });
});

describe('translate', () => {
  it('returns the string for the chosen language', () => {
    expect(translate('en', 'common.save')).toBe('Save');
    expect(translate('zh', 'common.save')).toBe('保存');
  });

  it('fills in {{placeholders}}', () => {
    expect(translate('en', 'setup.step', { current: 2, total: 4 })).toBe('Step 2 of 4');
    expect(translate('zh', 'setup.step', { current: 2, total: 4 })).toBe('第 2 步，共 4 步');
  });

  it('falls back to the last part of the key for unknown stored values', () => {
    expect(translate('zh', 'roommates.lifestyle.Vegan')).toBe('Vegan');
  });

  it('returns arrays for list content', () => {
    expect(translate('zh', 'mindnest.walkSteps')).toHaveLength(5);
  });
});
