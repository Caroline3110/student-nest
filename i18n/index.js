import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en';
import zh from './zh';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '简体中文' },
];

const DICTS = { en, zh };
const STORAGE_KEY = 'language';

const lookup = (dict, key) =>
  key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);

// t('home.title') or t('exams.daysLeft', { count: 3 }) -> fills {{count}}.
// Falls back to English, then to the last part of the key, so a missing
// Chinese string shows up as English and a stored value like
// t('roommates.lifestyle.Quiet') still reads 'Quiet' if it isn't listed.
export const translate = (lang, key, vars) => {
  let str = lookup(DICTS[lang], key) ?? lookup(en, key) ?? key.split('.').pop();
  if (typeof str !== 'string') return str;
  if (vars) {
    str = str.replace(/\{\{(\w+)\}\}/g, (m, name) => (vars[name] ?? m).toString());
  }
  return str;
};

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key, vars) => translate('en', key, vars),
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => { if (DICTS[saved]) setLangState(saved); })
      .catch(() => {});
  }, []);

  const setLang = useCallback((code) => {
    if (!DICTS[code]) return;
    setLangState(code);
    AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
  }, []);

  const value = useMemo(() => ({
    lang,
    setLang,
    t: (key, vars) => translate(lang, key, vars),
  }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
export const useT = () => useContext(LanguageContext).t;
