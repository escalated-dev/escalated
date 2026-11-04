// Imported ahead of src/widget/index.js so the widget module does not mount a
// launcher on the Storybook page by itself; the demo story mounts its own.
globalThis.__ESCALATED_WIDGET_NO_AUTOBOOT__ = true;
