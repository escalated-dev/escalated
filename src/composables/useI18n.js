import { ref, computed } from 'vue';
import overrideLocales from '../locales/index.js';

// Central translations published from escalated-dev/escalated-locale.
// This is the BASE layer. Local src/locales/*.json files in this repo are
// loaded as OVERRIDES and win over the central source for any matching key.
//
// Until @escalated-dev/locale v0.1.0 ships its consolidated strings, this
// import resolves to a stub object with the same shape. Local overrides
// (src/locales/) preserve the current behavior so components keep rendering
// the strings they always rendered. After Codex finishes consolidating
// translations into the central package, the local override files can be
// trimmed (or deleted entirely) and the central source becomes authoritative.
import centralLocales from '@escalated-dev/locale';

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

        // 1. Host-app supplied messages for the current locale (highest priority).
        const custom = resolve(customMessages.value[lang], key);
        if (typeof custom === 'string') return applyReplacements(custom, replacements);

        // 2. Local plugin overrides for the current locale (src/locales/*.json).
        //    These exist to let this repo win over the central source for any
        //    string the plugin needs to phrase differently.
        const override = resolve(overrideLocales[lang], key);
        if (typeof override === 'string') return applyReplacements(override, replacements);

        // 3. Central source for the current locale (@escalated-dev/locale).
        //    This is the canonical base layer.
        const central = resolve(centralLocales?.[lang], key);
        if (typeof central === 'string') return applyReplacements(central, replacements);

        // 4. English fallbacks, in the same priority order.
        if (lang !== 'en') {
            const customEn = resolve(customMessages.value.en, key);
            if (typeof customEn === 'string') return applyReplacements(customEn, replacements);

            const overrideEn = resolve(overrideLocales.en, key);
            if (typeof overrideEn === 'string') return applyReplacements(overrideEn, replacements);

            const centralEn = resolve(centralLocales?.en, key);
            if (typeof centralEn === 'string') return applyReplacements(centralEn, replacements);
        }

        // Return raw key
        return key;
    }

    return { t, locale };
}
