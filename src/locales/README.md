# Local locale overrides

The JSON files in this directory (`en.json`, `de.json`, …) are **local overrides** that win over the central source published by [`@escalated-dev/locale`](https://github.com/escalated-dev/escalated-locale).

The composable in `src/composables/useI18n.js` resolves keys in this order:

1. Host-app `customMessages` for the current locale
2. Local override (these JSON files) for the current locale
3. Central source (`@escalated-dev/locale`) for the current locale
4. Same three layers, but English fallback
5. Raw key

After the central package is populated with the canonical strings, files here can be trimmed to contain only the keys this plugin needs to phrase differently from the central source. Keys not present locally fall through to the central source unchanged.
