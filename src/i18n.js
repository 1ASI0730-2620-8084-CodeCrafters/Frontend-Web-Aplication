import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';

const SUPPORTED_LANGUAGES = ['en', 'es'];
const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'bottletrack.language';
const DOCUMENT_LANGUAGES = { en: 'en-US', es: 'es-419' };

function resolveInitialLanguage() {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(storedLanguage)) return storedLanguage;
    const browserLanguage = navigator.language.slice(0, 2);
    return SUPPORTED_LANGUAGES.includes(browserLanguage) ? browserLanguage : DEFAULT_LANGUAGE;
}

const i18n = createI18n({
    legacy: false,
    locale: resolveInitialLanguage(),
    fallbackLocale: DEFAULT_LANGUAGE,
    messages: { en, es }
});

export function setLanguage(language) {
    i18n.global.locale.value = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = DOCUMENT_LANGUAGES[language];
}

export { SUPPORTED_LANGUAGES };

document.documentElement.lang = DOCUMENT_LANGUAGES[i18n.global.locale.value];

export default i18n;
