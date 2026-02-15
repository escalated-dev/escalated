import { ref, computed } from 'vue';
import locales from '../locales/index.js';

const currentLocale = ref('en');
const customMessages = ref({});

function resolve(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function applyReplacements(str, replacements) {
    if (!replacements) return str;
    return Object.entries(replacements).reduce(
        (result, [key, value]) => result.replace(new RegExp(`:${key}`, 'g'), value),
        str,
    );
}

export function setLocale(locale) {
    currentLocale.value = locale;
}

export function getLocale() {
    return currentLocale.value;
}

export function mergeMessages(locale, messages) {
    customMessages.value = {
        ...customMessages.value,
        [locale]: deepMerge(customMessages.value[locale] || {}, messages),
    };
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (
            source[key] &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            target[key] &&
            typeof target[key] === 'object'
        ) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

export function useI18n() {
    const locale = computed(() => currentLocale.value);

    function t(key, replacements) {
        const lang = currentLocale.value;

        // Try custom messages for current locale
        const custom = resolve(customMessages.value[lang], key);
        if (typeof custom === 'string') return applyReplacements(custom, replacements);

        // Try built-in messages for current locale
        const msg = resolve(locales[lang], key);
        if (typeof msg === 'string') return applyReplacements(msg, replacements);

        // Fallback to English
        if (lang !== 'en') {
            const customEn = resolve(customMessages.value.en, key);
            if (typeof customEn === 'string') return applyReplacements(customEn, replacements);

            const fallback = resolve(locales.en, key);
            if (typeof fallback === 'string') return applyReplacements(fallback, replacements);
        }

        // Return raw key
        return key;
    }

    return { t, locale };
}
