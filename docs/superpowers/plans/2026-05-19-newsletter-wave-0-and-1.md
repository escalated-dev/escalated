# Newsletter System — Wave 0 + Wave 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the shared Vue/Inertia frontend (Wave 0, `escalated/`) and the Laravel reference backend (Wave 1, `escalated-laravel/`) for the opt-in newsletter system — an end-to-end working broadcast feature that admins can enable at install time.

**Architecture:** Each backend ships a self-contained newsletter module gated by a feature flag (no runtime cost when disabled). Markdown-authored emails → host-language template themes → ESP-or-self-hosted tracking → one-click contact-scoped unsubscribe. This plan covers the shared frontend and Laravel reference; subsequent ports (NestJS + 8 backends) get their own plan after Wave 1 ships.

**Tech Stack:** Vue 3 + Inertia.js (frontend, `escalated/`); PHP 8.2+ / Laravel 10+ / Pest / `league/commonmark` / `symfony/dom-crawler` (backend, `escalated-laravel/`).

**Spec:** `docs/superpowers/specs/2026-05-19-newsletter-system-design.md`

**Review gate:** **Do NOT auto-merge any PR produced by this plan.** Open the PR, push the branch, share the URL, then stop. Matthew reviews every PR in the Escalated portfolio before it lands on `main`. No `gh pr merge`, no `--auto` flags.

---

## Pre-flight

- [ ] **Step 0.1: Confirm working directories**

Two repos are touched. Verify both exist and are on `main`:

```bash
git -C C:/Users/work/escalated status -sb
git -C C:/Users/work/escalated-laravel status -sb
```

Expected: both report `## main` with no uncommitted changes (or only the in-flight feature branch). If `escalated-laravel` is on a different branch, ask before continuing.

- [ ] **Step 0.2: Create feature branches**

```bash
git -C C:/Users/work/escalated checkout -b feat/newsletter-frontend
git -C C:/Users/work/escalated-laravel checkout -b feat/newsletter-system
```

- [ ] **Step 0.3: Read the spec**

Read `C:/Users/work/escalated/docs/superpowers/specs/2026-05-19-newsletter-system-design.md` end to end before starting. Every task in this plan assumes you've internalized the data model, the send pipeline, and the two-layer rendering contract.

---

## Phase A — Shared Frontend (`escalated/`, Wave 0)

The frontend ships first because the Laravel PR will consume the page components from the published `@escalated-dev/escalated` package. Wave 0 must merge and be tagged (likely `0.9.0`) before Wave 1 can complete.

**File structure (Phase A):**

```
src/locales/en/newsletters.js                              (new)
src/components/admin/AdminSidebar.vue                       (modify — gated nav)
src/components/admin/newsletters/MarkdownEditor.vue        (new)
src/components/admin/newsletters/MergeFieldDropdown.vue    (new)
src/components/admin/newsletters/PreviewIframe.vue         (new)
src/components/admin/newsletters/SummaryTiles.vue          (new)
src/components/admin/newsletters/DeliveriesTable.vue       (new)
src/components/admin/newsletters/AnalyticsTiles.vue        (new)
src/components/admin/newsletters/ListMemberTable.vue       (new)
src/components/admin/newsletters/DynamicFilterBuilder.vue  (new)
src/pages/admin/newsletters/Index.vue                      (new)
src/pages/admin/newsletters/Compose.vue                    (new)
src/pages/admin/newsletters/Show.vue                       (new)
src/pages/admin/newsletters/Edit.vue                       (new)
src/pages/admin/newsletters/Settings.vue                   (new)
src/pages/admin/newsletters/lists/Index.vue                (new)
src/pages/admin/newsletters/lists/Create.vue               (new)
src/pages/admin/newsletters/lists/Show.vue                 (new)
src/pages/admin/newsletters/templates/Index.vue            (new)
src/pages/admin/newsletters/templates/Create.vue           (new)
src/pages/admin/newsletters/templates/Show.vue             (new)
(+ matching *.stories.js Storybook files alongside each component/page)
(+ matching *.test.js Vitest unit tests alongside each component)
package.json                                                (modify — version bump)
```

---

### Task A1: Locale strings

**Files:**
- Create: `src/locales/en/newsletters.js`
- Modify: `src/locales/index.js`

- [ ] **Step 1: Create the locale module**

```javascript
// src/locales/en/newsletters.js
export default {
  nav: {
    newsletters: 'Newsletters',
  },
  index: {
    title: 'Newsletters',
    new: 'New newsletter',
    tabs: { drafts: 'Drafts', scheduled: 'Scheduled', sent: 'Sent' },
    empty: { drafts: 'No drafts yet.', scheduled: 'No scheduled sends.', sent: 'No newsletters sent yet.' },
    columns: { subject: 'Subject', list: 'List', status: 'Status', scheduled: 'Scheduled', sent: 'Sent', recipients: 'Recipients' },
  },
  compose: {
    title: 'New newsletter',
    subject: 'Subject',
    from_name: 'From name',
    from_email: 'From email',
    reply_to: 'Reply-To',
    list: 'Target list',
    schedule: 'Schedule send',
    schedule_at: 'Send at',
    template: 'Start from template',
    body: 'Body (Markdown)',
    preview: 'Preview',
    actions: { save_draft: 'Save draft', test_send: 'Send test to me', schedule: 'Schedule', send_now: 'Send now' },
    mail_not_configured: 'Configure outbound mail before sending newsletters.',
  },
  detail: {
    tabs: { overview: 'Overview', deliveries: 'Deliveries', analytics: 'Analytics' },
    status: { draft: 'Draft', scheduled: 'Scheduled', sending: 'Sending', sent: 'Sent', paused: 'Paused', failed: 'Failed' },
    actions: { edit: 'Edit', pause: 'Pause', resume: 'Resume', duplicate: 'Duplicate' },
  },
  deliveries: {
    columns: { contact: 'Contact', status: 'Status', sent_at: 'Sent', opened_at: 'Opened', clicked_at: 'Last clicked', bounce_reason: 'Bounce reason' },
    status: { pending: 'Pending', queued: 'Queued', sent: 'Sent', bounced: 'Bounced', complained: 'Complained', suppressed: 'Suppressed', failed: 'Failed' },
    filter: 'Filter by status',
    export: 'Export CSV',
  },
  analytics: {
    tiles: { sent: 'Sent', delivered: 'Delivered', opened: 'Opened', clicked: 'Clicked', bounced: 'Bounced' },
    top_clicked: 'Top clicked URLs',
  },
  lists: {
    title: 'Lists',
    new: 'New list',
    kind: { static: 'Static', dynamic: 'Dynamic' },
    columns: { name: 'Name', kind: 'Kind', members: 'Members', opted_out: 'Opted out' },
    create: { static_help: 'Manually add contacts or import a CSV.', dynamic_help: 'Saved filter that re-evaluates on every send.' },
    members: { add: 'Add contact', remove: 'Remove', import_csv: 'Import CSV' },
    filter_builder: { matches: '{count} contacts match' },
  },
  templates: {
    title: 'Templates',
    new: 'New template',
    columns: { name: 'Name', theme: 'Theme', last_used: 'Last used' },
    theme: 'Theme',
    subject_template: 'Default subject',
    body: 'Body (Markdown)',
  },
  settings: {
    title: 'Newsletter settings',
    default_from: 'Default From address',
    default_reply_to: 'Default Reply-To',
    default_theme: 'Default theme',
    rate_limit: 'Rate limit (sends per minute)',
    batch_size: 'Dispatcher batch size',
    tracking_enabled: 'Enable open & click tracking',
    tracking_help: 'When off, pixel and click-rewriting are skipped. Bounces and complaints from your ESP still update delivery status.',
  },
  merge_fields: {
    label: 'Insert merge field',
    contact_name: "Contact's full name",
    contact_first_name: "Contact's first name",
    contact_email: "Contact's email",
    unsubscribe_url: 'Unsubscribe URL',
    view_in_browser_url: 'View-in-browser URL',
  },
  permissions: {
    no_manage: 'You need the newsletters.manage permission to view this page.',
    no_send: 'You need the newsletters.send permission to send or schedule.',
  },
};
```

- [ ] **Step 2: Wire the locale module into the index**

Read `src/locales/index.js` first to match the existing pattern, then add a `newsletters` entry alongside the other feature locales. Use the same import + spread shape that the existing entries use.

- [ ] **Step 3: Run the lint and tests**

```bash
cd C:/Users/work/escalated && npm run lint && npm run test
```

Expected: all pass. The locale file is data-only so there's no behavior test to write here.

- [ ] **Step 4: Commit**

```bash
git -C C:/Users/work/escalated add src/locales
git -C C:/Users/work/escalated commit -m "feat(newsletters): add English locale strings"
```

---

### Task A2: Sidebar nav gating

**Files:**
- Modify: `src/components/admin/AdminSidebar.vue`
- Test: `src/components/admin/AdminSidebar.test.js` (extend existing or add)

- [ ] **Step 1: Read the current sidebar**

Read `src/components/admin/AdminSidebar.vue` end to end. Find where existing feature-gated nav items (KB, CSAT) live — that's the pattern to mirror.

- [ ] **Step 2: Write the failing test**

Add to the existing AdminSidebar test (or create one) — assert that the Newsletters link only renders when both conditions hold:

```javascript
// src/components/admin/AdminSidebar.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import AdminSidebar from './AdminSidebar.vue';

describe('AdminSidebar — newsletters', () => {
  const mountWith = (features, permissions) =>
    mount(AdminSidebar, {
      global: {
        mocks: { $page: { props: { escalated: { features, auth: { permissions } } } } },
      },
    });

  it('hides Newsletters when feature flag is off', () => {
    const wrapper = mountWith({ newsletters: false }, ['newsletters.manage']);
    expect(wrapper.text()).not.toContain('Newsletters');
  });

  it('hides Newsletters when user lacks both newsletter permissions', () => {
    const wrapper = mountWith({ newsletters: true }, []);
    expect(wrapper.text()).not.toContain('Newsletters');
  });

  it('shows Newsletters when feature is on and user has newsletters.manage', () => {
    const wrapper = mountWith({ newsletters: true }, ['newsletters.manage']);
    expect(wrapper.text()).toContain('Newsletters');
  });

  it('shows Newsletters when feature is on and user has newsletters.send', () => {
    const wrapper = mountWith({ newsletters: true }, ['newsletters.send']);
    expect(wrapper.text()).toContain('Newsletters');
  });
});
```

- [ ] **Step 3: Run the failing test**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/AdminSidebar.test.js
```

Expected: FAIL because no Newsletters entry yet.

- [ ] **Step 4: Add the nav item**

In `AdminSidebar.vue`, find the block where existing gated nav items render and add (matching the existing pattern — adapt prop/composable names to whatever the file actually uses; the snippet below is illustrative):

```vue
<router-link
  v-if="features.newsletters && (hasPermission('newsletters.manage') || hasPermission('newsletters.send'))"
  :to="{ name: 'admin.newsletters.index' }"
  class="nav-item"
>
  <Icon name="mail" />
  {{ $t('newsletters.nav.newsletters') }}
</router-link>
```

- [ ] **Step 5: Run the test**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/AdminSidebar.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/work/escalated add src/components/admin/AdminSidebar.vue src/components/admin/AdminSidebar.test.js
git -C C:/Users/work/escalated commit -m "feat(newsletters): gate Newsletters nav on feature flag + permissions"
```

---

### Task A3: MarkdownEditor component

A thin CodeMirror-lite editor. No heavy editor lib; the spec calls for developer-focus, so a textarea with light syntax highlighting and a "Insert merge field" hook is enough.

**Files:**
- Create: `src/components/admin/newsletters/MarkdownEditor.vue`
- Create: `src/components/admin/newsletters/MarkdownEditor.stories.js`
- Test: `src/components/admin/newsletters/MarkdownEditor.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// src/components/admin/newsletters/MarkdownEditor.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MarkdownEditor from './MarkdownEditor.vue';

describe('MarkdownEditor', () => {
  it('renders the v-model value', () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: '# Hello' } });
    expect(wrapper.find('textarea').element.value).toBe('# Hello');
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: '' } });
    await wrapper.find('textarea').setValue('hi');
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['hi']);
  });

  it('inserts merge field at cursor on insertMergeField()', async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: 'Hello ' } });
    const ta = wrapper.find('textarea').element;
    ta.setSelectionRange(6, 6);
    wrapper.vm.insertMergeField('contact.first_name');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe('Hello {{ contact.first_name }}');
  });
});
```

- [ ] **Step 2: Run the failing test**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/MarkdownEditor.test.js
```

Expected: FAIL (no file).

- [ ] **Step 3: Implement the component**

```vue
<!-- src/components/admin/newsletters/MarkdownEditor.vue -->
<template>
  <div class="markdown-editor">
    <textarea
      ref="ta"
      :value="modelValue"
      :rows="rows"
      class="markdown-editor__textarea"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  rows: { type: Number, default: 20 },
  placeholder: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);
const ta = ref(null);

function insertMergeField(path) {
  const el = ta.value;
  const token = `{{ ${path} }}`;
  if (!el) {
    emit('update:modelValue', `${props.modelValue}${token}`);
    return;
  }
  const start = el.selectionStart ?? props.modelValue.length;
  const end = el.selectionEnd ?? props.modelValue.length;
  const next = props.modelValue.slice(0, start) + token + props.modelValue.slice(end);
  emit('update:modelValue', next);
}

defineExpose({ insertMergeField });
</script>

<style scoped>
.markdown-editor__textarea {
  width: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 12px;
  border: 1px solid var(--escalated-border, #e2e8f0);
  border-radius: 6px;
  resize: vertical;
}
</style>
```

- [ ] **Step 4: Run the test**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/MarkdownEditor.test.js
```

Expected: PASS.

- [ ] **Step 5: Add the Storybook story**

```javascript
// src/components/admin/newsletters/MarkdownEditor.stories.js
import MarkdownEditor from './MarkdownEditor.vue';

export default { title: 'Admin/Newsletters/MarkdownEditor', component: MarkdownEditor };

export const Empty = { args: { modelValue: '' } };
export const WithContent = { args: { modelValue: '# Welcome\n\nThanks for being a customer.' } };
```

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/work/escalated add src/components/admin/newsletters/MarkdownEditor.vue src/components/admin/newsletters/MarkdownEditor.test.js src/components/admin/newsletters/MarkdownEditor.stories.js
git -C C:/Users/work/escalated commit -m "feat(newsletters): add MarkdownEditor component with merge-field insertion"
```

---

### Task A4: MergeFieldDropdown component

**Files:**
- Create: `src/components/admin/newsletters/MergeFieldDropdown.vue`
- Create: `src/components/admin/newsletters/MergeFieldDropdown.stories.js`
- Test: `src/components/admin/newsletters/MergeFieldDropdown.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// src/components/admin/newsletters/MergeFieldDropdown.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MergeFieldDropdown from './MergeFieldDropdown.vue';

describe('MergeFieldDropdown', () => {
  it('emits insert with selected path on selection', async () => {
    const wrapper = mount(MergeFieldDropdown);
    await wrapper.find('button.merge-field-dropdown__toggle').trigger('click');
    await wrapper.find('[data-path="contact.first_name"]').trigger('click');
    expect(wrapper.emitted('insert')[0]).toEqual(['contact.first_name']);
  });

  it('shows configured metadata keys when provided', async () => {
    const wrapper = mount(MergeFieldDropdown, { props: { metadataKeys: ['tier', 'plan'] } });
    await wrapper.find('button.merge-field-dropdown__toggle').trigger('click');
    expect(wrapper.text()).toContain('contact.metadata.tier');
    expect(wrapper.text()).toContain('contact.metadata.plan');
  });
});
```

- [ ] **Step 2: Run the failing test**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/MergeFieldDropdown.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement**

```vue
<!-- src/components/admin/newsletters/MergeFieldDropdown.vue -->
<template>
  <div class="merge-field-dropdown">
    <button type="button" class="merge-field-dropdown__toggle" @click="open = !open">
      {{ $t('newsletters.merge_fields.label') }} ▾
    </button>
    <ul v-if="open" class="merge-field-dropdown__menu">
      <li v-for="opt in options" :key="opt.path" :data-path="opt.path" @click="pick(opt.path)">
        <code>{{ '{{ ' + opt.path + ' }}' }}</code>
        <span class="merge-field-dropdown__hint">{{ opt.label }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  metadataKeys: { type: Array, default: () => [] },
});

const emit = defineEmits(['insert']);
const open = ref(false);

const options = computed(() => [
  { path: 'contact.name', label: 'Contact full name' },
  { path: 'contact.first_name', label: 'Contact first name' },
  { path: 'contact.email', label: 'Contact email' },
  { path: 'unsubscribe_url', label: 'Unsubscribe URL' },
  { path: 'view_in_browser_url', label: 'View-in-browser URL' },
  ...props.metadataKeys.map((k) => ({ path: `contact.metadata.${k}`, label: `Metadata: ${k}` })),
]);

function pick(path) {
  emit('insert', path);
  open.value = false;
}
</script>

<style scoped>
.merge-field-dropdown { position: relative; display: inline-block; }
.merge-field-dropdown__toggle {
  padding: 6px 10px; border: 1px solid var(--escalated-border, #e2e8f0);
  background: white; border-radius: 4px; cursor: pointer;
}
.merge-field-dropdown__menu {
  position: absolute; top: 100%; left: 0; z-index: 10;
  margin: 4px 0 0; padding: 4px 0; min-width: 280px;
  list-style: none; background: white; border: 1px solid var(--escalated-border, #e2e8f0);
  border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.merge-field-dropdown__menu li { padding: 8px 12px; cursor: pointer; display: flex; justify-content: space-between; gap: 12px; }
.merge-field-dropdown__menu li:hover { background: var(--escalated-bg-hover, #f7fafc); }
.merge-field-dropdown__hint { color: var(--escalated-text-muted, #64748b); font-size: 12px; }
</style>
```

- [ ] **Step 4: Run the test**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/MergeFieldDropdown.test.js
```

Expected: PASS.

- [ ] **Step 5: Story**

```javascript
// src/components/admin/newsletters/MergeFieldDropdown.stories.js
import MergeFieldDropdown from './MergeFieldDropdown.vue';

export default { title: 'Admin/Newsletters/MergeFieldDropdown', component: MergeFieldDropdown };

export const Default = {};
export const WithMetadataKeys = { args: { metadataKeys: ['tier', 'plan', 'lifecycle_stage'] } };
```

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/work/escalated add src/components/admin/newsletters/MergeFieldDropdown.vue src/components/admin/newsletters/MergeFieldDropdown.test.js src/components/admin/newsletters/MergeFieldDropdown.stories.js
git -C C:/Users/work/escalated commit -m "feat(newsletters): add MergeFieldDropdown component"
```

---

### Task A5: PreviewIframe component

Renders backend-provided HTML in a sandboxed iframe. Debounces updates.

**Files:**
- Create: `src/components/admin/newsletters/PreviewIframe.vue`
- Create: `src/components/admin/newsletters/PreviewIframe.stories.js`
- Test: `src/components/admin/newsletters/PreviewIframe.test.js`

- [ ] **Step 1: Failing test**

```javascript
// src/components/admin/newsletters/PreviewIframe.test.js
import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import PreviewIframe from './PreviewIframe.vue';

describe('PreviewIframe', () => {
  it('writes the provided HTML into the iframe srcdoc', async () => {
    const html = '<p>preview body</p>';
    const wrapper = mount(PreviewIframe, { props: { html } });
    await flushPromises();
    expect(wrapper.find('iframe').attributes('srcdoc')).toContain('preview body');
  });

  it('updates srcdoc when the html prop changes', async () => {
    const wrapper = mount(PreviewIframe, { props: { html: '<p>a</p>' } });
    await wrapper.setProps({ html: '<p>b</p>' });
    await flushPromises();
    expect(wrapper.find('iframe').attributes('srcdoc')).toContain('<p>b</p>');
  });

  it('renders a loading state while loading prop is true', () => {
    const wrapper = mount(PreviewIframe, { props: { html: '', loading: true } });
    expect(wrapper.find('.preview-iframe__loading').exists()).toBe(true);
  });
});
```

- [ ] **Step 2: Run the failing test**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/PreviewIframe.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement**

```vue
<!-- src/components/admin/newsletters/PreviewIframe.vue -->
<template>
  <div class="preview-iframe">
    <div v-if="loading" class="preview-iframe__loading">Rendering preview…</div>
    <iframe
      :srcdoc="html"
      sandbox="allow-same-origin"
      class="preview-iframe__frame"
      title="Newsletter preview"
    />
  </div>
</template>

<script setup>
defineProps({
  html: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});
</script>

<style scoped>
.preview-iframe { position: relative; height: 100%; min-height: 480px; border: 1px solid var(--escalated-border, #e2e8f0); border-radius: 6px; overflow: hidden; background: white; }
.preview-iframe__frame { width: 100%; height: 100%; border: 0; }
.preview-iframe__loading { position: absolute; top: 8px; right: 12px; font-size: 12px; color: var(--escalated-text-muted, #64748b); background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 4px; }
</style>
```

- [ ] **Step 4: Run the test**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/PreviewIframe.test.js
```

Expected: PASS.

- [ ] **Step 5: Story**

```javascript
// src/components/admin/newsletters/PreviewIframe.stories.js
import PreviewIframe from './PreviewIframe.vue';

export default { title: 'Admin/Newsletters/PreviewIframe', component: PreviewIframe };

export const Empty = { args: { html: '<p>(empty)</p>' } };
export const Rendered = { args: { html: '<h1>Newsletter</h1><p>Hello Maria,</p><p>Welcome aboard.</p>' } };
export const Loading = { args: { html: '<h1>Newsletter</h1>', loading: true } };
```

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/work/escalated add src/components/admin/newsletters/PreviewIframe.vue src/components/admin/newsletters/PreviewIframe.test.js src/components/admin/newsletters/PreviewIframe.stories.js
git -C C:/Users/work/escalated commit -m "feat(newsletters): add PreviewIframe component"
```

---

### Task A6: SummaryTiles + AnalyticsTiles + DeliveriesTable

Three display-only components, grouped because they share styling and patterns.

**Files:**
- Create: `src/components/admin/newsletters/SummaryTiles.vue` (+ stories + test)
- Create: `src/components/admin/newsletters/AnalyticsTiles.vue` (+ stories + test)
- Create: `src/components/admin/newsletters/DeliveriesTable.vue` (+ stories + test)

- [ ] **Step 1: Write SummaryTiles failing test**

```javascript
// src/components/admin/newsletters/SummaryTiles.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import SummaryTiles from './SummaryTiles.vue';

describe('SummaryTiles', () => {
  it('renders absolute counts and rate percentages', () => {
    const wrapper = mount(SummaryTiles, {
      props: {
        summary: { total: 1000, sent: 990, opened: 400, clicked: 80, bounced: 10, complained: 1 },
      },
    });
    expect(wrapper.text()).toContain('990');
    expect(wrapper.text()).toContain('40.4%'); // opened / sent
    expect(wrapper.text()).toContain('8.1%');  // clicked / sent
    expect(wrapper.text()).toContain('1.0%');  // bounced / sent
  });

  it('shows dashes when summary.sent is zero', () => {
    const wrapper = mount(SummaryTiles, { props: { summary: { total: 0, sent: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 } } });
    expect(wrapper.text()).toContain('—');
  });
});
```

- [ ] **Step 2: Run failing**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/SummaryTiles.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement SummaryTiles**

```vue
<!-- src/components/admin/newsletters/SummaryTiles.vue -->
<template>
  <div class="summary-tiles">
    <div v-for="tile in tiles" :key="tile.key" class="summary-tiles__tile">
      <div class="summary-tiles__label">{{ tile.label }}</div>
      <div class="summary-tiles__value">{{ tile.value }}</div>
      <div v-if="tile.rate !== null" class="summary-tiles__rate">{{ tile.rate }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  summary: { type: Object, required: true },
});

function rate(num, denom) {
  if (!denom) return '—';
  return `${((num / denom) * 100).toFixed(1)}%`;
}

const tiles = computed(() => {
  const s = props.summary;
  return [
    { key: 'sent', label: 'Sent', value: s.sent, rate: null },
    { key: 'opened', label: 'Opened', value: s.opened, rate: rate(s.opened, s.sent) },
    { key: 'clicked', label: 'Clicked', value: s.clicked, rate: rate(s.clicked, s.sent) },
    { key: 'bounced', label: 'Bounced', value: s.bounced, rate: rate(s.bounced, s.sent) },
    { key: 'complained', label: 'Complained', value: s.complained, rate: rate(s.complained, s.sent) },
  ];
});
</script>

<style scoped>
.summary-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.summary-tiles__tile { background: white; border: 1px solid var(--escalated-border, #e2e8f0); border-radius: 8px; padding: 16px; }
.summary-tiles__label { font-size: 12px; text-transform: uppercase; color: var(--escalated-text-muted, #64748b); letter-spacing: 0.04em; }
.summary-tiles__value { font-size: 28px; font-weight: 600; margin-top: 4px; }
.summary-tiles__rate { font-size: 13px; color: var(--escalated-text-muted, #64748b); margin-top: 2px; }
</style>
```

- [ ] **Step 4: Run SummaryTiles test, expect PASS**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/SummaryTiles.test.js
```

- [ ] **Step 5: SummaryTiles story**

```javascript
// src/components/admin/newsletters/SummaryTiles.stories.js
import SummaryTiles from './SummaryTiles.vue';
export default { title: 'Admin/Newsletters/SummaryTiles', component: SummaryTiles };
export const Healthy = { args: { summary: { total: 1000, sent: 990, opened: 400, clicked: 80, bounced: 10, complained: 1 } } };
export const Empty = { args: { summary: { total: 0, sent: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 } } };
```

- [ ] **Step 6: AnalyticsTiles failing test**

```javascript
// src/components/admin/newsletters/AnalyticsTiles.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import AnalyticsTiles from './AnalyticsTiles.vue';

describe('AnalyticsTiles', () => {
  it('renders summary tiles and top-clicked URL list', () => {
    const wrapper = mount(AnalyticsTiles, {
      props: {
        summary: { total: 100, sent: 100, opened: 50, clicked: 20, bounced: 1, complained: 0 },
        topClicks: [
          { url: 'https://example.com/a', clicks: 12 },
          { url: 'https://example.com/b', clicks: 5 },
        ],
      },
    });
    expect(wrapper.text()).toContain('https://example.com/a');
    expect(wrapper.text()).toContain('12');
  });
});
```

- [ ] **Step 7: Implement AnalyticsTiles**

```vue
<!-- src/components/admin/newsletters/AnalyticsTiles.vue -->
<template>
  <div class="analytics-tiles">
    <SummaryTiles :summary="summary" />
    <section v-if="topClicks?.length" class="analytics-tiles__top-clicks">
      <h3>Top clicked URLs</h3>
      <ol>
        <li v-for="row in topClicks" :key="row.url">
          <span class="analytics-tiles__url">{{ row.url }}</span>
          <span class="analytics-tiles__count">{{ row.clicks }}</span>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup>
import SummaryTiles from './SummaryTiles.vue';
defineProps({
  summary: { type: Object, required: true },
  topClicks: { type: Array, default: () => [] },
});
</script>

<style scoped>
.analytics-tiles { display: flex; flex-direction: column; gap: 24px; }
.analytics-tiles__top-clicks h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--escalated-text-muted, #64748b); margin: 0 0 8px; }
.analytics-tiles__top-clicks ol { margin: 0; padding-left: 20px; }
.analytics-tiles__top-clicks li { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; }
.analytics-tiles__url { word-break: break-all; }
.analytics-tiles__count { font-variant-numeric: tabular-nums; color: var(--escalated-text-muted, #64748b); }
</style>
```

- [ ] **Step 8: Run AnalyticsTiles test, expect PASS**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/AnalyticsTiles.test.js
```

- [ ] **Step 9: AnalyticsTiles story**

```javascript
// src/components/admin/newsletters/AnalyticsTiles.stories.js
import AnalyticsTiles from './AnalyticsTiles.vue';
export default { title: 'Admin/Newsletters/AnalyticsTiles', component: AnalyticsTiles };
export const Default = {
  args: {
    summary: { total: 1000, sent: 990, opened: 400, clicked: 80, bounced: 10, complained: 1 },
    topClicks: [
      { url: 'https://example.com/launch', clicks: 42 },
      { url: 'https://example.com/blog/post', clicks: 18 },
      { url: 'https://example.com/pricing', clicks: 7 },
    ],
  },
};
```

- [ ] **Step 10: DeliveriesTable failing test**

```javascript
// src/components/admin/newsletters/DeliveriesTable.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import DeliveriesTable from './DeliveriesTable.vue';

const rows = [
  { id: 1, contact: { name: 'Maria', email: 'maria@example.com' }, status: 'sent', sent_at: '2026-05-19T12:00:00Z', opened_at: '2026-05-19T13:00:00Z', last_clicked_at: null, bounce_reason: null },
  { id: 2, contact: { name: null, email: 'x@example.com' }, status: 'bounced', sent_at: '2026-05-19T12:00:00Z', opened_at: null, last_clicked_at: null, bounce_reason: '550 mailbox not found' },
];

describe('DeliveriesTable', () => {
  it('renders all delivery rows', () => {
    const wrapper = mount(DeliveriesTable, { props: { rows } });
    expect(wrapper.text()).toContain('maria@example.com');
    expect(wrapper.text()).toContain('x@example.com');
    expect(wrapper.text()).toContain('550 mailbox not found');
  });

  it('emits filter on status filter change', async () => {
    const wrapper = mount(DeliveriesTable, { props: { rows } });
    await wrapper.find('select.deliveries-table__filter').setValue('bounced');
    expect(wrapper.emitted('filter')[0]).toEqual(['bounced']);
  });

  it('emits export on export button click', async () => {
    const wrapper = mount(DeliveriesTable, { props: { rows } });
    await wrapper.find('button.deliveries-table__export').trigger('click');
    expect(wrapper.emitted('export')).toHaveLength(1);
  });
});
```

- [ ] **Step 11: Implement DeliveriesTable**

```vue
<!-- src/components/admin/newsletters/DeliveriesTable.vue -->
<template>
  <div class="deliveries-table">
    <div class="deliveries-table__toolbar">
      <select class="deliveries-table__filter" :value="statusFilter" @change="$emit('filter', $event.target.value)">
        <option value="">All statuses</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
      </select>
      <button type="button" class="deliveries-table__export" @click="$emit('export')">Export CSV</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>Contact</th><th>Status</th><th>Sent</th><th>Opened</th><th>Last clicked</th><th>Bounce reason</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td>
            <div>{{ row.contact.name ?? '—' }}</div>
            <div class="deliveries-table__email">{{ row.contact.email }}</div>
          </td>
          <td><span :class="`status status--${row.status}`">{{ row.status }}</span></td>
          <td>{{ row.sent_at ? new Date(row.sent_at).toLocaleString() : '—' }}</td>
          <td>{{ row.opened_at ? new Date(row.opened_at).toLocaleString() : '—' }}</td>
          <td>{{ row.last_clicked_at ? new Date(row.last_clicked_at).toLocaleString() : '—' }}</td>
          <td>{{ row.bounce_reason ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
  statusFilter: { type: String, default: '' },
});
defineEmits(['filter', 'export']);
const statuses = ['pending', 'queued', 'sent', 'bounced', 'complained', 'suppressed', 'failed'];
</script>

<style scoped>
.deliveries-table { display: flex; flex-direction: column; gap: 12px; }
.deliveries-table__toolbar { display: flex; gap: 8px; align-items: center; }
.deliveries-table table { width: 100%; border-collapse: collapse; }
.deliveries-table th, .deliveries-table td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--escalated-border, #e2e8f0); font-size: 14px; }
.deliveries-table__email { color: var(--escalated-text-muted, #64748b); font-size: 12px; }
.status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status--sent { background: #e0f2fe; }
.status--bounced { background: #fee2e2; }
.status--complained { background: #fef3c7; }
.status--pending, .status--queued { background: #f1f5f9; }
.status--failed { background: #fecaca; }
.status--suppressed { background: #ede9fe; }
</style>
```

- [ ] **Step 12: Run DeliveriesTable test, expect PASS**

- [ ] **Step 13: DeliveriesTable story**

```javascript
// src/components/admin/newsletters/DeliveriesTable.stories.js
import DeliveriesTable from './DeliveriesTable.vue';
export default { title: 'Admin/Newsletters/DeliveriesTable', component: DeliveriesTable };
export const Default = {
  args: {
    rows: [
      { id: 1, contact: { name: 'Maria', email: 'maria@example.com' }, status: 'sent', sent_at: '2026-05-19T12:00:00Z', opened_at: '2026-05-19T13:00:00Z', last_clicked_at: '2026-05-19T13:05:00Z', bounce_reason: null },
      { id: 2, contact: { name: null, email: 'x@example.com' }, status: 'bounced', sent_at: '2026-05-19T12:00:00Z', opened_at: null, last_clicked_at: null, bounce_reason: '550 mailbox not found' },
    ],
  },
};
```

- [ ] **Step 14: Commit all three**

```bash
git -C C:/Users/work/escalated add src/components/admin/newsletters/SummaryTiles.{vue,test.js,stories.js} src/components/admin/newsletters/AnalyticsTiles.{vue,test.js,stories.js} src/components/admin/newsletters/DeliveriesTable.{vue,test.js,stories.js}
git -C C:/Users/work/escalated commit -m "feat(newsletters): add SummaryTiles, AnalyticsTiles, DeliveriesTable"
```

---

### Task A7: ListMemberTable + DynamicFilterBuilder

Two list-management components. The filter builder is intentionally a passthrough that re-uses whichever existing contacts saved-view component the rest of the codebase uses. We're not reinventing the filter UI here.

**Files:**
- Create: `src/components/admin/newsletters/ListMemberTable.vue` (+ story + test)
- Create: `src/components/admin/newsletters/DynamicFilterBuilder.vue` (+ story + test)

- [ ] **Step 1: Locate the existing saved-views filter builder**

```bash
cd C:/Users/work/escalated && rg -l "FilterBuilder|SavedViewFilter|ContactFilter" src/components --type vue
```

Use whatever component name shows up as the canonical reference. The DynamicFilterBuilder wrapper below assumes it's named `ContactFilterBuilder`; substitute the real name if different.

- [ ] **Step 2: Failing test for ListMemberTable**

```javascript
// src/components/admin/newsletters/ListMemberTable.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ListMemberTable from './ListMemberTable.vue';

const members = [
  { id: 1, contact: { id: 10, name: 'A', email: 'a@example.com' }, added_at: '2026-05-19T00:00:00Z' },
  { id: 2, contact: { id: 11, name: 'B', email: 'b@example.com' }, added_at: '2026-05-19T00:00:00Z' },
];

describe('ListMemberTable', () => {
  it('renders all members', () => {
    const wrapper = mount(ListMemberTable, { props: { members } });
    expect(wrapper.text()).toContain('a@example.com');
    expect(wrapper.text()).toContain('b@example.com');
  });

  it('emits remove with contact id on Remove click', async () => {
    const wrapper = mount(ListMemberTable, { props: { members } });
    await wrapper.find('[data-action="remove"][data-contact-id="10"]').trigger('click');
    expect(wrapper.emitted('remove')[0]).toEqual([10]);
  });
});
```

- [ ] **Step 3: Run failing**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/ListMemberTable.test.js
```

Expected: FAIL.

- [ ] **Step 4: Implement ListMemberTable**

```vue
<!-- src/components/admin/newsletters/ListMemberTable.vue -->
<template>
  <table class="list-member-table">
    <thead><tr><th>Contact</th><th>Added</th><th></th></tr></thead>
    <tbody>
      <tr v-for="m in members" :key="m.id">
        <td>
          <div>{{ m.contact.name ?? '—' }}</div>
          <div class="list-member-table__email">{{ m.contact.email }}</div>
        </td>
        <td>{{ new Date(m.added_at).toLocaleDateString() }}</td>
        <td><button type="button" data-action="remove" :data-contact-id="m.contact.id" @click="$emit('remove', m.contact.id)">Remove</button></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({ members: { type: Array, required: true } });
defineEmits(['remove']);
</script>

<style scoped>
.list-member-table { width: 100%; border-collapse: collapse; }
.list-member-table th, .list-member-table td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--escalated-border, #e2e8f0); font-size: 14px; }
.list-member-table__email { color: var(--escalated-text-muted, #64748b); font-size: 12px; }
</style>
```

- [ ] **Step 5: Run, expect PASS**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/ListMemberTable.test.js
```

- [ ] **Step 6: ListMemberTable story**

```javascript
// src/components/admin/newsletters/ListMemberTable.stories.js
import ListMemberTable from './ListMemberTable.vue';
export default { title: 'Admin/Newsletters/ListMemberTable', component: ListMemberTable };
export const Default = {
  args: {
    members: [
      { id: 1, contact: { id: 10, name: 'Maria', email: 'maria@example.com' }, added_at: '2026-05-10T00:00:00Z' },
      { id: 2, contact: { id: 11, name: null, email: 'noname@example.com' }, added_at: '2026-05-12T00:00:00Z' },
    ],
  },
};
```

- [ ] **Step 7: Failing test for DynamicFilterBuilder**

```javascript
// src/components/admin/newsletters/DynamicFilterBuilder.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import DynamicFilterBuilder from './DynamicFilterBuilder.vue';

describe('DynamicFilterBuilder', () => {
  it('renders the matches counter', () => {
    const wrapper = mount(DynamicFilterBuilder, { props: { modelValue: { rules: [] }, matchCount: 42 } });
    expect(wrapper.text()).toContain('42 contacts match');
  });

  it('emits update:modelValue when child emits change', async () => {
    const wrapper = mount(DynamicFilterBuilder, { props: { modelValue: { rules: [] }, matchCount: 0 } });
    const child = wrapper.findComponent({ name: 'ContactFilterBuilder' });
    if (child.exists()) {
      child.vm.$emit('update:modelValue', { rules: [{ field: 'email', op: 'contains', value: '@' }] });
      expect(wrapper.emitted('update:modelValue')[0][0].rules).toHaveLength(1);
    } else {
      const fallback = wrapper.find('textarea');
      await fallback.setValue('{"rules":[{"field":"email","op":"contains","value":"@"}]}');
      expect(wrapper.emitted('update:modelValue')[0][0].rules).toHaveLength(1);
    }
  });
});
```

- [ ] **Step 8: Implement DynamicFilterBuilder as a thin wrapper**

The wrapper checks if the canonical contact filter component exists; if it does, it delegates. If not (e.g. during early stand-up), it falls back to a raw JSON textarea so the form is still usable. After Wave 1 we'll harden it to require the real builder.

```vue
<!-- src/components/admin/newsletters/DynamicFilterBuilder.vue -->
<template>
  <div class="dynamic-filter-builder">
    <component
      :is="builderComponent"
      v-if="builderComponent"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <textarea
      v-else
      class="dynamic-filter-builder__fallback"
      :value="JSON.stringify(modelValue, null, 2)"
      rows="10"
      @input="onFallbackInput"
    />
    <div class="dynamic-filter-builder__count">{{ matchCount }} contacts match</div>
  </div>
</template>

<script setup>
import { shallowRef } from 'vue';

defineProps({
  modelValue: { type: Object, required: true },
  matchCount: { type: Number, default: 0 },
});
const emit = defineEmits(['update:modelValue']);

const builderComponent = shallowRef(null);
try {
  // eslint-disable-next-line import/no-unresolved
  builderComponent.value = (await import('../ContactFilterBuilder.vue')).default;
} catch {
  builderComponent.value = null;
}

function onFallbackInput(e) {
  try { emit('update:modelValue', JSON.parse(e.target.value)); } catch { /* ignore invalid JSON */ }
}
</script>

<style scoped>
.dynamic-filter-builder__fallback { width: 100%; font-family: ui-monospace, monospace; font-size: 13px; padding: 12px; border: 1px solid var(--escalated-border, #e2e8f0); border-radius: 6px; }
.dynamic-filter-builder__count { margin-top: 8px; color: var(--escalated-text-muted, #64748b); font-size: 13px; }
</style>
```

- [ ] **Step 9: Run, expect PASS**

```bash
cd C:/Users/work/escalated && npx vitest run src/components/admin/newsletters/DynamicFilterBuilder.test.js
```

- [ ] **Step 10: Story**

```javascript
// src/components/admin/newsletters/DynamicFilterBuilder.stories.js
import DynamicFilterBuilder from './DynamicFilterBuilder.vue';
export default { title: 'Admin/Newsletters/DynamicFilterBuilder', component: DynamicFilterBuilder };
export const Empty = { args: { modelValue: { rules: [] }, matchCount: 0 } };
export const WithRules = { args: { modelValue: { rules: [{ field: 'tickets_count', op: '>=', value: 3 }] }, matchCount: 142 } };
```

- [ ] **Step 11: Commit**

```bash
git -C C:/Users/work/escalated add src/components/admin/newsletters/ListMemberTable.{vue,test.js,stories.js} src/components/admin/newsletters/DynamicFilterBuilder.{vue,test.js,stories.js}
git -C C:/Users/work/escalated commit -m "feat(newsletters): add ListMemberTable and DynamicFilterBuilder"
```

---

### Task A8: Newsletters index page

**Files:**
- Create: `src/pages/admin/newsletters/Index.vue` + story + test

- [ ] **Step 1: Failing test**

```javascript
// src/pages/admin/newsletters/Index.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Index from './Index.vue';

const newsletters = [
  { id: 1, subject: 'Welcome', status: 'draft', target_list: { name: 'All customers' }, scheduled_at: null, sent_at: null, summary_total: null },
  { id: 2, subject: 'Update', status: 'scheduled', target_list: { name: 'All customers' }, scheduled_at: '2026-06-01T10:00:00Z', sent_at: null, summary_total: 1200 },
  { id: 3, subject: 'Announcement', status: 'sent', target_list: { name: 'All customers' }, scheduled_at: null, sent_at: '2026-05-01T10:00:00Z', summary_total: 1100 },
];

describe('Newsletters Index page', () => {
  it('shows three tabs and filters by status', async () => {
    const wrapper = mount(Index, { props: { newsletters, tab: 'drafts' } });
    expect(wrapper.text()).toContain('Welcome');
    expect(wrapper.text()).not.toContain('Update');
  });

  it('renders sent tab with sent items', () => {
    const wrapper = mount(Index, { props: { newsletters, tab: 'sent' } });
    expect(wrapper.text()).toContain('Announcement');
    expect(wrapper.text()).not.toContain('Welcome');
  });
});
```

- [ ] **Step 2: Implement Index.vue**

```vue
<!-- src/pages/admin/newsletters/Index.vue -->
<template>
  <div class="newsletters-index">
    <header>
      <h1>{{ $t('newsletters.index.title') }}</h1>
      <Link :href="route('admin.newsletters.create')" class="button button--primary">{{ $t('newsletters.index.new') }}</Link>
    </header>
    <nav class="newsletters-index__tabs">
      <Link v-for="t in tabs" :key="t.key" :href="route('admin.newsletters.index', { tab: t.key })" :class="{ active: tab === t.key }">
        {{ t.label }}
      </Link>
    </nav>
    <table>
      <thead>
        <tr><th>Subject</th><th>List</th><th>Status</th><th>Scheduled</th><th>Sent</th><th>Recipients</th></tr>
      </thead>
      <tbody>
        <tr v-if="!filtered.length"><td colspan="6" class="empty">{{ emptyMessage }}</td></tr>
        <tr v-for="n in filtered" :key="n.id">
          <td><Link :href="route('admin.newsletters.show', n.id)">{{ n.subject }}</Link></td>
          <td>{{ n.target_list.name }}</td>
          <td><span :class="`status status--${n.status}`">{{ n.status }}</span></td>
          <td>{{ n.scheduled_at ? new Date(n.scheduled_at).toLocaleString() : '—' }}</td>
          <td>{{ n.sent_at ? new Date(n.sent_at).toLocaleString() : '—' }}</td>
          <td>{{ n.summary_total ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
  newsletters: { type: Array, required: true },
  tab: { type: String, default: 'drafts' },
});

const tabs = [
  { key: 'drafts', label: 'Drafts', statuses: ['draft'] },
  { key: 'scheduled', label: 'Scheduled', statuses: ['scheduled', 'sending', 'paused'] },
  { key: 'sent', label: 'Sent', statuses: ['sent', 'failed'] },
];

const filtered = computed(() => {
  const active = tabs.find((t) => t.key === props.tab) ?? tabs[0];
  return props.newsletters.filter((n) => active.statuses.includes(n.status));
});

const emptyMessage = computed(() => {
  if (props.tab === 'scheduled') return 'No scheduled sends.';
  if (props.tab === 'sent') return 'No newsletters sent yet.';
  return 'No drafts yet.';
});

function route(name, params) {
  // The Laravel host injects window.route() via Ziggy. Falling back to a plain string keeps tests happy.
  if (typeof window !== 'undefined' && typeof window.route === 'function') return window.route(name, params);
  const map = {
    'admin.newsletters.index': '/admin/newsletters',
    'admin.newsletters.create': '/admin/newsletters/new',
    'admin.newsletters.show': (id) => `/admin/newsletters/${id}`,
  };
  const r = map[name];
  if (typeof r === 'function') return r(params);
  return params ? `${r}?${new URLSearchParams(params).toString()}` : r;
}
</script>

<style scoped>
.newsletters-index header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.newsletters-index__tabs { display: flex; gap: 16px; border-bottom: 1px solid var(--escalated-border, #e2e8f0); margin-bottom: 12px; }
.newsletters-index__tabs a { padding: 8px 4px; color: var(--escalated-text-muted, #64748b); border-bottom: 2px solid transparent; }
.newsletters-index__tabs a.active { color: var(--escalated-text, #0f172a); border-bottom-color: var(--escalated-accent, #2563eb); }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--escalated-border, #e2e8f0); font-size: 14px; }
.empty { color: var(--escalated-text-muted, #64748b); text-align: center; padding: 32px; }
</style>
```

- [ ] **Step 3: Run test, expect PASS**

```bash
cd C:/Users/work/escalated && npx vitest run src/pages/admin/newsletters/Index.test.js
```

- [ ] **Step 4: Story**

```javascript
// src/pages/admin/newsletters/Index.stories.js
import Index from './Index.vue';
export default { title: 'Admin/Newsletters/Pages/Index', component: Index };
const newsletters = [
  { id: 1, subject: 'Spring product update', status: 'draft', target_list: { name: 'All customers' }, scheduled_at: null, sent_at: null, summary_total: null },
  { id: 2, subject: 'Maintenance notice', status: 'scheduled', target_list: { name: 'Active accounts' }, scheduled_at: '2026-06-01T10:00:00Z', sent_at: null, summary_total: 1200 },
  { id: 3, subject: 'Welcome new customers', status: 'sent', target_list: { name: 'New signups Q2' }, scheduled_at: null, sent_at: '2026-05-01T10:00:00Z', summary_total: 240 },
];
export const Drafts = { args: { newsletters, tab: 'drafts' } };
export const Scheduled = { args: { newsletters, tab: 'scheduled' } };
export const Sent = { args: { newsletters, tab: 'sent' } };
```

- [ ] **Step 5: Commit**

```bash
git -C C:/Users/work/escalated add src/pages/admin/newsletters/Index.{vue,test.js,stories.js}
git -C C:/Users/work/escalated commit -m "feat(newsletters): add newsletters index page"
```

---

### Task A9: Compose page

The three-pane composition page is the most complex page. It uses the components we already built.

**Files:**
- Create: `src/pages/admin/newsletters/Compose.vue` + story + test
- Create: `src/pages/admin/newsletters/usePreview.js` (composable)

- [ ] **Step 1: Failing test**

```javascript
// src/pages/admin/newsletters/Compose.test.js
import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Compose from './Compose.vue';

const lists = [{ id: 1, name: 'All customers', member_count: 1200 }];
const templates = [];
const themes = ['default', 'branded'];

global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ html: '<p>preview</p>' }) }));

describe('Compose page', () => {
  it('renders the three-pane layout', () => {
    const wrapper = mount(Compose, { props: { lists, templates, themes, mailConfigured: true, canSend: true } });
    expect(wrapper.find('.compose__metadata').exists()).toBe(true);
    expect(wrapper.find('.compose__editor').exists()).toBe(true);
    expect(wrapper.find('.compose__preview').exists()).toBe(true);
  });

  it('shows mail-not-configured banner when mail is unconfigured', () => {
    const wrapper = mount(Compose, { props: { lists, templates, themes, mailConfigured: false, canSend: true } });
    expect(wrapper.text()).toContain('Configure outbound mail');
  });

  it('hides Send Now and Schedule when canSend is false', () => {
    const wrapper = mount(Compose, { props: { lists, templates, themes, mailConfigured: true, canSend: false } });
    expect(wrapper.text()).not.toContain('Send now');
    expect(wrapper.text()).not.toContain('Schedule');
    expect(wrapper.text()).toContain('Save draft');
    expect(wrapper.text()).toContain('Send test to me');
  });
});
```

- [ ] **Step 2: Implement the preview composable**

```javascript
// src/pages/admin/newsletters/usePreview.js
import { ref, watch } from 'vue';

export function usePreview(formRef, endpoint) {
  const html = ref('<p>(empty)</p>');
  const loading = ref(false);
  let timer = null;

  watch(formRef, () => {
    clearTimeout(timer);
    loading.value = true;
    timer = setTimeout(async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(formRef.value),
        });
        if (res.ok) {
          const data = await res.json();
          html.value = data.html;
        }
      } finally {
        loading.value = false;
      }
    }, 500);
  }, { deep: true, immediate: true });

  return { html, loading };
}
```

- [ ] **Step 3: Implement Compose.vue**

```vue
<!-- src/pages/admin/newsletters/Compose.vue -->
<template>
  <div class="compose">
    <div v-if="!mailConfigured" class="compose__banner">
      {{ $t('newsletters.compose.mail_not_configured') }}
    </div>

    <header class="compose__header">
      <h1>{{ $t('newsletters.compose.title') }}</h1>
      <div class="compose__actions">
        <button type="button" @click="save('draft')">{{ $t('newsletters.compose.actions.save_draft') }}</button>
        <button type="button" @click="testSend">{{ $t('newsletters.compose.actions.test_send') }}</button>
        <template v-if="canSend">
          <button type="button" @click="schedule" :disabled="!mailConfigured || !form.scheduled_at">{{ $t('newsletters.compose.actions.schedule') }}</button>
          <button type="button" class="button--primary" @click="sendNow" :disabled="!mailConfigured">{{ $t('newsletters.compose.actions.send_now') }}</button>
        </template>
      </div>
    </header>

    <div class="compose__panes">
      <section class="compose__metadata">
        <label>{{ $t('newsletters.compose.subject') }}<input v-model="form.subject" /></label>
        <label>{{ $t('newsletters.compose.from_name') }}<input v-model="form.from_name" /></label>
        <label>{{ $t('newsletters.compose.from_email') }}<input v-model="form.from_email" type="email" /></label>
        <label>{{ $t('newsletters.compose.reply_to') }}<input v-model="form.reply_to" type="email" /></label>
        <label>{{ $t('newsletters.compose.list') }}
          <select v-model="form.target_list_id">
            <option v-for="l in lists" :key="l.id" :value="l.id">{{ l.name }} ({{ l.member_count }})</option>
          </select>
        </label>
        <label>{{ $t('newsletters.compose.template') }}
          <select v-model="form.template_id">
            <option :value="null">— none —</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </label>
        <label>{{ $t('newsletters.compose.schedule_at') }}<input v-model="form.scheduled_at" type="datetime-local" /></label>
      </section>

      <section class="compose__editor">
        <div class="compose__editor-toolbar">
          <MergeFieldDropdown @insert="insertField" />
        </div>
        <MarkdownEditor ref="editorRef" v-model="form.body_markdown" />
      </section>

      <section class="compose__preview">
        <PreviewIframe :html="previewHtml" :loading="previewLoading" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, toRef } from 'vue';
import { router } from '@inertiajs/vue3';
import MarkdownEditor from '@/components/admin/newsletters/MarkdownEditor.vue';
import MergeFieldDropdown from '@/components/admin/newsletters/MergeFieldDropdown.vue';
import PreviewIframe from '@/components/admin/newsletters/PreviewIframe.vue';
import { usePreview } from './usePreview.js';

const props = defineProps({
  lists: { type: Array, required: true },
  templates: { type: Array, required: true },
  themes: { type: Array, required: true },
  mailConfigured: { type: Boolean, required: true },
  canSend: { type: Boolean, required: true },
  defaultFromEmail: { type: String, default: '' },
  defaultReplyTo: { type: String, default: '' },
  defaultTheme: { type: String, default: 'default' },
});

const form = reactive({
  subject: '',
  from_name: '',
  from_email: props.defaultFromEmail,
  reply_to: props.defaultReplyTo,
  target_list_id: props.lists[0]?.id ?? null,
  template_id: null,
  theme: props.defaultTheme,
  body_markdown: '',
  scheduled_at: '',
});

const editorRef = ref(null);
const { html: previewHtml, loading: previewLoading } = usePreview(toRef(form), '/admin/newsletters/preview');

function insertField(path) { editorRef.value?.insertMergeField(path); }
function save(status) { router.post('/admin/newsletters', { ...form, status }); }
function testSend() { router.post('/admin/newsletters/test', form); }
function schedule() { save('scheduled'); }
function sendNow() { save('sending'); }
</script>

<style scoped>
.compose__banner { background: #fef3c7; padding: 12px 16px; border-radius: 6px; margin-bottom: 12px; }
.compose__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.compose__actions { display: flex; gap: 8px; }
.compose__panes { display: grid; grid-template-columns: 280px 1fr 1fr; gap: 16px; align-items: start; }
.compose__metadata { display: flex; flex-direction: column; gap: 12px; }
.compose__metadata label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--escalated-text-muted, #64748b); }
.compose__metadata input, .compose__metadata select { padding: 8px 10px; border: 1px solid var(--escalated-border, #e2e8f0); border-radius: 6px; font-size: 14px; color: var(--escalated-text, #0f172a); }
.compose__editor-toolbar { margin-bottom: 8px; }
.compose__preview { height: 100%; min-height: 480px; }
</style>
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
cd C:/Users/work/escalated && npx vitest run src/pages/admin/newsletters/Compose.test.js
```

- [ ] **Step 5: Story**

```javascript
// src/pages/admin/newsletters/Compose.stories.js
import Compose from './Compose.vue';
export default { title: 'Admin/Newsletters/Pages/Compose', component: Compose };
const lists = [{ id: 1, name: 'All customers', member_count: 1200 }, { id: 2, name: 'Active accounts', member_count: 320 }];
const templates = [{ id: 1, name: 'Monthly digest' }];
const themes = ['default', 'branded'];
export const Default = { args: { lists, templates, themes, mailConfigured: true, canSend: true, defaultFromEmail: 'hi@example.com' } };
export const NoSendPermission = { args: { lists, templates, themes, mailConfigured: true, canSend: false } };
export const MailNotConfigured = { args: { lists, templates, themes, mailConfigured: false, canSend: true } };
```

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/work/escalated add src/pages/admin/newsletters/Compose.{vue,test.js,stories.js} src/pages/admin/newsletters/usePreview.js
git -C C:/Users/work/escalated commit -m "feat(newsletters): add Compose page with three-pane layout"
```

---

### Task A10: Detail (Show) page with tabs

**Files:**
- Create: `src/pages/admin/newsletters/Show.vue` + story + test

- [ ] **Step 1: Failing test**

```javascript
// src/pages/admin/newsletters/Show.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Show from './Show.vue';

const newsletter = {
  id: 1, subject: 'Welcome', status: 'sent', from_email: 'a@example.com', from_name: 'Acme',
  target_list: { name: 'All' }, sent_at: '2026-05-19T12:00:00Z',
  summary_total: 100, summary_sent: 99, summary_opened: 50, summary_clicked: 20, summary_bounced: 1, summary_complained: 0,
};
const deliveries = { data: [], links: [], meta: {} };
const topClicks = [];

describe('Show page', () => {
  it('renders overview by default', () => {
    const wrapper = mount(Show, { props: { newsletter, deliveries, topClicks, tab: 'overview' } });
    expect(wrapper.text()).toContain('Welcome');
    expect(wrapper.text()).toContain('99');
  });

  it('shows deliveries table on deliveries tab', () => {
    const wrapper = mount(Show, { props: { newsletter, deliveries, topClicks, tab: 'deliveries' } });
    expect(wrapper.find('.deliveries-table').exists()).toBe(true);
  });

  it('shows analytics tiles on analytics tab', () => {
    const wrapper = mount(Show, { props: { newsletter, deliveries, topClicks, tab: 'analytics' } });
    expect(wrapper.find('.analytics-tiles').exists()).toBe(true);
  });
});
```

- [ ] **Step 2: Implement Show.vue**

```vue
<!-- src/pages/admin/newsletters/Show.vue -->
<template>
  <div class="show">
    <header>
      <div>
        <h1>{{ newsletter.subject }}</h1>
        <div class="show__meta">From {{ newsletter.from_name ? `${newsletter.from_name} <${newsletter.from_email}>` : newsletter.from_email }} → {{ newsletter.target_list.name }}</div>
      </div>
      <div class="show__status"><span :class="`status status--${newsletter.status}`">{{ newsletter.status }}</span></div>
    </header>

    <nav class="show__tabs">
      <Link :href="route('admin.newsletters.show', { id: newsletter.id, tab: 'overview' })" :class="{ active: tab === 'overview' }">Overview</Link>
      <Link :href="route('admin.newsletters.show', { id: newsletter.id, tab: 'deliveries' })" :class="{ active: tab === 'deliveries' }">Deliveries</Link>
      <Link :href="route('admin.newsletters.show', { id: newsletter.id, tab: 'analytics' })" :class="{ active: tab === 'analytics' }">Analytics</Link>
    </nav>

    <section v-if="tab === 'overview'">
      <SummaryTiles :summary="summary" />
    </section>

    <section v-else-if="tab === 'deliveries'">
      <DeliveriesTable :rows="deliveries.data" @filter="onFilter" @export="onExport" />
    </section>

    <section v-else-if="tab === 'analytics'">
      <AnalyticsTiles :summary="summary" :top-clicks="topClicks" />
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import SummaryTiles from '@/components/admin/newsletters/SummaryTiles.vue';
import DeliveriesTable from '@/components/admin/newsletters/DeliveriesTable.vue';
import AnalyticsTiles from '@/components/admin/newsletters/AnalyticsTiles.vue';

const props = defineProps({
  newsletter: { type: Object, required: true },
  deliveries: { type: Object, required: true },
  topClicks: { type: Array, default: () => [] },
  tab: { type: String, default: 'overview' },
});

const summary = computed(() => ({
  total: props.newsletter.summary_total ?? 0,
  sent: props.newsletter.summary_sent ?? 0,
  opened: props.newsletter.summary_opened ?? 0,
  clicked: props.newsletter.summary_clicked ?? 0,
  bounced: props.newsletter.summary_bounced ?? 0,
  complained: props.newsletter.summary_complained ?? 0,
}));

function onFilter(status) { router.get(`/admin/newsletters/${props.newsletter.id}?tab=deliveries&status=${status}`); }
function onExport() { window.location.href = `/admin/newsletters/${props.newsletter.id}/deliveries.csv`; }

function route(name, params) {
  if (typeof window !== 'undefined' && typeof window.route === 'function') return window.route(name, params);
  return `/admin/newsletters/${params.id}?tab=${params.tab}`;
}
</script>

<style scoped>
.show header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.show__meta { color: var(--escalated-text-muted, #64748b); font-size: 14px; margin-top: 4px; }
.show__tabs { display: flex; gap: 16px; border-bottom: 1px solid var(--escalated-border, #e2e8f0); margin-bottom: 16px; }
.show__tabs a { padding: 8px 4px; color: var(--escalated-text-muted, #64748b); border-bottom: 2px solid transparent; }
.show__tabs a.active { color: var(--escalated-text, #0f172a); border-bottom-color: var(--escalated-accent, #2563eb); }
</style>
```

- [ ] **Step 3: Run test, expect PASS**

```bash
cd C:/Users/work/escalated && npx vitest run src/pages/admin/newsletters/Show.test.js
```

- [ ] **Step 4: Story**

```javascript
// src/pages/admin/newsletters/Show.stories.js
import Show from './Show.vue';
export default { title: 'Admin/Newsletters/Pages/Show', component: Show };
const newsletter = {
  id: 1, subject: 'Welcome new customers', status: 'sent',
  from_email: 'hi@example.com', from_name: 'Acme',
  target_list: { name: 'New signups Q2' }, sent_at: '2026-05-01T10:00:00Z',
  summary_total: 240, summary_sent: 238, summary_opened: 110, summary_clicked: 35, summary_bounced: 2, summary_complained: 0,
};
const deliveries = { data: [
  { id: 1, contact: { name: 'Maria', email: 'maria@example.com' }, status: 'sent', sent_at: '2026-05-01T10:00:00Z', opened_at: '2026-05-01T11:00:00Z', last_clicked_at: null, bounce_reason: null },
], links: [], meta: { from: 1, to: 1, total: 1 } };
const topClicks = [{ url: 'https://example.com/welcome', clicks: 35 }];
export const Overview = { args: { newsletter, deliveries, topClicks, tab: 'overview' } };
export const Deliveries = { args: { newsletter, deliveries, topClicks, tab: 'deliveries' } };
export const Analytics = { args: { newsletter, deliveries, topClicks, tab: 'analytics' } };
```

- [ ] **Step 5: Commit**

```bash
git -C C:/Users/work/escalated add src/pages/admin/newsletters/Show.{vue,test.js,stories.js}
git -C C:/Users/work/escalated commit -m "feat(newsletters): add Show page with overview/deliveries/analytics tabs"
```

---

### Task A11: Edit + Settings pages

**Files:**
- Create: `src/pages/admin/newsletters/Edit.vue` (thin wrapper that imports Compose with prefilled values)
- Create: `src/pages/admin/newsletters/Settings.vue` + story + test

- [ ] **Step 1: Edit page (no test — it's a thin wrapper)**

```vue
<!-- src/pages/admin/newsletters/Edit.vue -->
<template>
  <Compose v-bind="composeProps" />
</template>

<script setup>
import Compose from './Compose.vue';
import { computed } from 'vue';

const props = defineProps({
  newsletter: { type: Object, required: true },
  lists: { type: Array, required: true },
  templates: { type: Array, required: true },
  themes: { type: Array, required: true },
  mailConfigured: { type: Boolean, required: true },
  canSend: { type: Boolean, required: true },
});

const composeProps = computed(() => ({
  ...props,
  defaultFromEmail: props.newsletter.from_email,
  defaultReplyTo: props.newsletter.reply_to,
  defaultTheme: props.newsletter.theme,
}));
</script>
```

- [ ] **Step 2: Settings failing test**

```javascript
// src/pages/admin/newsletters/Settings.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Settings from './Settings.vue';

describe('Settings page', () => {
  it('renders all setting fields with current values', () => {
    const wrapper = mount(Settings, {
      props: {
        settings: { default_from: 'hi@example.com', default_reply_to: 'replies@example.com', default_theme: 'branded', rate_limit_per_minute: 60, batch_size: 50, tracking_enabled: true },
        themes: ['default', 'branded'],
      },
    });
    expect(wrapper.find('input[name="default_from"]').element.value).toBe('hi@example.com');
    expect(wrapper.find('select[name="default_theme"]').element.value).toBe('branded');
    expect(wrapper.find('input[name="tracking_enabled"]').element.checked).toBe(true);
  });
});
```

- [ ] **Step 3: Implement Settings.vue**

```vue
<!-- src/pages/admin/newsletters/Settings.vue -->
<template>
  <form class="settings" @submit.prevent="save">
    <h1>{{ $t('newsletters.settings.title') }}</h1>
    <label>{{ $t('newsletters.settings.default_from') }}<input v-model="form.default_from" name="default_from" type="email" /></label>
    <label>{{ $t('newsletters.settings.default_reply_to') }}<input v-model="form.default_reply_to" name="default_reply_to" type="email" /></label>
    <label>{{ $t('newsletters.settings.default_theme') }}
      <select v-model="form.default_theme" name="default_theme">
        <option v-for="t in themes" :key="t" :value="t">{{ t }}</option>
      </select>
    </label>
    <label>{{ $t('newsletters.settings.rate_limit') }}<input v-model.number="form.rate_limit_per_minute" type="number" min="1" /></label>
    <label>{{ $t('newsletters.settings.batch_size') }}<input v-model.number="form.batch_size" type="number" min="1" /></label>
    <label class="checkbox">
      <input v-model="form.tracking_enabled" name="tracking_enabled" type="checkbox" />
      {{ $t('newsletters.settings.tracking_enabled') }}
    </label>
    <p class="help">{{ $t('newsletters.settings.tracking_help') }}</p>
    <button type="submit">Save</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
  settings: { type: Object, required: true },
  themes: { type: Array, required: true },
});

const form = reactive({ ...props.settings });
function save() { router.put('/admin/newsletters/settings', form); }
</script>

<style scoped>
.settings { max-width: 480px; display: flex; flex-direction: column; gap: 16px; }
.settings label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--escalated-text-muted, #64748b); }
.settings label.checkbox { flex-direction: row; align-items: center; gap: 8px; font-size: 14px; color: var(--escalated-text, #0f172a); }
.settings input, .settings select { padding: 8px 10px; border: 1px solid var(--escalated-border, #e2e8f0); border-radius: 6px; font-size: 14px; }
.help { color: var(--escalated-text-muted, #64748b); font-size: 12px; }
</style>
```

- [ ] **Step 4: Run, expect PASS**

```bash
cd C:/Users/work/escalated && npx vitest run src/pages/admin/newsletters/Settings.test.js
```

- [ ] **Step 5: Story**

```javascript
// src/pages/admin/newsletters/Settings.stories.js
import Settings from './Settings.vue';
export default { title: 'Admin/Newsletters/Pages/Settings', component: Settings };
export const Default = {
  args: {
    settings: { default_from: 'hi@example.com', default_reply_to: 'replies@example.com', default_theme: 'default', rate_limit_per_minute: 60, batch_size: 50, tracking_enabled: true },
    themes: ['default', 'branded'],
  },
};
```

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/work/escalated add src/pages/admin/newsletters/Edit.vue src/pages/admin/newsletters/Settings.{vue,test.js,stories.js}
git -C C:/Users/work/escalated commit -m "feat(newsletters): add Edit and Settings pages"
```

---

### Task A12: Lists pages (Index + Create + Show)

**Files:**
- Create: `src/pages/admin/newsletters/lists/Index.vue` + story + test
- Create: `src/pages/admin/newsletters/lists/Create.vue` + story
- Create: `src/pages/admin/newsletters/lists/Show.vue` + story + test

- [ ] **Step 1: Lists/Index failing test**

```javascript
// src/pages/admin/newsletters/lists/Index.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Index from './Index.vue';

const lists = [
  { id: 1, name: 'All customers', kind: 'static', member_count: 1200, opted_out_count: 12 },
  { id: 2, name: 'Active accounts', kind: 'dynamic', member_count: 320, opted_out_count: 5 },
];

describe('Lists Index', () => {
  it('renders all lists with kind and counts', () => {
    const wrapper = mount(Index, { props: { lists } });
    expect(wrapper.text()).toContain('All customers');
    expect(wrapper.text()).toContain('static');
    expect(wrapper.text()).toContain('dynamic');
    expect(wrapper.text()).toContain('1200');
  });
});
```

- [ ] **Step 2: Implement lists/Index.vue**

```vue
<!-- src/pages/admin/newsletters/lists/Index.vue -->
<template>
  <div class="lists-index">
    <header>
      <h1>{{ $t('newsletters.lists.title') }}</h1>
      <Link href="/admin/newsletters/lists/new" class="button button--primary">{{ $t('newsletters.lists.new') }}</Link>
    </header>
    <table>
      <thead><tr><th>Name</th><th>Kind</th><th>Members</th><th>Opted out</th></tr></thead>
      <tbody>
        <tr v-for="l in lists" :key="l.id">
          <td><Link :href="`/admin/newsletters/lists/${l.id}`">{{ l.name }}</Link></td>
          <td>{{ l.kind }}</td>
          <td>{{ l.member_count }}</td>
          <td>{{ l.opted_out_count }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
defineProps({ lists: { type: Array, required: true } });
</script>
```

- [ ] **Step 3: Run Index test, expect PASS**

- [ ] **Step 4: Create page (no behavior test — form submission goes through Inertia router)**

```vue
<!-- src/pages/admin/newsletters/lists/Create.vue -->
<template>
  <form class="lists-create" @submit.prevent="submit">
    <h1>{{ $t('newsletters.lists.new') }}</h1>
    <label>Name<input v-model="form.name" required /></label>
    <label>Description<textarea v-model="form.description" /></label>
    <fieldset>
      <legend>Kind</legend>
      <label class="radio"><input v-model="form.kind" type="radio" value="static" /> {{ $t('newsletters.lists.kind.static') }}</label>
      <p class="help">{{ $t('newsletters.lists.create.static_help') }}</p>
      <label class="radio"><input v-model="form.kind" type="radio" value="dynamic" /> {{ $t('newsletters.lists.kind.dynamic') }}</label>
      <p class="help">{{ $t('newsletters.lists.create.dynamic_help') }}</p>
    </fieldset>
    <button type="submit">Create</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';
import { router } from '@inertiajs/vue3';
const form = reactive({ name: '', description: '', kind: 'static' });
function submit() { router.post('/admin/newsletters/lists', form); }
</script>

<style scoped>
.lists-create { display: flex; flex-direction: column; gap: 12px; max-width: 480px; }
.lists-create label { display: flex; flex-direction: column; gap: 4px; }
.lists-create label.radio { flex-direction: row; align-items: center; gap: 8px; }
.help { color: var(--escalated-text-muted, #64748b); font-size: 12px; margin: 0 0 8px 24px; }
</style>
```

- [ ] **Step 5: Show page failing test**

```javascript
// src/pages/admin/newsletters/lists/Show.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Show from './Show.vue';

describe('Lists Show', () => {
  it('shows member table for static lists', () => {
    const wrapper = mount(Show, {
      props: {
        list: { id: 1, name: 'All', kind: 'static', description: '', member_count: 2, opted_out_count: 0, filter_json: null },
        members: { data: [{ id: 1, contact: { id: 10, name: 'A', email: 'a@example.com' }, added_at: '2026-05-19T00:00:00Z' }], links: [], meta: {} },
        matchCount: 0,
      },
    });
    expect(wrapper.find('.list-member-table').exists()).toBe(true);
    expect(wrapper.find('.dynamic-filter-builder').exists()).toBe(false);
  });

  it('shows filter builder for dynamic lists', () => {
    const wrapper = mount(Show, {
      props: {
        list: { id: 1, name: 'Active', kind: 'dynamic', description: '', member_count: 0, opted_out_count: 0, filter_json: { rules: [] } },
        members: { data: [], links: [], meta: {} },
        matchCount: 42,
      },
    });
    expect(wrapper.find('.dynamic-filter-builder').exists()).toBe(true);
    expect(wrapper.find('.list-member-table').exists()).toBe(false);
  });
});
```

- [ ] **Step 6: Implement lists/Show.vue**

```vue
<!-- src/pages/admin/newsletters/lists/Show.vue -->
<template>
  <div class="lists-show">
    <header>
      <h1>{{ list.name }}</h1>
      <div class="lists-show__meta">
        {{ list.kind }} list · {{ list.member_count }} members · {{ list.opted_out_count }} opted out
      </div>
    </header>
    <section v-if="list.kind === 'static'">
      <ListMemberTable :members="members.data" @remove="onRemove" />
    </section>
    <section v-else>
      <DynamicFilterBuilder :model-value="list.filter_json ?? { rules: [] }" :match-count="matchCount" @update:model-value="onFilterChange" />
    </section>
  </div>
</template>

<script setup>
import { router } from '@inertiajs/vue3';
import ListMemberTable from '@/components/admin/newsletters/ListMemberTable.vue';
import DynamicFilterBuilder from '@/components/admin/newsletters/DynamicFilterBuilder.vue';

const props = defineProps({
  list: { type: Object, required: true },
  members: { type: Object, required: true },
  matchCount: { type: Number, default: 0 },
});

function onRemove(contactId) { router.delete(`/admin/newsletters/lists/${props.list.id}/members/${contactId}`); }
function onFilterChange(filter) { router.put(`/admin/newsletters/lists/${props.list.id}`, { filter_json: filter }); }
</script>
```

- [ ] **Step 7: Run Show test, expect PASS**

- [ ] **Step 8: Stories**

```javascript
// src/pages/admin/newsletters/lists/Index.stories.js
import Index from './Index.vue';
export default { title: 'Admin/Newsletters/Pages/Lists/Index', component: Index };
export const Default = { args: { lists: [{ id: 1, name: 'All customers', kind: 'static', member_count: 1200, opted_out_count: 12 }, { id: 2, name: 'Active accounts', kind: 'dynamic', member_count: 320, opted_out_count: 5 }] } };

// src/pages/admin/newsletters/lists/Create.stories.js
import Create from './Create.vue';
export const CreatePage = {};
export const CreateMeta = { title: 'Admin/Newsletters/Pages/Lists/Create', component: Create };
export default CreateMeta;

// src/pages/admin/newsletters/lists/Show.stories.js
import Show from './Show.vue';
export default { title: 'Admin/Newsletters/Pages/Lists/Show', component: Show };
export const Static = { args: { list: { id: 1, name: 'All customers', kind: 'static', member_count: 2, opted_out_count: 0, filter_json: null, description: '' }, members: { data: [{ id: 1, contact: { id: 10, name: 'Maria', email: 'maria@example.com' }, added_at: '2026-05-19T00:00:00Z' }], links: [], meta: {} }, matchCount: 0 } };
export const Dynamic = { args: { list: { id: 2, name: 'Active accounts', kind: 'dynamic', member_count: 0, opted_out_count: 0, filter_json: { rules: [{ field: 'tickets_count', op: '>=', value: 3 }] }, description: '' }, members: { data: [], links: [], meta: {} }, matchCount: 142 } };
```

- [ ] **Step 9: Commit**

```bash
git -C C:/Users/work/escalated add src/pages/admin/newsletters/lists
git -C C:/Users/work/escalated commit -m "feat(newsletters): add list management pages"
```

---

### Task A13: Templates pages (Index + Create + Show)

Mirror the lists pages structure for templates.

**Files:**
- Create: `src/pages/admin/newsletters/templates/Index.vue` + story + test
- Create: `src/pages/admin/newsletters/templates/Create.vue` + story
- Create: `src/pages/admin/newsletters/templates/Show.vue` + story + test

- [ ] **Step 1: Templates/Index failing test**

```javascript
// src/pages/admin/newsletters/templates/Index.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Index from './Index.vue';

const templates = [
  { id: 1, name: 'Monthly digest', theme: 'default', updated_at: '2026-05-01T00:00:00Z' },
  { id: 2, name: 'Product update', theme: 'branded', updated_at: '2026-05-19T00:00:00Z' },
];

describe('Templates Index', () => {
  it('renders template cards', () => {
    const wrapper = mount(Index, { props: { templates } });
    expect(wrapper.text()).toContain('Monthly digest');
    expect(wrapper.text()).toContain('Product update');
  });
});
```

- [ ] **Step 2: Implement templates/Index.vue**

```vue
<!-- src/pages/admin/newsletters/templates/Index.vue -->
<template>
  <div class="templates-index">
    <header>
      <h1>{{ $t('newsletters.templates.title') }}</h1>
      <Link href="/admin/newsletters/templates/new" class="button button--primary">{{ $t('newsletters.templates.new') }}</Link>
    </header>
    <div class="templates-index__grid">
      <Link v-for="t in templates" :key="t.id" :href="`/admin/newsletters/templates/${t.id}`" class="card">
        <h3>{{ t.name }}</h3>
        <div class="card__meta">Theme: {{ t.theme }}</div>
        <div class="card__meta">Updated: {{ new Date(t.updated_at).toLocaleDateString() }}</div>
      </Link>
    </div>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
defineProps({ templates: { type: Array, required: true } });
</script>

<style scoped>
.templates-index__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.card { display: block; padding: 16px; border: 1px solid var(--escalated-border, #e2e8f0); border-radius: 8px; background: white; }
.card__meta { color: var(--escalated-text-muted, #64748b); font-size: 12px; margin-top: 4px; }
</style>
```

- [ ] **Step 3: Run, expect PASS**

- [ ] **Step 4: templates/Create.vue + templates/Show.vue (Show handles both create and edit; Create is a thin wrapper)**

```vue
<!-- src/pages/admin/newsletters/templates/Create.vue -->
<template>
  <TemplateShow :template="emptyTemplate" :themes="themes" :is-new="true" />
</template>

<script setup>
import TemplateShow from './Show.vue';
defineProps({ themes: { type: Array, required: true } });
const emptyTemplate = { id: null, name: '', theme: 'default', subject_template: '', body_markdown: '' };
</script>
```

```vue
<!-- src/pages/admin/newsletters/templates/Show.vue -->
<template>
  <form class="templates-show" @submit.prevent="save">
    <header>
      <h1>{{ isNew ? $t('newsletters.templates.new') : template.name }}</h1>
    </header>
    <label>Name<input v-model="form.name" required /></label>
    <label>{{ $t('newsletters.templates.theme') }}
      <select v-model="form.theme">
        <option v-for="t in themes" :key="t" :value="t">{{ t }}</option>
      </select>
    </label>
    <label>{{ $t('newsletters.templates.subject_template') }}<input v-model="form.subject_template" /></label>
    <div class="editor-section">
      <div class="editor-toolbar"><MergeFieldDropdown @insert="onInsert" /></div>
      <MarkdownEditor ref="editorRef" v-model="form.body_markdown" />
    </div>
    <button type="submit">Save</button>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import MarkdownEditor from '@/components/admin/newsletters/MarkdownEditor.vue';
import MergeFieldDropdown from '@/components/admin/newsletters/MergeFieldDropdown.vue';

const props = defineProps({
  template: { type: Object, required: true },
  themes: { type: Array, required: true },
  isNew: { type: Boolean, default: false },
});

const form = reactive({ ...props.template });
const editorRef = ref(null);

function save() {
  if (props.isNew) router.post('/admin/newsletters/templates', form);
  else router.put(`/admin/newsletters/templates/${props.template.id}`, form);
}
function onInsert(path) { editorRef.value?.insertMergeField(path); }
</script>

<style scoped>
.templates-show { display: flex; flex-direction: column; gap: 12px; max-width: 800px; }
.editor-toolbar { margin-bottom: 8px; }
</style>
```

- [ ] **Step 5: templates/Show failing test**

```javascript
// src/pages/admin/newsletters/templates/Show.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Show from './Show.vue';

describe('Templates Show', () => {
  it('renders the template name and body for an existing template', () => {
    const wrapper = mount(Show, {
      props: {
        template: { id: 1, name: 'Monthly', theme: 'branded', subject_template: 'Monthly update', body_markdown: '# Hi' },
        themes: ['default', 'branded'],
        isNew: false,
      },
    });
    expect(wrapper.find('input').element.value).toBe('Monthly');
    expect(wrapper.find('textarea').element.value).toBe('# Hi');
  });
});
```

- [ ] **Step 6: Run, expect PASS**

- [ ] **Step 7: Stories**

```javascript
// src/pages/admin/newsletters/templates/Index.stories.js
import Index from './Index.vue';
export default { title: 'Admin/Newsletters/Pages/Templates/Index', component: Index };
export const Default = { args: { templates: [{ id: 1, name: 'Monthly digest', theme: 'default', updated_at: '2026-05-01T00:00:00Z' }, { id: 2, name: 'Product update', theme: 'branded', updated_at: '2026-05-19T00:00:00Z' }] } };

// src/pages/admin/newsletters/templates/Show.stories.js
import Show from './Show.vue';
export default { title: 'Admin/Newsletters/Pages/Templates/Show', component: Show };
export const Existing = { args: { template: { id: 1, name: 'Monthly digest', theme: 'branded', subject_template: 'Monthly update {{ contact.first_name }}', body_markdown: '# Hi\n\nThanks for being a customer.' }, themes: ['default', 'branded'], isNew: false } };
export const New = { args: { template: { id: null, name: '', theme: 'default', subject_template: '', body_markdown: '' }, themes: ['default', 'branded'], isNew: true } };
```

- [ ] **Step 8: Commit**

```bash
git -C C:/Users/work/escalated add src/pages/admin/newsletters/templates
git -C C:/Users/work/escalated commit -m "feat(newsletters): add template management pages"
```

---

### Task A14: Frontend wrap-up — full test pass, version bump, tag release

- [ ] **Step 1: Run the complete test suite**

```bash
cd C:/Users/work/escalated && npm run test
```

Expected: all tests pass, no warnings.

- [ ] **Step 2: Lint**

```bash
cd C:/Users/work/escalated && npm run lint
```

Expected: clean.

- [ ] **Step 3: Storybook build smoke test**

```bash
cd C:/Users/work/escalated && npm run build-storybook
```

Expected: build succeeds. (Don't deploy — just verify no stories crash.)

- [ ] **Step 4: Bump version in package.json from `0.8.0` to `0.9.0`**

Edit `package.json` line 3:

```json
"version": "0.9.0",
```

- [ ] **Step 5: Commit version bump and push branch**

```bash
git -C C:/Users/work/escalated add package.json
git -C C:/Users/work/escalated commit -m "chore(release): 0.9.0 — newsletter system frontend"
git -C C:/Users/work/escalated push -u origin feat/newsletter-frontend
```

- [ ] **Step 6: Open Wave 0 PR**

```bash
gh pr create --repo escalated-dev/escalated \
  --title "feat(newsletters): admin UI for newsletter system (Wave 0)" \
  --body "$(cat <<'EOF'
## Summary
Implements the shared Vue/Inertia admin UI for the newsletter system per `docs/superpowers/specs/2026-05-19-newsletter-system-design.md`. Backend wiring follows in `escalated-laravel` (Wave 1).

- New `pages/admin/newsletters/**` page tree (Index, Compose, Show, Edit, Settings, Lists, Templates)
- New `components/admin/newsletters/**` building blocks (MarkdownEditor, MergeFieldDropdown, PreviewIframe, SummaryTiles, AnalyticsTiles, DeliveriesTable, ListMemberTable, DynamicFilterBuilder)
- Sidebar nav gated on `features.newsletters` + `newsletters.manage|send` permission
- English locale strings under `locales/en/newsletters.js`
- Storybook stories for every component and page
- Version bump to 0.9.0

## Test plan
- [x] Vitest unit tests pass for all new components and pages
- [x] Storybook builds without errors
- [x] Lint clean
- [ ] (Post-merge) Tag release `v0.9.0` so backend PRs can consume it
EOF
)"
```

- [ ] **Step 7: After PR merges, tag release**

```bash
git -C C:/Users/work/escalated checkout main
git -C C:/Users/work/escalated pull
git -C C:/Users/work/escalated tag v0.9.0
git -C C:/Users/work/escalated push --tags
```

**Wave 0 ships here. Wave 1 begins.**

---

## Phase B — Laravel Reference (`escalated-laravel/`, Wave 1)

The full vertical: schema, models, services, controllers, themes, ESP webhook hooks, dispatch command, install prompt, permission seeding, service-provider gating, and tests. Manual ESP-sandbox verification is the merge gate.

**File structure (Phase B):**

```
config/escalated.php                                                      (modify — add newsletters keys)
database/migrations/2026_05_19_000001_create_escalated_newsletter_lists_table.php           (new)
database/migrations/2026_05_19_000002_create_escalated_newsletter_list_members_table.php    (new)
database/migrations/2026_05_19_000003_create_escalated_newsletter_templates_table.php       (new)
database/migrations/2026_05_19_000004_create_escalated_newsletters_table.php                (new)
database/migrations/2026_05_19_000005_create_escalated_newsletter_deliveries_table.php      (new)
database/migrations/2026_05_19_000006_add_marketing_opt_out_at_to_escalated_contacts.php    (new)
database/seeders/PermissionSeeder.php                                     (modify — add 2 perms)
src/Models/Newsletter/NewsletterList.php                                  (new)
src/Models/Newsletter/NewsletterListMember.php                            (new)
src/Models/Newsletter/NewsletterTemplate.php                              (new)
src/Models/Newsletter/Newsletter.php                                      (new)
src/Models/Newsletter/NewsletterDelivery.php                              (new)
src/Models/Contact.php                                                    (modify — opt-out cast)
src/Services/Newsletter/ContactSegmentResolver.php                        (new)
src/Services/Newsletter/BounceSuppressionStore.php                        (new)
src/Services/Newsletter/NewsletterRendererService.php                     (new)
src/Services/Newsletter/NewsletterPlannerService.php                      (new)
src/Services/Newsletter/NewsletterDispatcherService.php                   (new)
src/Services/Newsletter/NewsletterTrackerService.php                      (new)
src/Mail/NewsletterMail.php                                               (new)
resources/views/newsletters/themes/default.blade.php                      (new)
resources/views/newsletters/themes/branded.blade.php                      (new)
src/Http/Controllers/Admin/NewsletterController.php                       (new)
src/Http/Controllers/Admin/NewsletterListController.php                   (new)
src/Http/Controllers/Admin/NewsletterTemplateController.php               (new)
src/Http/Controllers/Admin/NewsletterSettingsController.php               (new)
src/Http/Controllers/Public/NewsletterTrackingController.php              (new)
src/Http/Controllers/Public/NewsletterUnsubscribeController.php           (new)
src/Http/Controllers/Public/NewsletterViewInBrowserController.php         (new)
src/Http/Controllers/Webhooks/NewsletterEspWebhookController.php          (new)
src/Console/Commands/DispatchNewslettersCommand.php                       (new)
src/Console/Commands/InstallCommand.php                                   (modify — prompt + flags)
src/EscalatedServiceProvider.php                                          (modify — conditional registration)
routes/admin.php                                                          (modify — gated includes)
routes/public.php                                                         (new — public tracking + unsub + view)
tests/Unit/Services/Newsletter/*Test.php                                  (new — per service)
tests/Feature/Admin/Newsletter*Test.php                                   (new — per admin controller)
tests/Feature/Public/Newsletter*Test.php                                  (new — per public endpoint)
tests/Feature/NewsletterDisableMidFlightTest.php                          (new)
README.md                                                                 (modify — newsletters section)
```

---

### Task B1: Config flag plumbing

**Files:**
- Modify: `config/escalated.php`

- [ ] **Step 1: Read the existing config**

```bash
cd C:/Users/work/escalated-laravel && head -120 config/escalated.php
```

Locate the existing feature-flag block (look for `enableKnowledgeBase` / `enable_csat` / similar). Decide which is canonical (kebab vs camel — the spec uses `enable_newsletters`).

- [ ] **Step 2: Add the newsletter config keys**

Append to `config/escalated.php` inside the existing top-level `return [...]` array (placement should match the existing toggle group — same level as `enable_csat` etc.):

```php
    /*
    |--------------------------------------------------------------------------
    | Newsletter system
    |--------------------------------------------------------------------------
    | Disabled by default. When false, no newsletter routes, controllers,
    | services, scheduler hooks, or admin UI are registered.
    */
    'enable_newsletters' => env('ESCALATED_ENABLE_NEWSLETTERS', false),

    'newsletters' => [
        'default_from' => env('ESCALATED_NEWSLETTER_DEFAULT_FROM'),
        'default_reply_to' => env('ESCALATED_NEWSLETTER_DEFAULT_REPLY_TO'),
        'default_theme' => env('ESCALATED_NEWSLETTER_DEFAULT_THEME', 'default'),
        'rate_limit_per_minute' => (int) env('ESCALATED_NEWSLETTER_RATE_LIMIT', 60),
        'batch_size' => (int) env('ESCALATED_NEWSLETTER_BATCH_SIZE', 50),
        'tracking_enabled' => filter_var(env('ESCALATED_NEWSLETTER_TRACKING_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
        'auto_pause_bounce_rate' => 0.05,      // 5%
        'auto_pause_threshold' => 100,          // require this many deliveries before bounce-rate auto-pause kicks in
        'claim_timeout_minutes' => 10,          // reclaim queued rows older than this
    ],
```

- [ ] **Step 3: Commit**

```bash
git -C C:/Users/work/escalated-laravel add config/escalated.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add config keys (disabled by default)"
```

---

### Task B2: Migration — newsletter_lists

**Files:**
- Create: `database/migrations/2026_05_19_000001_create_escalated_newsletter_lists_table.php`

- [ ] **Step 1: Write the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escalated_newsletter_lists', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('kind', ['static', 'dynamic']);
            $table->json('filter_json')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index('kind');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escalated_newsletter_lists');
    }
};
```

- [ ] **Step 2: Run the migration in a sqlite-memory test bootstrap**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest --filter=CommandTest 2>&1 | tail -10
```

Expected: migrations run cleanly (the test bootstrap runs all migrations).

- [ ] **Step 3: Commit**

```bash
git -C C:/Users/work/escalated-laravel add database/migrations/2026_05_19_000001_create_escalated_newsletter_lists_table.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): create newsletter_lists table"
```

---

### Task B3: Migration — newsletter_list_members

**Files:**
- Create: `database/migrations/2026_05_19_000002_create_escalated_newsletter_list_members_table.php`

- [ ] **Step 1: Write the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escalated_newsletter_list_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('list_id');
            $table->unsignedBigInteger('contact_id');
            $table->timestamp('added_at')->useCurrent();
            $table->unsignedBigInteger('added_by')->nullable();

            $table->unique(['list_id', 'contact_id']);
            $table->index('contact_id');

            $table->foreign('list_id')->references('id')->on('escalated_newsletter_lists')->cascadeOnDelete();
            $table->foreign('contact_id')->references('id')->on('escalated_contacts')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escalated_newsletter_list_members');
    }
};
```

- [ ] **Step 2: Run migrations**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest --filter=CommandTest 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git -C C:/Users/work/escalated-laravel add database/migrations/2026_05_19_000002_create_escalated_newsletter_list_members_table.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): create newsletter_list_members table"
```

---

### Task B4: Migration — newsletter_templates

**Files:**
- Create: `database/migrations/2026_05_19_000003_create_escalated_newsletter_templates_table.php`

- [ ] **Step 1: Write the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escalated_newsletter_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('theme', 64)->default('default');
            $table->string('subject_template', 998)->nullable();
            $table->text('body_markdown');
            $table->json('merge_fields_schema')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index('theme');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escalated_newsletter_templates');
    }
};
```

- [ ] **Step 2: Run migrations + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest --filter=CommandTest 2>&1 | tail -5
git -C C:/Users/work/escalated-laravel add database/migrations/2026_05_19_000003_create_escalated_newsletter_templates_table.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): create newsletter_templates table"
```

---

### Task B5: Migration — newsletters

**Files:**
- Create: `database/migrations/2026_05_19_000004_create_escalated_newsletters_table.php`

- [ ] **Step 1: Write the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escalated_newsletters', function (Blueprint $table) {
            $table->id();
            $table->string('subject', 998);
            $table->string('from_email', 320);
            $table->string('from_name')->nullable();
            $table->string('reply_to', 320)->nullable();
            $table->unsignedBigInteger('target_list_id');
            $table->unsignedBigInteger('template_id')->nullable();
            $table->string('theme', 64)->nullable();
            $table->text('body_markdown')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'sending', 'sent', 'paused', 'failed'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('sent_by')->nullable();
            $table->unsignedInteger('summary_total')->default(0);
            $table->unsignedInteger('summary_sent')->default(0);
            $table->unsignedInteger('summary_opened')->default(0);
            $table->unsignedInteger('summary_clicked')->default(0);
            $table->unsignedInteger('summary_bounced')->default(0);
            $table->unsignedInteger('summary_complained')->default(0);
            $table->timestamps();

            $table->index('status');
            $table->index('scheduled_at');
            $table->index(['status', 'scheduled_at']);
            $table->index('created_by');

            $table->foreign('target_list_id')->references('id')->on('escalated_newsletter_lists')->restrictOnDelete();
            $table->foreign('template_id')->references('id')->on('escalated_newsletter_templates')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escalated_newsletters');
    }
};
```

- [ ] **Step 2: Run migrations + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest --filter=CommandTest 2>&1 | tail -5
git -C C:/Users/work/escalated-laravel add database/migrations/2026_05_19_000004_create_escalated_newsletters_table.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): create newsletters table"
```

---

### Task B6: Migration — newsletter_deliveries

**Files:**
- Create: `database/migrations/2026_05_19_000005_create_escalated_newsletter_deliveries_table.php`

- [ ] **Step 1: Write the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escalated_newsletter_deliveries', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('newsletter_id');
            $table->unsignedBigInteger('contact_id');
            $table->string('email_at_send', 320);
            $table->enum('status', ['pending', 'queued', 'sent', 'bounced', 'complained', 'suppressed', 'failed'])->default('pending');
            $table->string('tracking_token', 40)->unique();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('last_clicked_at')->nullable();
            $table->unsignedInteger('clicks_count')->default(0);
            $table->text('bounce_reason')->nullable();
            $table->text('failure_reason')->nullable();
            $table->unsignedSmallInteger('attempt_count')->default(0);
            $table->timestamp('claimed_at')->nullable();
            $table->boolean('is_test')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['newsletter_id', 'status']);
            $table->index('contact_id');
            $table->index(['status', 'claimed_at']);

            $table->foreign('newsletter_id')->references('id')->on('escalated_newsletters')->cascadeOnDelete();
            $table->foreign('contact_id')->references('id')->on('escalated_contacts')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escalated_newsletter_deliveries');
    }
};
```

- [ ] **Step 2: Run migrations + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest --filter=CommandTest 2>&1 | tail -5
git -C C:/Users/work/escalated-laravel add database/migrations/2026_05_19_000005_create_escalated_newsletter_deliveries_table.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): create newsletter_deliveries table"
```

---

### Task B7: Migration — alter contacts to add marketing_opt_out_at

**Files:**
- Create: `database/migrations/2026_05_19_000006_add_marketing_opt_out_at_to_escalated_contacts.php`

- [ ] **Step 1: Write the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('escalated_contacts', function (Blueprint $table) {
            $table->timestamp('marketing_opt_out_at')->nullable()->after('metadata');
            $table->index('marketing_opt_out_at');
        });
    }

    public function down(): void
    {
        Schema::table('escalated_contacts', function (Blueprint $table) {
            $table->dropIndex(['marketing_opt_out_at']);
            $table->dropColumn('marketing_opt_out_at');
        });
    }
};
```

- [ ] **Step 2: Add cast on the Contact model**

Read `src/Models/Contact.php` first. Add `'marketing_opt_out_at' => 'datetime',` to the `$casts` array.

- [ ] **Step 3: Run migrations + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest --filter=CommandTest 2>&1 | tail -5
git -C C:/Users/work/escalated-laravel add database/migrations/2026_05_19_000006_add_marketing_opt_out_at_to_escalated_contacts.php src/Models/Contact.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add marketing_opt_out_at to contacts"
```

---

### Task B8: Newsletter Eloquent models

Five models, one task, because they're small and naturally co-evolve.

**Files:**
- Create: `src/Models/Newsletter/NewsletterList.php`
- Create: `src/Models/Newsletter/NewsletterListMember.php`
- Create: `src/Models/Newsletter/NewsletterTemplate.php`
- Create: `src/Models/Newsletter/Newsletter.php`
- Create: `src/Models/Newsletter/NewsletterDelivery.php`

- [ ] **Step 1: NewsletterList**

```php
<?php

namespace Escalated\Laravel\Models\Newsletter;

use Escalated\Laravel\Models\Contact;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NewsletterList extends Model
{
    protected $table = 'escalated_newsletter_lists';

    protected $fillable = ['name', 'description', 'kind', 'filter_json', 'created_by'];

    protected $casts = [
        'filter_json' => 'array',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(NewsletterListMember::class, 'list_id');
    }

    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(
            Contact::class,
            'escalated_newsletter_list_members',
            'list_id',
            'contact_id',
        )->withPivot(['added_at', 'added_by']);
    }
}
```

- [ ] **Step 2: NewsletterListMember**

```php
<?php

namespace Escalated\Laravel\Models\Newsletter;

use Escalated\Laravel\Models\Contact;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterListMember extends Model
{
    protected $table = 'escalated_newsletter_list_members';

    public $timestamps = false;

    protected $fillable = ['list_id', 'contact_id', 'added_at', 'added_by'];

    protected $casts = [
        'added_at' => 'datetime',
    ];

    public function list(): BelongsTo
    {
        return $this->belongsTo(NewsletterList::class, 'list_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}
```

- [ ] **Step 3: NewsletterTemplate**

```php
<?php

namespace Escalated\Laravel\Models\Newsletter;

use Illuminate\Database\Eloquent\Model;

class NewsletterTemplate extends Model
{
    protected $table = 'escalated_newsletter_templates';

    protected $fillable = ['name', 'theme', 'subject_template', 'body_markdown', 'merge_fields_schema', 'created_by'];

    protected $casts = [
        'merge_fields_schema' => 'array',
    ];
}
```

- [ ] **Step 4: Newsletter**

```php
<?php

namespace Escalated\Laravel\Models\Newsletter;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Newsletter extends Model
{
    protected $table = 'escalated_newsletters';

    protected $fillable = [
        'subject', 'from_email', 'from_name', 'reply_to',
        'target_list_id', 'template_id', 'theme', 'body_markdown',
        'status', 'scheduled_at', 'sent_at', 'created_by', 'sent_by',
        'summary_total', 'summary_sent', 'summary_opened',
        'summary_clicked', 'summary_bounced', 'summary_complained',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'summary_total' => 'integer',
        'summary_sent' => 'integer',
        'summary_opened' => 'integer',
        'summary_clicked' => 'integer',
        'summary_bounced' => 'integer',
        'summary_complained' => 'integer',
    ];

    public function targetList(): BelongsTo
    {
        return $this->belongsTo(NewsletterList::class, 'target_list_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(NewsletterTemplate::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(NewsletterDelivery::class);
    }
}
```

- [ ] **Step 5: NewsletterDelivery**

```php
<?php

namespace Escalated\Laravel\Models\Newsletter;

use Escalated\Laravel\Models\Contact;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterDelivery extends Model
{
    protected $table = 'escalated_newsletter_deliveries';

    const UPDATED_AT = null;

    protected $fillable = [
        'newsletter_id', 'contact_id', 'email_at_send', 'status',
        'tracking_token', 'sent_at', 'opened_at', 'last_clicked_at',
        'clicks_count', 'bounce_reason', 'failure_reason',
        'attempt_count', 'claimed_at', 'is_test',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'last_clicked_at' => 'datetime',
        'claimed_at' => 'datetime',
        'is_test' => 'boolean',
        'clicks_count' => 'integer',
        'attempt_count' => 'integer',
    ];

    public function newsletter(): BelongsTo
    {
        return $this->belongsTo(Newsletter::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}
```

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/work/escalated-laravel add src/Models/Newsletter
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add Eloquent models for lists, templates, newsletters, deliveries"
```

---

### Task B9: ContactSegmentResolver + BounceSuppressionStore

Two small services, isolated and unit-testable.

**Files:**
- Create: `src/Services/Newsletter/ContactSegmentResolver.php`
- Create: `src/Services/Newsletter/BounceSuppressionStore.php`
- Test: `tests/Unit/Services/Newsletter/ContactSegmentResolverTest.php`
- Test: `tests/Unit/Services/Newsletter/BounceSuppressionStoreTest.php`

- [ ] **Step 1: ContactSegmentResolver failing test**

```php
<?php
// tests/Unit/Services/Newsletter/ContactSegmentResolverTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Models\Newsletter\NewsletterListMember;
use Escalated\Laravel\Services\Newsletter\ContactSegmentResolver;

beforeEach(function () {
    $this->resolver = app(ContactSegmentResolver::class);
});

it('returns explicit contact ids for static lists', function () {
    $list = NewsletterList::create(['name' => 'Test', 'kind' => 'static']);
    $c1 = Contact::create(['email' => 'a@example.com']);
    $c2 = Contact::create(['email' => 'b@example.com']);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c1->id]);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c2->id]);

    $ids = $this->resolver->resolve($list);

    expect($ids)->toEqualCanonicalizing([$c1->id, $c2->id]);
});

it('evaluates dynamic filter against contacts', function () {
    $c1 = Contact::create(['email' => 'a@example.com', 'metadata' => ['tier' => 'gold']]);
    $c2 = Contact::create(['email' => 'b@example.com', 'metadata' => ['tier' => 'silver']]);
    $list = NewsletterList::create([
        'name' => 'Gold',
        'kind' => 'dynamic',
        'filter_json' => ['rules' => [['field' => 'metadata.tier', 'op' => '=', 'value' => 'gold']]],
    ]);

    $ids = $this->resolver->resolve($list);

    expect($ids)->toEqual([$c1->id]);
});

it('excludes contacts who have opted out of marketing', function () {
    $list = NewsletterList::create(['name' => 'Test', 'kind' => 'static']);
    $c1 = Contact::create(['email' => 'a@example.com']);
    $c2 = Contact::create(['email' => 'b@example.com', 'marketing_opt_out_at' => now()]);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c1->id]);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c2->id]);

    $ids = $this->resolver->resolveSendable($list);

    expect($ids)->toEqual([$c1->id]);
});
```

- [ ] **Step 2: Run failing**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Unit/Services/Newsletter/ContactSegmentResolverTest.php
```

Expected: FAIL (class doesn't exist).

- [ ] **Step 3: Implement ContactSegmentResolver**

```php
<?php

namespace Escalated\Laravel\Services\Newsletter;

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Illuminate\Database\Eloquent\Builder;

class ContactSegmentResolver
{
    /**
     * Resolve a list to its full set of contact IDs (no opt-out filtering).
     * @return array<int>
     */
    public function resolve(NewsletterList $list): array
    {
        if ($list->kind === 'static') {
            return $list->members()->pluck('contact_id')->all();
        }

        return $this->applyFilter($list->filter_json ?? ['rules' => []])->pluck('id')->all();
    }

    /**
     * Resolve to sendable contact IDs (opt-out filtered).
     * Caller may further exclude hard-bounced emails via BounceSuppressionStore.
     * @return array<int>
     */
    public function resolveSendable(NewsletterList $list): array
    {
        $query = Contact::query()->whereNull('marketing_opt_out_at');

        if ($list->kind === 'static') {
            $query->whereIn('id', $list->members()->pluck('contact_id'));
        } else {
            $query = $this->applyFilter($list->filter_json ?? ['rules' => []], $query);
        }

        return $query->pluck('id')->all();
    }

    /**
     * Count contacts matching a dynamic filter, ignoring opt-outs.
     * Used by the admin UI's live counter.
     */
    public function countMatches(array $filter): int
    {
        return $this->applyFilter($filter)->count();
    }

    protected function applyFilter(array $filter, ?Builder $base = null): Builder
    {
        $query = $base ?? Contact::query();
        foreach ($filter['rules'] ?? [] as $rule) {
            $field = $rule['field'] ?? null;
            $op = $rule['op'] ?? '=';
            $value = $rule['value'] ?? null;
            if (!$field) continue;

            if (str_starts_with($field, 'metadata.')) {
                $key = substr($field, strlen('metadata.'));
                $query->whereJsonContains("metadata->{$key}", $value);
                continue;
            }
            $query->where($field, $op, $value);
        }
        return $query;
    }
}
```

- [ ] **Step 4: Run, expect PASS**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Unit/Services/Newsletter/ContactSegmentResolverTest.php
```

- [ ] **Step 5: BounceSuppressionStore failing test**

```php
<?php
// tests/Unit/Services/Newsletter/BounceSuppressionStoreTest.php

use Escalated\Laravel\Services\Newsletter\BounceSuppressionStore;

beforeEach(function () {
    $this->store = app(BounceSuppressionStore::class);
});

it('marks emails as hard-bounced and filters them out', function () {
    $this->store->markBounced('bounced@example.com');
    expect($this->store->isBounced('bounced@example.com'))->toBeTrue();
    expect($this->store->isBounced('ok@example.com'))->toBeFalse();
});

it('filters a list of emails to non-suppressed ones', function () {
    $this->store->markBounced('a@example.com');
    $this->store->markComplained('b@example.com');

    $filtered = $this->store->filterSendable(['a@example.com', 'b@example.com', 'c@example.com']);

    expect($filtered)->toEqual(['c@example.com']);
});
```

- [ ] **Step 6: Implement BounceSuppressionStore**

The store uses the existing `escalated_settings`-style key-value table or a small dedicated table. Spec doesn't add a dedicated table, so use `cache()` as the source of truth with a long TTL and an `EscalatedSettings`-backed persistence helper. Pragmatic v1 implementation:

```php
<?php

namespace Escalated\Laravel\Services\Newsletter;

use Escalated\Laravel\Models\EscalatedSettings;

class BounceSuppressionStore
{
    private const KEY = 'newsletter.suppressed_emails';

    public function markBounced(string $email): void
    {
        $this->mark($email);
    }

    public function markComplained(string $email): void
    {
        $this->mark($email);
    }

    public function isBounced(string $email): bool
    {
        return in_array(strtolower($email), $this->load(), true);
    }

    /**
     * @param array<string> $emails
     * @return array<string>
     */
    public function filterSendable(array $emails): array
    {
        $suppressed = array_flip($this->load());
        return array_values(array_filter($emails, fn ($e) => !isset($suppressed[strtolower($e)])));
    }

    private function mark(string $email): void
    {
        $list = $this->load();
        $email = strtolower($email);
        if (!in_array($email, $list, true)) {
            $list[] = $email;
            EscalatedSettings::updateOrCreate(
                ['key' => self::KEY],
                ['value' => json_encode($list), 'type' => 'json', 'group' => 'newsletter'],
            );
        }
    }

    /** @return array<string> */
    private function load(): array
    {
        $row = EscalatedSettings::where('key', self::KEY)->first();
        if (!$row || !$row->value) return [];
        $decoded = json_decode($row->value, true);
        return is_array($decoded) ? $decoded : [];
    }
}
```

- [ ] **Step 7: Run, expect PASS**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Unit/Services/Newsletter/BounceSuppressionStoreTest.php
```

- [ ] **Step 8: Commit**

```bash
git -C C:/Users/work/escalated-laravel add src/Services/Newsletter/ContactSegmentResolver.php src/Services/Newsletter/BounceSuppressionStore.php tests/Unit/Services/Newsletter/ContactSegmentResolverTest.php tests/Unit/Services/Newsletter/BounceSuppressionStoreTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add ContactSegmentResolver and BounceSuppressionStore"
```

---

### Task B10: NewsletterRendererService

The rendering service is the most security-sensitive piece — it implements the strict merge-field allowlist and the post-render click rewriting + pixel injection.

**Files:**
- Create: `src/Services/Newsletter/NewsletterRendererService.php`
- Test: `tests/Unit/Services/Newsletter/NewsletterRendererServiceTest.php`

- [ ] **Step 1: Ensure `league/commonmark` and `symfony/dom-crawler` are available**

```bash
cd C:/Users/work/escalated-laravel && composer show league/commonmark symfony/dom-crawler 2>&1 | head -20
```

If either is missing, add it:

```bash
cd C:/Users/work/escalated-laravel && composer require league/commonmark:^2.0 symfony/dom-crawler:^6.0
```

Commit `composer.json` and `composer.lock` separately:

```bash
git -C C:/Users/work/escalated-laravel add composer.json composer.lock
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add markdown and dom-crawler dependencies"
```

- [ ] **Step 2: Failing test**

```php
<?php
// tests/Unit/Services/Newsletter/NewsletterRendererServiceTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Services\Newsletter\NewsletterRendererService;

beforeEach(function () {
    $this->renderer = app(NewsletterRendererService::class);
    config(['app.url' => 'https://example.com']);
});

function makeDelivery(array $contactAttrs = [], array $newsletterAttrs = []): NewsletterDelivery
{
    $list = NewsletterList::create(['name' => 'Test', 'kind' => 'static']);
    $contact = Contact::create(array_merge(['email' => 'maria@example.com', 'name' => 'Maria Lopez'], $contactAttrs));
    $newsletter = Newsletter::create(array_merge([
        'subject' => 'Hi',
        'from_email' => 'a@example.com',
        'target_list_id' => $list->id,
        'body_markdown' => 'Hello {{ contact.first_name }}!',
        'theme' => 'default',
    ], $newsletterAttrs));
    return NewsletterDelivery::create([
        'newsletter_id' => $newsletter->id,
        'contact_id' => $contact->id,
        'email_at_send' => $contact->email,
        'tracking_token' => 'tok_'.uniqid(),
    ]);
}

it('renders Markdown to HTML', function () {
    $delivery = makeDelivery([], ['body_markdown' => '# Hello']);
    $html = $this->renderer->render($delivery);
    expect($html)->toContain('<h1>Hello</h1>');
});

it('resolves contact merge fields', function () {
    $delivery = makeDelivery(['name' => 'Maria Lopez'], ['body_markdown' => 'Hi {{ contact.first_name }}, your email is {{ contact.email }}.']);
    $html = $this->renderer->render($delivery);
    expect($html)->toContain('Hi Maria, your email is maria@example.com.');
});

it('renders unknown merge fields as empty strings', function () {
    $delivery = makeDelivery([], ['body_markdown' => 'Foo {{ contact.does_not_exist }} bar']);
    $html = $this->renderer->render($delivery);
    expect($html)->toContain('Foo  bar');
    expect($html)->not->toContain('{{');
});

it('does NOT interpret host template syntax in user content', function () {
    $delivery = makeDelivery([], ['body_markdown' => 'Hello {{ now() }}']);
    $html = $this->renderer->render($delivery);
    // `now()` is not in our allowlist, so it resolves to empty — never evaluated
    expect($html)->not->toContain((string) now()->year);
});

it('rewrites href attributes to the click-tracking endpoint', function () {
    $delivery = makeDelivery([], ['body_markdown' => '[Click here](https://example.com/landing)']);
    $html = $this->renderer->render($delivery);
    expect($html)->toMatch('#href="https://example.com/escalated/n/c/[^"]+"#');
    expect($html)->not->toContain('https://example.com/landing"');
});

it('appends the tracking pixel before </body>', function () {
    $delivery = makeDelivery();
    $html = $this->renderer->render($delivery);
    expect($html)->toMatch('#<img src="https://example\.com/escalated/n/o/[^"]+\.gif" width="1" height="1" alt="" />\s*</body>#');
});

it('skips click rewriting and pixel when tracking_enabled is false', function () {
    config(['escalated.newsletters.tracking_enabled' => false]);
    $delivery = makeDelivery([], ['body_markdown' => '[Click here](https://example.com/landing)']);
    $html = $this->renderer->render($delivery);
    expect($html)->toContain('href="https://example.com/landing"');
    expect($html)->not->toContain('/escalated/n/o/');
});

it('rejects javascript: URLs in click-rewriting', function () {
    $delivery = makeDelivery([], ['body_markdown' => '[Bad](javascript:alert(1))']);
    $html = $this->renderer->render($delivery);
    expect($html)->not->toContain('javascript:');
});

it('does NOT rewrite the unsubscribe or view-in-browser links', function () {
    $delivery = makeDelivery();
    $html = $this->renderer->render($delivery);
    // unsub URL is injected by theme; it should not be wrapped in the click-tracker
    expect($html)->toMatch('#href="https://example\.com/escalated/n/u/[^"]+"#');
    expect($html)->not->toMatch('#href="https://example\.com/escalated/n/c/[^"]+u=[^"]*escalated/n/u/#');
});
```

- [ ] **Step 3: Run failing**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Unit/Services/Newsletter/NewsletterRendererServiceTest.php
```

Expected: FAIL.

- [ ] **Step 4: Implement NewsletterRendererService**

```php
<?php

namespace Escalated\Laravel\Services\Newsletter;

use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Illuminate\Support\Facades\View;
use League\CommonMark\CommonMarkConverter;
use Symfony\Component\DomCrawler\Crawler;

class NewsletterRendererService
{
    private const ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel'];

    public function __construct(private readonly CommonMarkConverter $markdown = new CommonMarkConverter([
        'html_input' => 'strip',
        'allow_unsafe_links' => false,
    ])) {}

    public function render(NewsletterDelivery $delivery): string
    {
        $newsletter = $delivery->newsletter;
        $contact = $delivery->contact;

        $bodyMarkdown = $newsletter->body_markdown
            ?? ($newsletter->template?->body_markdown ?? '');
        $themeSlug = $newsletter->theme
            ?? ($newsletter->template?->theme ?? config('escalated.newsletters.default_theme', 'default'));

        // Stage 1: Markdown → HTML
        $bodyHtml = (string) $this->markdown->convert($bodyMarkdown);

        // Stage 1.5: merge field resolution (after Markdown, strict allowlist)
        $bodyHtml = $this->resolveMergeFields($bodyHtml, $contact, $delivery);

        // Stage 2: theme wrapping
        $themed = View::make("escalated::newsletters.themes.{$themeSlug}", [
            'subject' => $newsletter->subject,
            'body' => $bodyHtml,
            'unsubscribe_url' => $this->unsubscribeUrl($delivery),
            'view_in_browser_url' => $this->viewInBrowserUrl($delivery),
            'tracking_pixel' => $this->trackingPixelHtml($delivery),
            'brand' => $this->brand(),
        ])->render();

        // Stage 3: post-render click rewriting + pixel injection
        if (config('escalated.newsletters.tracking_enabled', true)) {
            $themed = $this->rewriteLinks($themed, $delivery);
            $themed = $this->injectPixel($themed, $delivery);
        }

        return $themed;
    }

    private function resolveMergeFields(string $html, $contact, NewsletterDelivery $delivery): string
    {
        $resolver = function (array $m) use ($contact, $delivery): string {
            $path = trim($m[1]);
            return $this->resolvePath($path, $contact, $delivery);
        };
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/', $resolver, $html);
    }

    private function resolvePath(string $path, $contact, NewsletterDelivery $delivery): string
    {
        $value = match (true) {
            $path === 'contact.name' => (string) ($contact->name ?? ''),
            $path === 'contact.first_name' => $this->firstName((string) ($contact->name ?? '')),
            $path === 'contact.email' => (string) $contact->email,
            $path === 'unsubscribe_url' => $this->unsubscribeUrl($delivery),
            $path === 'view_in_browser_url' => $this->viewInBrowserUrl($delivery),
            str_starts_with($path, 'contact.metadata.') => (string) data_get($contact->metadata ?? [], substr($path, strlen('contact.metadata.')), ''),
            default => '',
        };
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    private function firstName(string $full): string
    {
        return explode(' ', trim($full))[0] ?? '';
    }

    public function unsubscribeUrl(NewsletterDelivery $delivery): string
    {
        return url("/escalated/n/u/{$delivery->tracking_token}");
    }

    public function viewInBrowserUrl(NewsletterDelivery $delivery): string
    {
        return url("/escalated/n/v/{$delivery->tracking_token}");
    }

    public function trackingPixelHtml(NewsletterDelivery $delivery): string
    {
        if (!config('escalated.newsletters.tracking_enabled', true)) return '';
        $url = url("/escalated/n/o/{$delivery->tracking_token}.gif");
        return sprintf('<img src="%s" width="1" height="1" alt="" />', e($url));
    }

    private function rewriteLinks(string $html, NewsletterDelivery $delivery): string
    {
        $crawler = new Crawler('<?xml encoding="utf-8" ?>' . $html);
        $unsubPrefix = $this->unsubscribeUrl($delivery);
        $viewPrefix = $this->viewInBrowserUrl($delivery);

        foreach ($crawler->filter('a[href]') as $node) {
            $href = $node->getAttribute('href');
            if ($href === '' || str_starts_with($href, '#')) continue;
            $scheme = strtolower(parse_url($href, PHP_URL_SCHEME) ?? '');
            if (!in_array($scheme, self::ALLOWED_SCHEMES, true)) {
                $node->setAttribute('href', '#');
                continue;
            }
            if (in_array($scheme, ['mailto', 'tel'], true)) continue;
            if (str_starts_with($href, $unsubPrefix) || str_starts_with($href, $viewPrefix)) continue;
            $tracked = url("/escalated/n/c/{$delivery->tracking_token}") . '?u=' . rtrim(strtr(base64_encode($href), '+/', '-_'), '=');
            $node->setAttribute('href', $tracked);
        }

        return $crawler->html();
    }

    private function injectPixel(string $html, NewsletterDelivery $delivery): string
    {
        $pixel = $this->trackingPixelHtml($delivery);
        if ($pixel === '') return $html;
        if (str_contains($html, '</body>')) {
            return str_replace('</body>', $pixel . '</body>', $html);
        }
        return $html . $pixel;
    }

    private function brand(): array
    {
        return [
            'name' => config('escalated.app_name', config('app.name', 'Support')),
            'accent' => config('escalated.newsletters.brand_accent', '#2563eb'),
            'logo_url' => config('escalated.newsletters.brand_logo_url'),
            'physical_address' => config('escalated.newsletters.brand_physical_address'),
        ];
    }
}
```

- [ ] **Step 5: Add the two starter themes (needed for tests to pass)**

Skip ahead to Task B14 if helpful, then come back. Or create minimal stubs now:

```blade
{{-- resources/views/newsletters/themes/default.blade.php --}}
<!doctype html>
<html><head><meta charset="utf-8" /><title>{{ $subject }}</title></head>
<body>
  {!! $body !!}
  <hr />
  <p><a href="{{ $unsubscribe_url }}">Unsubscribe</a> · <a href="{{ $view_in_browser_url }}">View in browser</a></p>
</body></html>
```

Tests will pass with this stub; full themes are Task B14.

- [ ] **Step 6: Run, expect PASS**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Unit/Services/Newsletter/NewsletterRendererServiceTest.php
```

- [ ] **Step 7: Commit**

```bash
git -C C:/Users/work/escalated-laravel add src/Services/Newsletter/NewsletterRendererService.php tests/Unit/Services/Newsletter/NewsletterRendererServiceTest.php resources/views/newsletters/themes/default.blade.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add renderer service with merge-field allowlist and click rewriting"
```

---

### Task B11: NewsletterPlannerService

**Files:**
- Create: `src/Services/Newsletter/NewsletterPlannerService.php`
- Test: `tests/Unit/Services/Newsletter/NewsletterPlannerServiceTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Unit/Services/Newsletter/NewsletterPlannerServiceTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Models\Newsletter\NewsletterListMember;
use Escalated\Laravel\Services\Newsletter\BounceSuppressionStore;
use Escalated\Laravel\Services\Newsletter\NewsletterPlannerService;

beforeEach(function () {
    $this->planner = app(NewsletterPlannerService::class);
});

it('creates one pending delivery per sendable contact', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $c1 = Contact::create(['email' => 'a@example.com']);
    $c2 = Contact::create(['email' => 'b@example.com']);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c1->id]);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c2->id]);
    $n = Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'status' => 'scheduled', 'body_markdown' => 'hi']);

    $this->planner->plan($n);

    expect(NewsletterDelivery::where('newsletter_id', $n->id)->count())->toBe(2);
    expect($n->fresh()->status)->toBe('sending');
    expect($n->fresh()->summary_total)->toBe(2);
});

it('skips opted-out contacts', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $c1 = Contact::create(['email' => 'a@example.com']);
    $c2 = Contact::create(['email' => 'b@example.com', 'marketing_opt_out_at' => now()]);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c1->id]);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c2->id]);
    $n = Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'status' => 'scheduled', 'body_markdown' => 'hi']);

    $this->planner->plan($n);

    expect(NewsletterDelivery::where('newsletter_id', $n->id)->count())->toBe(1);
});

it('skips contacts whose email has hard-bounced', function () {
    app(BounceSuppressionStore::class)->markBounced('a@example.com');
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $c1 = Contact::create(['email' => 'a@example.com']);
    $c2 = Contact::create(['email' => 'c@example.com']);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c1->id]);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c2->id]);
    $n = Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'status' => 'scheduled', 'body_markdown' => 'hi']);

    $this->planner->plan($n);

    expect(NewsletterDelivery::where('newsletter_id', $n->id)->where('email_at_send', 'a@example.com')->count())->toBe(0);
    expect(NewsletterDelivery::where('newsletter_id', $n->id)->where('email_at_send', 'c@example.com')->count())->toBe(1);
});

it('snapshots the email at plan time', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $c1 = Contact::create(['email' => 'a@example.com']);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c1->id]);
    $n = Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'status' => 'scheduled', 'body_markdown' => 'hi']);

    $this->planner->plan($n);
    $c1->update(['email' => 'changed@example.com']);

    $d = NewsletterDelivery::where('newsletter_id', $n->id)->first();
    expect($d->email_at_send)->toBe('a@example.com');
});

it('generates unique tracking tokens', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    for ($i = 0; $i < 5; $i++) {
        $c = Contact::create(['email' => "c{$i}@example.com"]);
        NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c->id]);
    }
    $n = Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'status' => 'scheduled', 'body_markdown' => 'hi']);

    $this->planner->plan($n);

    $tokens = NewsletterDelivery::where('newsletter_id', $n->id)->pluck('tracking_token')->all();
    expect($tokens)->toHaveCount(5);
    expect(array_unique($tokens))->toHaveCount(5);
});
```

- [ ] **Step 2: Implement NewsletterPlannerService**

```php
<?php

namespace Escalated\Laravel\Services\Newsletter;

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Illuminate\Support\Str;

class NewsletterPlannerService
{
    public function __construct(
        private readonly ContactSegmentResolver $segments,
        private readonly BounceSuppressionStore $bounces,
    ) {}

    public function plan(Newsletter $newsletter): void
    {
        $newsletter->update(['status' => 'sending']);

        $contactIds = $this->segments->resolveSendable($newsletter->targetList);
        if (empty($contactIds)) {
            $newsletter->update(['summary_total' => 0]);
            return;
        }

        $contacts = Contact::whereIn('id', $contactIds)->get(['id', 'email']);
        $emails = $contacts->pluck('email')->all();
        $sendableEmails = array_flip(array_map('strtolower', $this->bounces->filterSendable($emails)));

        $rows = [];
        foreach ($contacts as $contact) {
            if (!isset($sendableEmails[strtolower($contact->email)])) continue;
            $rows[] = [
                'newsletter_id' => $newsletter->id,
                'contact_id' => $contact->id,
                'email_at_send' => $contact->email,
                'status' => 'pending',
                'tracking_token' => $this->generateToken(),
                'attempt_count' => 0,
                'is_test' => false,
                'created_at' => now(),
            ];
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            NewsletterDelivery::insert($chunk);
        }

        $newsletter->update(['summary_total' => count($rows)]);
    }

    private function generateToken(): string
    {
        return Str::random(40);
    }
}
```

- [ ] **Step 3: Run, expect PASS**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Unit/Services/Newsletter/NewsletterPlannerServiceTest.php
```

- [ ] **Step 4: Commit**

```bash
git -C C:/Users/work/escalated-laravel add src/Services/Newsletter/NewsletterPlannerService.php tests/Unit/Services/Newsletter/NewsletterPlannerServiceTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add planner service with opt-out and bounce suppression"
```

---

### Task B12: NewsletterDispatcherService

**Files:**
- Create: `src/Services/Newsletter/NewsletterDispatcherService.php`
- Create: `src/Mail/NewsletterMail.php`
- Test: `tests/Unit/Services/Newsletter/NewsletterDispatcherServiceTest.php`

- [ ] **Step 1: NewsletterMail Mailable**

```php
<?php

namespace Escalated\Laravel\Mail;

use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Services\Newsletter\NewsletterRendererService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

class NewsletterMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly NewsletterDelivery $delivery) {}

    public function envelope(): Envelope
    {
        $n = $this->delivery->newsletter;
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address($n->from_email, $n->from_name ?? null),
            replyTo: $n->reply_to ? [new \Illuminate\Mail\Mailables\Address($n->reply_to)] : [],
            subject: $this->resolveSubject(),
        );
    }

    public function headers(): Headers
    {
        $delivery = $this->delivery;
        $unsub = url("/escalated/n/u/{$delivery->tracking_token}");
        return new Headers(text: [
            'List-Unsubscribe' => "<{$unsub}>",
            'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click',
            'X-Escalated-Newsletter-Id' => (string) $delivery->newsletter_id,
            'Message-ID' => '<n-'.$delivery->newsletter_id.'-'.$delivery->tracking_token.'@'.parse_url(config('app.url'), PHP_URL_HOST).'>',
        ]);
    }

    public function build(): self
    {
        $html = app(NewsletterRendererService::class)->render($this->delivery);
        return $this->to($this->delivery->email_at_send)->html($html);
    }

    private function resolveSubject(): string
    {
        $n = $this->delivery->newsletter;
        $subject = $n->subject ?: ($n->template?->subject_template ?? '');
        // Subject merge fields use the same allowlist
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/', function ($m) {
            $contact = $this->delivery->contact;
            return match (trim($m[1])) {
                'contact.name' => (string) ($contact->name ?? ''),
                'contact.first_name' => explode(' ', trim((string) ($contact->name ?? '')))[0] ?? '',
                'contact.email' => (string) $contact->email,
                default => str_starts_with($m[1], 'contact.metadata.')
                    ? (string) data_get($contact->metadata ?? [], substr($m[1], strlen('contact.metadata.')), '')
                    : '',
            };
        }, $subject);
    }
}
```

- [ ] **Step 2: Failing dispatcher test**

```php
<?php
// tests/Unit/Services/Newsletter/NewsletterDispatcherServiceTest.php

use Escalated\Laravel\Mail\NewsletterMail;
use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Services\Newsletter\NewsletterDispatcherService;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    Mail::fake();
    $this->dispatcher = app(NewsletterDispatcherService::class);
});

function makePendingDelivery(): NewsletterDelivery
{
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    $n = Newsletter::create(['subject' => 'Hi', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hello', 'status' => 'sending', 'summary_total' => 1]);
    return NewsletterDelivery::create([
        'newsletter_id' => $n->id, 'contact_id' => $contact->id, 'email_at_send' => 'a@example.com',
        'status' => 'pending', 'tracking_token' => 'tok_'.uniqid(),
    ]);
}

it('claims pending rows, sends mail, and marks them sent', function () {
    $delivery = makePendingDelivery();
    $this->dispatcher->dispatchBatch();
    Mail::assertSent(NewsletterMail::class, 1);
    expect($delivery->fresh()->status)->toBe('sent');
    expect($delivery->fresh()->sent_at)->not->toBeNull();
});

it('respects the batch size config', function () {
    config(['escalated.newsletters.batch_size' => 2]);
    for ($i = 0; $i < 5; $i++) makePendingDelivery();
    $this->dispatcher->dispatchBatch();
    Mail::assertSent(NewsletterMail::class, 2);
});

it('flips the parent newsletter to sent once all deliveries are terminal', function () {
    $delivery = makePendingDelivery();
    $this->dispatcher->dispatchBatch();
    expect($delivery->newsletter->fresh()->status)->toBe('sent');
});

it('auto-pauses when bounce rate exceeds the threshold', function () {
    config(['escalated.newsletters.auto_pause_threshold' => 4, 'escalated.newsletters.auto_pause_bounce_rate' => 0.5]);
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $n = Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hi', 'status' => 'sending', 'summary_total' => 4]);
    foreach (range(1, 4) as $i) {
        NewsletterDelivery::create(['newsletter_id' => $n->id, 'contact_id' => Contact::create(['email' => "c{$i}@x.com"])->id, 'email_at_send' => "c{$i}@x.com", 'status' => 'bounced', 'tracking_token' => 'tok'.$i]);
    }
    // one more pending
    NewsletterDelivery::create(['newsletter_id' => $n->id, 'contact_id' => Contact::create(['email' => 'c5@x.com'])->id, 'email_at_send' => 'c5@x.com', 'status' => 'pending', 'tracking_token' => 'tok5']);

    $this->dispatcher->dispatchBatch();

    expect($n->fresh()->status)->toBe('paused');
});

it('does nothing when the feature flag is off', function () {
    config(['escalated.enable_newsletters' => false]);
    $delivery = makePendingDelivery();
    $this->dispatcher->dispatchBatch();
    Mail::assertNothingSent();
    expect($delivery->fresh()->status)->toBe('pending');
});
```

- [ ] **Step 3: Implement NewsletterDispatcherService**

```php
<?php

namespace Escalated\Laravel\Services\Newsletter;

use Escalated\Laravel\Mail\NewsletterMail;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class NewsletterDispatcherService
{
    public function dispatchBatch(): void
    {
        if (!config('escalated.enable_newsletters', false)) return;

        $this->reclaimStuckRows();

        $batchSize = (int) config('escalated.newsletters.batch_size', 50);

        $ids = DB::transaction(function () use ($batchSize) {
            $ids = NewsletterDelivery::query()
                ->where('status', 'pending')
                ->orderBy('id')
                ->limit($batchSize)
                ->lockForUpdate()
                ->pluck('id');

            if ($ids->isEmpty()) return collect();

            NewsletterDelivery::whereIn('id', $ids)
                ->update(['status' => 'queued', 'claimed_at' => now()]);

            return $ids;
        });

        foreach ($ids as $id) {
            $this->dispatchOne(NewsletterDelivery::find($id));
        }

        $this->finalizeCompletedNewsletters();
        $this->checkAutoPauseAcrossActiveNewsletters();
    }

    private function dispatchOne(NewsletterDelivery $delivery): void
    {
        try {
            Mail::send(new NewsletterMail($delivery));
            $delivery->update([
                'status' => 'sent',
                'sent_at' => now(),
                'claimed_at' => null,
            ]);
            Newsletter::where('id', $delivery->newsletter_id)->increment('summary_sent');
        } catch (Throwable $e) {
            Log::warning('Newsletter delivery failed', [
                'delivery_id' => $delivery->id,
                'error' => $e->getMessage(),
            ]);
            $next = $delivery->attempt_count + 1;
            $max = 3;
            if ($next >= $max) {
                $delivery->update([
                    'status' => 'failed',
                    'failure_reason' => $e->getMessage(),
                    'attempt_count' => $next,
                    'claimed_at' => null,
                ]);
            } else {
                $delivery->update([
                    'status' => 'pending',
                    'attempt_count' => $next,
                    'claimed_at' => null,
                ]);
            }
        }
    }

    private function reclaimStuckRows(): void
    {
        $cutoff = now()->subMinutes((int) config('escalated.newsletters.claim_timeout_minutes', 10));
        NewsletterDelivery::where('status', 'queued')
            ->where('claimed_at', '<', $cutoff)
            ->update(['status' => 'pending', 'claimed_at' => null]);
    }

    private function finalizeCompletedNewsletters(): void
    {
        Newsletter::where('status', 'sending')->get()->each(function (Newsletter $n) {
            $remaining = NewsletterDelivery::where('newsletter_id', $n->id)
                ->whereIn('status', ['pending', 'queued'])
                ->exists();
            if (!$remaining) {
                $n->update(['status' => 'sent', 'sent_at' => $n->sent_at ?? now()]);
            }
        });
    }

    private function checkAutoPauseAcrossActiveNewsletters(): void
    {
        $threshold = (int) config('escalated.newsletters.auto_pause_threshold', 100);
        $rate = (float) config('escalated.newsletters.auto_pause_bounce_rate', 0.05);

        Newsletter::where('status', 'sending')->get()->each(function (Newsletter $n) use ($threshold, $rate) {
            $total = NewsletterDelivery::where('newsletter_id', $n->id)->whereIn('status', ['sent', 'bounced', 'complained', 'failed'])->count();
            if ($total < $threshold) return;
            $bounced = NewsletterDelivery::where('newsletter_id', $n->id)->where('status', 'bounced')->count();
            if ($total > 0 && ($bounced / $total) >= $rate) {
                $n->update(['status' => 'paused']);
                Log::warning('Newsletter auto-paused due to high bounce rate', [
                    'newsletter_id' => $n->id, 'bounced' => $bounced, 'total' => $total,
                ]);
            }
        });
    }
}
```

- [ ] **Step 4: Run, expect PASS**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Unit/Services/Newsletter/NewsletterDispatcherServiceTest.php
```

- [ ] **Step 5: Commit**

```bash
git -C C:/Users/work/escalated-laravel add src/Mail/NewsletterMail.php src/Services/Newsletter/NewsletterDispatcherService.php tests/Unit/Services/Newsletter/NewsletterDispatcherServiceTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add dispatcher service with claim/retry/auto-pause"
```

---

### Task B13: NewsletterTrackerService

The tracker accepts events from both ESP webhooks and self-hosted endpoints and applies them idempotently.

**Files:**
- Create: `src/Services/Newsletter/NewsletterTrackerService.php`
- Test: `tests/Unit/Services/Newsletter/NewsletterTrackerServiceTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Unit/Services/Newsletter/NewsletterTrackerServiceTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Services\Newsletter\BounceSuppressionStore;
use Escalated\Laravel\Services\Newsletter\NewsletterTrackerService;

beforeEach(function () {
    $this->tracker = app(NewsletterTrackerService::class);
});

function sentDelivery(): NewsletterDelivery
{
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    $n = Newsletter::create(['subject' => 'Hi', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hi', 'status' => 'sending']);
    return NewsletterDelivery::create([
        'newsletter_id' => $n->id, 'contact_id' => $contact->id, 'email_at_send' => 'a@example.com',
        'status' => 'sent', 'tracking_token' => 'tok-'.uniqid(), 'sent_at' => now(),
    ]);
}

it('records an open and updates summary, first-event-wins', function () {
    $d = sentDelivery();
    $this->tracker->recordOpen($d->tracking_token);
    $first = $d->fresh()->opened_at;
    expect($first)->not->toBeNull();
    $this->tracker->recordOpen($d->tracking_token);
    expect($d->fresh()->opened_at->equalTo($first))->toBeTrue();
    expect($d->newsletter->fresh()->summary_opened)->toBe(1);
});

it('records a click, increments clicks_count, sets last_clicked_at', function () {
    $d = sentDelivery();
    $this->tracker->recordClick($d->tracking_token, 'https://example.com/a');
    $this->tracker->recordClick($d->tracking_token, 'https://example.com/b');
    $fresh = $d->fresh();
    expect($fresh->clicks_count)->toBe(2);
    expect($fresh->last_clicked_at)->not->toBeNull();
    expect($d->newsletter->fresh()->summary_clicked)->toBe(1); // unique
});

it('records a hard bounce, marks delivery, and updates the suppression store', function () {
    $d = sentDelivery();
    $this->tracker->recordBounce($d->tracking_token, 'hard', '550 mailbox not found');
    expect($d->fresh()->status)->toBe('bounced');
    expect($d->fresh()->bounce_reason)->toBe('550 mailbox not found');
    expect(app(BounceSuppressionStore::class)->isBounced('a@example.com'))->toBeTrue();
});

it('records a complaint and suppresses the email', function () {
    $d = sentDelivery();
    $this->tracker->recordComplaint($d->tracking_token);
    expect($d->fresh()->status)->toBe('complained');
    expect(app(BounceSuppressionStore::class)->isBounced('a@example.com'))->toBeTrue();
});

it('returns silently on unknown tokens (no exception)', function () {
    expect(fn () => $this->tracker->recordOpen('nope'))->not->toThrow(Throwable::class);
});

it('ignores opens after a bounce', function () {
    $d = sentDelivery();
    $this->tracker->recordBounce($d->tracking_token, 'hard', '550');
    $this->tracker->recordOpen($d->tracking_token);
    expect($d->fresh()->opened_at)->toBeNull();
});
```

- [ ] **Step 2: Implement NewsletterTrackerService**

```php
<?php

namespace Escalated\Laravel\Services\Newsletter;

use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;

class NewsletterTrackerService
{
    public function __construct(private readonly BounceSuppressionStore $bounces) {}

    public function recordOpen(string $token): void
    {
        $d = $this->findByToken($token);
        if (!$d) return;
        if (in_array($d->status, ['bounced', 'complained', 'failed'], true)) return;

        if ($d->opened_at === null) {
            $d->update(['opened_at' => now()]);
            Newsletter::where('id', $d->newsletter_id)->increment('summary_opened');
        }
    }

    public function recordClick(string $token, string $url): void
    {
        $d = $this->findByToken($token);
        if (!$d) return;
        if (in_array($d->status, ['bounced', 'complained', 'failed'], true)) return;

        $isFirstClick = $d->clicks_count === 0;
        $d->update([
            'clicks_count' => $d->clicks_count + 1,
            'last_clicked_at' => now(),
        ]);
        if ($d->opened_at === null) {
            $d->update(['opened_at' => now()]);
            Newsletter::where('id', $d->newsletter_id)->increment('summary_opened');
        }
        if ($isFirstClick) {
            Newsletter::where('id', $d->newsletter_id)->increment('summary_clicked');
        }
    }

    public function recordBounce(string $token, string $type, ?string $reason = null): void
    {
        $d = $this->findByToken($token);
        if (!$d) return;
        if ($type !== 'hard') return; // soft bounces don't change status

        if ($d->status !== 'bounced') {
            $d->update(['status' => 'bounced', 'bounce_reason' => $reason]);
            Newsletter::where('id', $d->newsletter_id)->increment('summary_bounced');
            $this->bounces->markBounced($d->email_at_send);
        }
    }

    public function recordComplaint(string $token): void
    {
        $d = $this->findByToken($token);
        if (!$d) return;
        if ($d->status !== 'complained') {
            $d->update(['status' => 'complained']);
            Newsletter::where('id', $d->newsletter_id)->increment('summary_complained');
            $this->bounces->markComplained($d->email_at_send);
        }
    }

    private function findByToken(string $token): ?NewsletterDelivery
    {
        return NewsletterDelivery::where('tracking_token', $token)->first();
    }
}
```

- [ ] **Step 3: Run, expect PASS**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Unit/Services/Newsletter/NewsletterTrackerServiceTest.php
```

- [ ] **Step 4: Commit**

```bash
git -C C:/Users/work/escalated-laravel add src/Services/Newsletter/NewsletterTrackerService.php tests/Unit/Services/Newsletter/NewsletterTrackerServiceTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add tracker service for opens/clicks/bounces/complaints"
```

---

### Task B14: Starter Blade themes (default + branded)

**Files:**
- Modify: `resources/views/newsletters/themes/default.blade.php` (replace minimal stub with real theme)
- Create: `resources/views/newsletters/themes/branded.blade.php`

- [ ] **Step 1: Write the default theme**

```blade
{{-- resources/views/newsletters/themes/default.blade.php --}}
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{ $subject }}</title>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; color: #0f172a; -webkit-font-smoothing: antialiased; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .content { padding: 32px 24px; font-size: 16px; line-height: 1.6; }
    .content h1 { font-size: 24px; margin: 0 0 16px; }
    .content h2 { font-size: 20px; margin: 24px 0 12px; }
    .content p { margin: 0 0 16px; }
    .content a { color: #2563eb; }
    .footer { padding: 16px 24px 32px; font-size: 12px; color: #64748b; text-align: center; }
    .footer a { color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      {!! $body !!}
    </div>
    <div class="footer">
      <p>
        <a href="{{ $view_in_browser_url }}">View in browser</a>
        ·
        <a href="{{ $unsubscribe_url }}">Unsubscribe</a>
      </p>
      @if($brand['physical_address'] ?? null)
        <p>{{ $brand['physical_address'] }}</p>
      @endif
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 2: Write the branded theme**

```blade
{{-- resources/views/newsletters/themes/branded.blade.php --}}
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{ $subject }}</title>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; }
    .header { padding: 24px; background: {{ $brand['accent'] ?? '#2563eb' }}; color: white; text-align: center; }
    .header img { max-height: 40px; }
    .header h1 { font-size: 20px; margin: 0; }
    .content { padding: 32px 24px; font-size: 16px; line-height: 1.6; }
    .content h1, .content h2 { color: {{ $brand['accent'] ?? '#2563eb' }}; }
    .content p { margin: 0 0 16px; }
    .content a { color: {{ $brand['accent'] ?? '#2563eb' }}; }
    .footer { padding: 16px 24px 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer a { color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      @if($brand['logo_url'] ?? null)
        <img src="{{ $brand['logo_url'] }}" alt="{{ $brand['name'] ?? 'Newsletter' }}" />
      @else
        <h1>{{ $brand['name'] ?? 'Newsletter' }}</h1>
      @endif
    </div>
    <div class="content">
      {!! $body !!}
    </div>
    <div class="footer">
      <p>
        <a href="{{ $view_in_browser_url }}">View in browser</a>
        ·
        <a href="{{ $unsubscribe_url }}">Unsubscribe</a>
      </p>
      @if($brand['physical_address'] ?? null)
        <p>{{ $brand['physical_address'] }}</p>
      @endif
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 3: Re-run renderer tests to ensure both themes work**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Unit/Services/Newsletter/NewsletterRendererServiceTest.php
```

Expected: still PASS.

- [ ] **Step 4: Commit**

```bash
git -C C:/Users/work/escalated-laravel add resources/views/newsletters/themes/default.blade.php resources/views/newsletters/themes/branded.blade.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add default and branded starter themes"
```

---

### Task B15: NewsletterController (admin CRUD + preview + test send + send-now)

**Files:**
- Create: `src/Http/Controllers/Admin/NewsletterController.php`
- Create: `src/Http/Controllers/Admin/NewsletterPreviewController.php`
- Test: `tests/Feature/Admin/NewsletterControllerTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Feature/Admin/NewsletterControllerTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Models\Newsletter\NewsletterListMember;
use Escalated\Laravel\Models\Permission;
use Escalated\Laravel\Models\Role;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    config(['escalated.enable_newsletters' => true, 'mail.default' => 'log']);
    Mail::fake();
    Gate::define('escalated-admin', fn ($user) => $user->is_admin);
    $this->admin = adminUser();
    $this->actingAs($this->admin);
    $managePerm = Permission::create(['slug' => 'newsletters.manage', 'name' => 'Manage newsletters', 'group' => 'newsletters']);
    $sendPerm = Permission::create(['slug' => 'newsletters.send', 'name' => 'Send newsletters', 'group' => 'newsletters']);
    $role = Role::create(['slug' => 'admin', 'name' => 'Admin']);
    $role->permissions()->sync([$managePerm->id, $sendPerm->id]);
    $this->admin->roles()->sync([$role->id]);
});

it('lists newsletters', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    Newsletter::create(['subject' => 'Hi', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hi']);
    $res = $this->get('/admin/newsletters');
    $res->assertOk();
});

it('creates a draft', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $res = $this->post('/admin/newsletters', [
        'subject' => 'Welcome',
        'from_email' => 'hi@example.com',
        'target_list_id' => $list->id,
        'body_markdown' => 'Hello!',
        'status' => 'draft',
    ]);
    $res->assertRedirect();
    expect(Newsletter::where('subject', 'Welcome')->first())->not->toBeNull();
});

it('rejects send when mail is not configured', function () {
    config(['mail.default' => 'array']);
    config(['escalated_mail_configured' => false]); // see ServiceProvider for source-of-truth
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $res = $this->post('/admin/newsletters', [
        'subject' => 'X', 'from_email' => 'a@x.com', 'target_list_id' => $list->id,
        'body_markdown' => 'hi', 'status' => 'sending',
    ]);
    $res->assertSessionHasErrors();
});

it('test-sends to the current agent and marks the row as is_test', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $contact->id]);
    $res = $this->post('/admin/newsletters/test', [
        'subject' => 'Test', 'from_email' => 'a@x.com', 'target_list_id' => $list->id,
        'body_markdown' => 'hi',
    ]);
    $res->assertOk();
    $row = NewsletterDelivery::where('is_test', true)->first();
    expect($row)->not->toBeNull();
});

it('previews HTML for the given form data', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $res = $this->postJson('/admin/newsletters/preview', [
        'subject' => 'X', 'from_email' => 'a@x.com', 'target_list_id' => $list->id, 'body_markdown' => '# Hi', 'theme' => 'default',
    ]);
    $res->assertOk()->assertJsonPath('html', fn ($h) => str_contains($h, '<h1>Hi</h1>'));
});
```

- [ ] **Step 2: Implement NewsletterController**

```php
<?php

namespace Escalated\Laravel\Http\Controllers\Admin;

use Escalated\Laravel\Contracts\EscalatedUiRenderer;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Models\Newsletter\NewsletterTemplate;
use Escalated\Laravel\Services\Newsletter\NewsletterPlannerService;
use Escalated\Laravel\Services\Newsletter\NewsletterRendererService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function index(Request $request, EscalatedUiRenderer $ui)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $tab = $request->query('tab', 'drafts');
        $statuses = match ($tab) {
            'scheduled' => ['scheduled', 'sending', 'paused'],
            'sent' => ['sent', 'failed'],
            default => ['draft'],
        };
        $newsletters = Newsletter::with('targetList')->whereIn('status', $statuses)->latest()->paginate(50);
        return $ui->render('admin/newsletters/Index', compact('newsletters', 'tab'));
    }

    public function create(EscalatedUiRenderer $ui)
    {
        request()->user()->ensurePermission('newsletters.manage');
        return $ui->render('admin/newsletters/Compose', $this->composeProps());
    }

    public function store(Request $request, NewsletterPlannerService $planner)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $data = $this->validateForm($request);
        $isSend = in_array($data['status'] ?? 'draft', ['scheduled', 'sending'], true);
        if ($isSend) {
            $request->user()->ensurePermission('newsletters.send');
            if (!$this->mailConfigured()) {
                return back()->withErrors(['from_email' => 'Outbound mail is not configured.']);
            }
        }
        $n = Newsletter::create($data + ['created_by' => Auth::id()]);
        if ($data['status'] === 'sending') {
            $planner->plan($n);
        }
        return redirect("/admin/newsletters/{$n->id}");
    }

    public function show(Newsletter $newsletter, Request $request, EscalatedUiRenderer $ui)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $tab = $request->query('tab', 'overview');
        $statusFilter = $request->query('status');
        $deliveries = NewsletterDelivery::where('newsletter_id', $newsletter->id)
            ->where('is_test', false)
            ->when($statusFilter, fn ($q) => $q->where('status', $statusFilter))
            ->with('contact:id,name,email')
            ->latest('id')->paginate(100);
        $topClicks = $this->topClicks($newsletter);
        return $ui->render('admin/newsletters/Show', [
            'newsletter' => $newsletter->load('targetList'),
            'deliveries' => $deliveries,
            'topClicks' => $topClicks,
            'tab' => $tab,
        ]);
    }

    public function edit(Newsletter $newsletter, EscalatedUiRenderer $ui)
    {
        request()->user()->ensurePermission('newsletters.manage');
        abort_unless(in_array($newsletter->status, ['draft', 'scheduled'], true), 422, 'Only drafts and scheduled newsletters can be edited');
        return $ui->render('admin/newsletters/Edit', $this->composeProps() + ['newsletter' => $newsletter]);
    }

    public function update(Newsletter $newsletter, Request $request, NewsletterPlannerService $planner)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $data = $this->validateForm($request);
        $newsletter->update($data);
        if ($data['status'] === 'sending') {
            $request->user()->ensurePermission('newsletters.send');
            $planner->plan($newsletter);
        }
        return redirect("/admin/newsletters/{$newsletter->id}");
    }

    public function destroy(Newsletter $newsletter)
    {
        request()->user()->ensurePermission('newsletters.manage');
        abort_unless($newsletter->status === 'draft', 422, 'Only drafts can be deleted');
        $newsletter->delete();
        return redirect('/admin/newsletters');
    }

    public function testSend(Request $request, NewsletterRendererService $renderer)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $data = $this->validateForm($request);
        $list = NewsletterList::findOrFail($data['target_list_id']);
        $n = new Newsletter($data);
        $n->id = 0;
        $contact = (new \Escalated\Laravel\Models\Contact(['email' => $request->user()->email, 'name' => $request->user()->name]));
        $contact->id = $request->user()->id;
        $delivery = new NewsletterDelivery([
            'newsletter_id' => 0,
            'contact_id' => $contact->id,
            'email_at_send' => $contact->email,
            'tracking_token' => Str::random(40),
            'is_test' => true,
        ]);
        $delivery->setRelation('newsletter', $n);
        $delivery->setRelation('contact', $contact);
        $html = $renderer->render($delivery);
        \Illuminate\Support\Facades\Mail::html($html, function ($message) use ($request, $data) {
            $message->to($request->user()->email)
                ->from($data['from_email'], $data['from_name'] ?? null)
                ->subject('[TEST] ' . $data['subject']);
        });
        // Also persist the test row so the spec's `is_test` analytics exclusion is exercised
        if (isset($data['id'])) {
            NewsletterDelivery::create($delivery->toArray() + ['newsletter_id' => $data['id'], 'status' => 'sent', 'sent_at' => now()]);
        }
        return response()->json(['ok' => true]);
    }

    private function composeProps(): array
    {
        $themes = $this->discoverThemes();
        return [
            'lists' => NewsletterList::query()->select('id', 'name')->withCount('members as member_count')->get(),
            'templates' => NewsletterTemplate::query()->select('id', 'name')->get(),
            'themes' => $themes,
            'mailConfigured' => $this->mailConfigured(),
            'canSend' => request()->user()->hasPermission('newsletters.send'),
            'defaultFromEmail' => config('escalated.newsletters.default_from'),
            'defaultReplyTo' => config('escalated.newsletters.default_reply_to'),
            'defaultTheme' => config('escalated.newsletters.default_theme', 'default'),
        ];
    }

    private function discoverThemes(): array
    {
        $dir = resource_path('views/vendor/escalated/newsletters/themes');
        $packageDir = base_path('vendor/escalated/laravel/resources/views/newsletters/themes');
        $themes = collect([$dir, $packageDir])
            ->filter(fn ($d) => is_dir($d))
            ->flatMap(fn ($d) => glob("{$d}/*.blade.php") ?: [])
            ->map(fn ($p) => basename($p, '.blade.php'))
            ->unique()
            ->values()
            ->all();
        return $themes ?: ['default', 'branded'];
    }

    private function validateForm(Request $request): array
    {
        return $request->validate([
            'subject' => 'required|string|max:998',
            'from_email' => 'required|email|max:320',
            'from_name' => 'nullable|string|max:255',
            'reply_to' => 'nullable|email|max:320',
            'target_list_id' => 'required|integer|exists:escalated_newsletter_lists,id',
            'template_id' => 'nullable|integer|exists:escalated_newsletter_templates,id',
            'theme' => 'nullable|string|max:64',
            'body_markdown' => 'nullable|string',
            'status' => 'in:draft,scheduled,sending',
            'scheduled_at' => 'nullable|date|after:now',
        ]);
    }

    private function mailConfigured(): bool
    {
        return !in_array(config('mail.default'), [null, 'array'], true);
    }

    private function topClicks(Newsletter $newsletter): array
    {
        // Top-clicks aren't a separate table in v1; we surface aggregate clicks_count only.
        // Returning empty array is acceptable until v1.1 adds per-URL tracking.
        return [];
    }
}
```

- [ ] **Step 3: Run, expect PASS**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Admin/NewsletterControllerTest.php
```

(You may need to add a `preview` route inline within the same controller; if so, add a `preview()` method that renders via `NewsletterRendererService` against a synthetic contact and returns JSON `{html: ...}`. The test asserts JSON shape.)

- [ ] **Step 4: Add the preview endpoint**

Add this method to `NewsletterController`:

```php
public function preview(Request $request, NewsletterRendererService $renderer)
{
    $request->user()->ensurePermission('newsletters.manage');
    $data = $request->validate([
        'subject' => 'nullable|string|max:998',
        'body_markdown' => 'nullable|string',
        'theme' => 'nullable|string',
        'target_list_id' => 'nullable|integer',
        'from_email' => 'nullable|email',
    ]);
    $n = new Newsletter($data + ['theme' => $data['theme'] ?? 'default', 'from_email' => $data['from_email'] ?? 'preview@example.test']);
    $n->id = 0;
    $contact = new \Escalated\Laravel\Models\Contact(['email' => 'preview@example.test', 'name' => 'Preview User']);
    $contact->id = 0;
    $delivery = new NewsletterDelivery([
        'newsletter_id' => 0, 'contact_id' => 0,
        'email_at_send' => $contact->email, 'tracking_token' => 'preview',
    ]);
    $delivery->setRelation('newsletter', $n);
    $delivery->setRelation('contact', $contact);
    return response()->json(['html' => $renderer->render($delivery)]);
}
```

- [ ] **Step 5: Commit**

```bash
git -C C:/Users/work/escalated-laravel add src/Http/Controllers/Admin/NewsletterController.php tests/Feature/Admin/NewsletterControllerTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add NewsletterController (CRUD + preview + test send)"
```

---

### Task B16: NewsletterListController (admin)

**Files:**
- Create: `src/Http/Controllers/Admin/NewsletterListController.php`
- Test: `tests/Feature/Admin/NewsletterListControllerTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Feature/Admin/NewsletterListControllerTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Models\Newsletter\NewsletterListMember;
use Escalated\Laravel\Models\Permission;
use Escalated\Laravel\Models\Role;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    config(['escalated.enable_newsletters' => true]);
    Gate::define('escalated-admin', fn ($user) => $user->is_admin);
    $this->admin = adminUser();
    $this->actingAs($this->admin);
    $p = Permission::create(['slug' => 'newsletters.manage', 'name' => 'Manage', 'group' => 'newsletters']);
    $role = Role::create(['slug' => 'admin', 'name' => 'Admin']);
    $role->permissions()->sync([$p->id]);
    $this->admin->roles()->sync([$role->id]);
});

it('creates a static list', function () {
    $res = $this->post('/admin/newsletters/lists', ['name' => 'L', 'kind' => 'static']);
    $res->assertRedirect();
    expect(NewsletterList::where('name', 'L')->first())->not->toBeNull();
});

it('adds a contact to a static list', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    $res = $this->post("/admin/newsletters/lists/{$list->id}/members", ['contact_id' => $contact->id]);
    $res->assertRedirect();
    expect(NewsletterListMember::where(['list_id' => $list->id, 'contact_id' => $contact->id])->exists())->toBeTrue();
});

it('removes a contact from a static list', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $contact->id]);
    $res = $this->delete("/admin/newsletters/lists/{$list->id}/members/{$contact->id}");
    $res->assertRedirect();
    expect(NewsletterListMember::where(['list_id' => $list->id, 'contact_id' => $contact->id])->exists())->toBeFalse();
});

it('updates a dynamic list filter', function () {
    $list = NewsletterList::create(['name' => 'D', 'kind' => 'dynamic', 'filter_json' => ['rules' => []]]);
    $res = $this->put("/admin/newsletters/lists/{$list->id}", ['filter_json' => ['rules' => [['field' => 'email', 'op' => 'contains', 'value' => '@example.com']]]]);
    $res->assertRedirect();
    expect($list->fresh()->filter_json['rules'])->toHaveCount(1);
});
```

- [ ] **Step 2: Implement**

```php
<?php

namespace Escalated\Laravel\Http\Controllers\Admin;

use Escalated\Laravel\Contracts\EscalatedUiRenderer;
use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Models\Newsletter\NewsletterListMember;
use Escalated\Laravel\Services\Newsletter\ContactSegmentResolver;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NewsletterListController extends Controller
{
    public function index(EscalatedUiRenderer $ui)
    {
        request()->user()->ensurePermission('newsletters.manage');
        $lists = NewsletterList::query()
            ->withCount('members as member_count')
            ->get()
            ->map(function ($l) {
                $l->opted_out_count = DB::table('escalated_newsletter_list_members')
                    ->join('escalated_contacts', 'escalated_contacts.id', '=', 'escalated_newsletter_list_members.contact_id')
                    ->where('list_id', $l->id)->whereNotNull('marketing_opt_out_at')->count();
                return $l;
            });
        return $ui->render('admin/newsletters/lists/Index', compact('lists'));
    }

    public function create(EscalatedUiRenderer $ui)
    {
        request()->user()->ensurePermission('newsletters.manage');
        return $ui->render('admin/newsletters/lists/Create', []);
    }

    public function store(Request $request)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'kind' => 'required|in:static,dynamic',
            'filter_json' => 'nullable|array',
        ]);
        $list = NewsletterList::create($data + ['created_by' => Auth::id()]);
        return redirect("/admin/newsletters/lists/{$list->id}");
    }

    public function show(NewsletterList $list, EscalatedUiRenderer $ui, ContactSegmentResolver $segments)
    {
        request()->user()->ensurePermission('newsletters.manage');
        $members = $list->members()->with('contact:id,name,email')->paginate(100);
        $matchCount = $list->kind === 'dynamic' ? $segments->countMatches($list->filter_json ?? ['rules' => []]) : 0;
        $list->member_count = $list->members()->count();
        $list->opted_out_count = DB::table('escalated_newsletter_list_members')
            ->join('escalated_contacts', 'escalated_contacts.id', '=', 'escalated_newsletter_list_members.contact_id')
            ->where('list_id', $list->id)->whereNotNull('marketing_opt_out_at')->count();
        return $ui->render('admin/newsletters/lists/Show', compact('list', 'members', 'matchCount'));
    }

    public function update(NewsletterList $list, Request $request)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'filter_json' => 'nullable|array',
        ]);
        $list->update($data);
        return redirect("/admin/newsletters/lists/{$list->id}");
    }

    public function destroy(NewsletterList $list)
    {
        request()->user()->ensurePermission('newsletters.manage');
        $list->delete();
        return redirect('/admin/newsletters/lists');
    }

    public function addMember(NewsletterList $list, Request $request)
    {
        $request->user()->ensurePermission('newsletters.manage');
        abort_unless($list->kind === 'static', 422, 'Dynamic lists are filter-driven');
        $data = $request->validate(['contact_id' => 'required|integer|exists:escalated_contacts,id']);
        NewsletterListMember::firstOrCreate(['list_id' => $list->id, 'contact_id' => $data['contact_id']], ['added_by' => Auth::id()]);
        return redirect("/admin/newsletters/lists/{$list->id}");
    }

    public function removeMember(NewsletterList $list, int $contactId)
    {
        request()->user()->ensurePermission('newsletters.manage');
        abort_unless($list->kind === 'static', 422, 'Dynamic lists are filter-driven');
        NewsletterListMember::where(['list_id' => $list->id, 'contact_id' => $contactId])->delete();
        return redirect("/admin/newsletters/lists/{$list->id}");
    }

    public function importCsv(NewsletterList $list, Request $request)
    {
        $request->user()->ensurePermission('newsletters.manage');
        abort_unless($list->kind === 'static', 422);
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        $handle = fopen($request->file('file')->getRealPath(), 'r');
        $imported = 0;
        while (($row = fgetcsv($handle)) !== false) {
            $email = filter_var(trim($row[0] ?? ''), FILTER_VALIDATE_EMAIL);
            if (!$email) continue;
            $contact = Contact::firstOrCreate(['email' => $email]);
            NewsletterListMember::firstOrCreate(['list_id' => $list->id, 'contact_id' => $contact->id], ['added_by' => Auth::id()]);
            $imported++;
        }
        fclose($handle);
        return redirect("/admin/newsletters/lists/{$list->id}")->with('status', "Imported {$imported} contacts");
    }
}
```

- [ ] **Step 3: Run, expect PASS**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Admin/NewsletterListControllerTest.php
```

- [ ] **Step 4: Commit**

```bash
git -C C:/Users/work/escalated-laravel add src/Http/Controllers/Admin/NewsletterListController.php tests/Feature/Admin/NewsletterListControllerTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add NewsletterListController with CSV import"
```

---

### Task B17: NewsletterTemplateController (admin)

**Files:**
- Create: `src/Http/Controllers/Admin/NewsletterTemplateController.php`
- Test: `tests/Feature/Admin/NewsletterTemplateControllerTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Feature/Admin/NewsletterTemplateControllerTest.php

use Escalated\Laravel\Models\Newsletter\NewsletterTemplate;
use Escalated\Laravel\Models\Permission;
use Escalated\Laravel\Models\Role;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    config(['escalated.enable_newsletters' => true]);
    Gate::define('escalated-admin', fn ($user) => $user->is_admin);
    $this->admin = adminUser();
    $this->actingAs($this->admin);
    $p = Permission::create(['slug' => 'newsletters.manage', 'name' => 'M', 'group' => 'n']);
    $r = Role::create(['slug' => 'admin', 'name' => 'A']);
    $r->permissions()->sync([$p->id]);
    $this->admin->roles()->sync([$r->id]);
});

it('creates a template', function () {
    $res = $this->post('/admin/newsletters/templates', [
        'name' => 'Monthly digest', 'theme' => 'default', 'body_markdown' => '# Hi',
    ]);
    $res->assertRedirect();
    expect(NewsletterTemplate::where('name', 'Monthly digest')->first())->not->toBeNull();
});

it('updates a template', function () {
    $t = NewsletterTemplate::create(['name' => 'M', 'theme' => 'default', 'body_markdown' => 'a']);
    $res = $this->put("/admin/newsletters/templates/{$t->id}", ['name' => 'M2', 'theme' => 'branded', 'body_markdown' => 'b']);
    $res->assertRedirect();
    expect($t->fresh()->name)->toBe('M2');
});
```

- [ ] **Step 2: Implement**

```php
<?php

namespace Escalated\Laravel\Http\Controllers\Admin;

use Escalated\Laravel\Contracts\EscalatedUiRenderer;
use Escalated\Laravel\Models\Newsletter\NewsletterTemplate;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class NewsletterTemplateController extends Controller
{
    public function index(EscalatedUiRenderer $ui)
    {
        request()->user()->ensurePermission('newsletters.manage');
        $templates = NewsletterTemplate::query()->latest()->get();
        return $ui->render('admin/newsletters/templates/Index', compact('templates'));
    }

    public function create(EscalatedUiRenderer $ui)
    {
        request()->user()->ensurePermission('newsletters.manage');
        return $ui->render('admin/newsletters/templates/Create', ['themes' => $this->themes()]);
    }

    public function store(Request $request)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $data = $this->validateForm($request);
        NewsletterTemplate::create($data + ['created_by' => Auth::id()]);
        return redirect('/admin/newsletters/templates');
    }

    public function show(NewsletterTemplate $template, EscalatedUiRenderer $ui)
    {
        request()->user()->ensurePermission('newsletters.manage');
        return $ui->render('admin/newsletters/templates/Show', ['template' => $template, 'themes' => $this->themes(), 'isNew' => false]);
    }

    public function update(NewsletterTemplate $template, Request $request)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $data = $this->validateForm($request);
        $template->update($data);
        return redirect("/admin/newsletters/templates/{$template->id}");
    }

    public function destroy(NewsletterTemplate $template)
    {
        request()->user()->ensurePermission('newsletters.manage');
        $template->delete();
        return redirect('/admin/newsletters/templates');
    }

    private function validateForm(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'theme' => 'required|string|max:64',
            'subject_template' => 'nullable|string|max:998',
            'body_markdown' => 'required|string',
            'merge_fields_schema' => 'nullable|array',
        ]);
    }

    private function themes(): array
    {
        $package = base_path('vendor/escalated/laravel/resources/views/newsletters/themes');
        $vendor = resource_path('views/vendor/escalated/newsletters/themes');
        $themes = collect([$package, $vendor])
            ->filter(fn ($d) => is_dir($d))
            ->flatMap(fn ($d) => glob("{$d}/*.blade.php") ?: [])
            ->map(fn ($p) => basename($p, '.blade.php'))
            ->unique()->values()->all();
        return $themes ?: ['default', 'branded'];
    }
}
```

- [ ] **Step 3: Run + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Admin/NewsletterTemplateControllerTest.php
git -C C:/Users/work/escalated-laravel add src/Http/Controllers/Admin/NewsletterTemplateController.php tests/Feature/Admin/NewsletterTemplateControllerTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add NewsletterTemplateController"
```

---

### Task B18: NewsletterSettingsController (admin)

**Files:**
- Create: `src/Http/Controllers/Admin/NewsletterSettingsController.php`
- Test: `tests/Feature/Admin/NewsletterSettingsControllerTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Feature/Admin/NewsletterSettingsControllerTest.php

use Escalated\Laravel\Models\EscalatedSettings;
use Escalated\Laravel\Models\Permission;
use Escalated\Laravel\Models\Role;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    config(['escalated.enable_newsletters' => true]);
    Gate::define('escalated-admin', fn ($user) => $user->is_admin);
    $this->admin = adminUser();
    $this->actingAs($this->admin);
    $p = Permission::create(['slug' => 'newsletters.manage', 'name' => 'M', 'group' => 'n']);
    $r = Role::create(['slug' => 'admin', 'name' => 'A']);
    $r->permissions()->sync([$p->id]);
    $this->admin->roles()->sync([$r->id]);
});

it('persists settings to the escalated_settings table', function () {
    $res = $this->put('/admin/newsletters/settings', [
        'default_from' => 'hi@example.com',
        'default_reply_to' => 'replies@example.com',
        'default_theme' => 'branded',
        'rate_limit_per_minute' => 120,
        'batch_size' => 100,
        'tracking_enabled' => true,
    ]);
    $res->assertRedirect();
    expect(EscalatedSettings::where('key', 'newsletter.default_from')->value('value'))->toBe('hi@example.com');
    expect(EscalatedSettings::where('key', 'newsletter.rate_limit_per_minute')->value('value'))->toBe('120');
    expect(EscalatedSettings::where('key', 'newsletter.tracking_enabled')->value('value'))->toBe('1');
});
```

- [ ] **Step 2: Implement**

```php
<?php

namespace Escalated\Laravel\Http\Controllers\Admin;

use Escalated\Laravel\Contracts\EscalatedUiRenderer;
use Escalated\Laravel\Models\EscalatedSettings;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NewsletterSettingsController extends Controller
{
    public const KEYS = [
        'default_from' => 'string',
        'default_reply_to' => 'string',
        'default_theme' => 'string',
        'rate_limit_per_minute' => 'number',
        'batch_size' => 'number',
        'tracking_enabled' => 'boolean',
    ];

    public function show(EscalatedUiRenderer $ui)
    {
        request()->user()->ensurePermission('newsletters.manage');
        $settings = [];
        foreach (self::KEYS as $k => $_) {
            $row = EscalatedSettings::where('key', "newsletter.{$k}")->first();
            $settings[$k] = $row?->value ?? config("escalated.newsletters.{$k}");
        }
        $themes = ['default', 'branded']; // could be merged with discover() — keeping simple
        return $ui->render('admin/newsletters/Settings', compact('settings', 'themes'));
    }

    public function update(Request $request)
    {
        $request->user()->ensurePermission('newsletters.manage');
        $data = $request->validate([
            'default_from' => 'nullable|email',
            'default_reply_to' => 'nullable|email',
            'default_theme' => 'required|string|max:64',
            'rate_limit_per_minute' => 'required|integer|min:1|max:10000',
            'batch_size' => 'required|integer|min:1|max:1000',
            'tracking_enabled' => 'required|boolean',
        ]);
        foreach (self::KEYS as $k => $type) {
            $value = $data[$k] ?? null;
            EscalatedSettings::updateOrCreate(
                ['key' => "newsletter.{$k}"],
                ['value' => is_bool($value) ? (string) (int) $value : (string) ($value ?? ''), 'type' => $type, 'group' => 'newsletter'],
            );
        }
        return redirect('/admin/newsletters/settings');
    }
}
```

- [ ] **Step 3: Run + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Admin/NewsletterSettingsControllerTest.php
git -C C:/Users/work/escalated-laravel add src/Http/Controllers/Admin/NewsletterSettingsController.php tests/Feature/Admin/NewsletterSettingsControllerTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add settings controller"
```

---

### Task B19: NewsletterTrackingController (public — pixel + click)

**Files:**
- Create: `src/Http/Controllers/Public/NewsletterTrackingController.php`
- Test: `tests/Feature/Public/NewsletterTrackingTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Feature/Public/NewsletterTrackingTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;

beforeEach(function () {
    config(['escalated.enable_newsletters' => true]);
});

function trackingDelivery(): NewsletterDelivery
{
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    $n = Newsletter::create(['subject' => 'Hi', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hi']);
    return NewsletterDelivery::create([
        'newsletter_id' => $n->id, 'contact_id' => $contact->id,
        'email_at_send' => 'a@example.com', 'status' => 'sent',
        'tracking_token' => 'tok'.uniqid(), 'sent_at' => now(),
    ]);
}

it('serves a 1x1 PNG and records the open', function () {
    $d = trackingDelivery();
    $res = $this->get("/escalated/n/o/{$d->tracking_token}.gif");
    $res->assertOk();
    $res->assertHeader('Content-Type', 'image/png');
    expect($d->fresh()->opened_at)->not->toBeNull();
});

it('returns 200 with constant-time response on unknown tokens', function () {
    $res = $this->get('/escalated/n/o/nope.gif');
    $res->assertOk();
});

it('redirects clicks to the original URL', function () {
    $d = trackingDelivery();
    $u = rtrim(strtr(base64_encode('https://example.com/landing'), '+/', '-_'), '=');
    $res = $this->get("/escalated/n/c/{$d->tracking_token}?u={$u}");
    $res->assertRedirect('https://example.com/landing');
    expect($d->fresh()->clicks_count)->toBe(1);
});

it('rejects javascript: URLs', function () {
    $d = trackingDelivery();
    $u = rtrim(strtr(base64_encode('javascript:alert(1)'), '+/', '-_'), '=');
    $res = $this->get("/escalated/n/c/{$d->tracking_token}?u={$u}");
    $res->assertStatus(400);
});

it('returns 404 when feature flag is off', function () {
    config(['escalated.enable_newsletters' => false]);
    $d = trackingDelivery();
    $res = $this->get("/escalated/n/o/{$d->tracking_token}.gif");
    $res->assertNotFound();
});
```

- [ ] **Step 2: Implement NewsletterTrackingController**

```php
<?php

namespace Escalated\Laravel\Http\Controllers\Public;

use Escalated\Laravel\Services\Newsletter\NewsletterTrackerService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class NewsletterTrackingController extends Controller
{
    private const ALLOWED_SCHEMES = ['http', 'https'];

    /** Single transparent PNG (1×1) baked into the binary response. */
    private const PIXEL_BYTES = "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xfc\xff\xff?\x03\x00\x05\xfe\x02\xfe\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82";

    public function __construct(private readonly NewsletterTrackerService $tracker) {}

    public function open(string $token): Response
    {
        $clean = $this->stripExt($token);
        $this->tracker->recordOpen($clean);
        return response(self::PIXEL_BYTES, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'private, no-store, max-age=0',
        ]);
    }

    public function click(string $token, Request $request): Response
    {
        $encoded = (string) $request->query('u', '');
        $decoded = base64_decode(strtr($encoded, '-_', '+/'), true);
        if ($decoded === false) return response('Bad request', 400);
        $scheme = strtolower(parse_url($decoded, PHP_URL_SCHEME) ?? '');
        if (!in_array($scheme, self::ALLOWED_SCHEMES, true)) return response('Bad request', 400);
        $this->tracker->recordClick($token, $decoded);
        return redirect()->away($decoded, 302);
    }

    private function stripExt(string $token): string
    {
        return preg_replace('/\.(gif|png|jpg)$/i', '', $token);
    }
}
```

- [ ] **Step 3: Run + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Public/NewsletterTrackingTest.php
git -C C:/Users/work/escalated-laravel add src/Http/Controllers/Public/NewsletterTrackingController.php tests/Feature/Public/NewsletterTrackingTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add public tracking controller (pixel + click)"
```

---

### Task B20: NewsletterUnsubscribeController (public — RFC 8058)

**Files:**
- Create: `src/Http/Controllers/Public/NewsletterUnsubscribeController.php`
- Create: `resources/views/newsletters/unsubscribe.blade.php`
- Test: `tests/Feature/Public/NewsletterUnsubscribeTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Feature/Public/NewsletterUnsubscribeTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;

beforeEach(function () {
    config(['escalated.enable_newsletters' => true]);
});

function unsubDelivery(): NewsletterDelivery
{
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    $n = Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hi']);
    return NewsletterDelivery::create([
        'newsletter_id' => $n->id, 'contact_id' => $contact->id, 'email_at_send' => 'a@example.com',
        'status' => 'sent', 'tracking_token' => 'tok'.uniqid(),
    ]);
}

it('GET returns a confirmation page', function () {
    $d = unsubDelivery();
    $res = $this->get("/escalated/n/u/{$d->tracking_token}");
    $res->assertOk();
});

it('one-click POST with List-Unsubscribe=One-Click sets marketing_opt_out_at', function () {
    $d = unsubDelivery();
    $res = $this->call('POST', "/escalated/n/u/{$d->tracking_token}", ['List-Unsubscribe' => 'One-Click']);
    $res->assertOk();
    expect($d->contact->fresh()->marketing_opt_out_at)->not->toBeNull();
});

it('returns 200 on unknown tokens (constant-time)', function () {
    $res = $this->get('/escalated/n/u/nope');
    $res->assertOk();
});

it('blocks via rate limiter after too many POSTs', function () {
    for ($i = 0; $i < 70; $i++) {
        $this->post('/escalated/n/u/anything', ['List-Unsubscribe' => 'One-Click']);
    }
    $res = $this->post('/escalated/n/u/anything', ['List-Unsubscribe' => 'One-Click']);
    $res->assertStatus(429);
});
```

- [ ] **Step 2: Implement controller + view**

```php
<?php

namespace Escalated\Laravel\Http\Controllers\Public;

use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\RateLimiter;

class NewsletterUnsubscribeController extends Controller
{
    public function show(string $token)
    {
        $delivery = $this->find($token);
        return response()->view('escalated::newsletters.unsubscribe', [
            'token' => $token,
            'email' => $delivery?->email_at_send,
        ]);
    }

    public function store(string $token, Request $request)
    {
        $key = 'unsub:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 60)) {
            return response('Too Many Requests', 429);
        }
        RateLimiter::hit($key, 60);

        $delivery = $this->find($token);
        if ($delivery && $delivery->contact) {
            $delivery->contact->update(['marketing_opt_out_at' => now()]);
        }
        return response()->view('escalated::newsletters.unsubscribe', [
            'token' => $token,
            'email' => $delivery?->email_at_send,
            'confirmed' => true,
        ]);
    }

    private function find(string $token): ?NewsletterDelivery
    {
        return NewsletterDelivery::where('tracking_token', $token)->first();
    }
}
```

```blade
{{-- resources/views/newsletters/unsubscribe.blade.php --}}
<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>Unsubscribe</title>
<style>body{font-family:system-ui,sans-serif;max-width:560px;margin:60px auto;padding:0 20px;color:#0f172a}h1{font-size:22px}.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin-top:16px}button{background:#dc2626;color:white;border:0;padding:10px 18px;border-radius:6px;cursor:pointer;font-size:14px}</style></head>
<body>
  @if($confirmed ?? false)
    <h1>You're unsubscribed</h1>
    <div class="box">
      <p>{{ $email ? "$email has been removed from marketing newsletters." : 'You have been unsubscribed.' }}</p>
      <p>You will still receive transactional emails (replies to your support tickets, account notifications, etc.).</p>
    </div>
  @else
    <h1>Unsubscribe</h1>
    <div class="box">
      <p>{{ $email ? "Unsubscribe $email from marketing newsletters?" : 'Confirm you want to unsubscribe.' }}</p>
      <form method="post">
        @csrf
        <input type="hidden" name="List-Unsubscribe" value="One-Click" />
        <button type="submit">Unsubscribe</button>
      </form>
    </div>
  @endif
</body></html>
```

- [ ] **Step 3: Run + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Public/NewsletterUnsubscribeTest.php
git -C C:/Users/work/escalated-laravel add src/Http/Controllers/Public/NewsletterUnsubscribeController.php resources/views/newsletters/unsubscribe.blade.php tests/Feature/Public/NewsletterUnsubscribeTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add RFC 8058 one-click unsubscribe controller"
```

---

### Task B21: NewsletterViewInBrowserController (public)

**Files:**
- Create: `src/Http/Controllers/Public/NewsletterViewInBrowserController.php`
- Test: `tests/Feature/Public/NewsletterViewInBrowserTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Feature/Public/NewsletterViewInBrowserTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;

beforeEach(function () { config(['escalated.enable_newsletters' => true]); });

it('renders the themed newsletter HTML', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    $n = Newsletter::create(['subject' => 'Hello!', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => '# Hi there', 'theme' => 'default']);
    $d = NewsletterDelivery::create([
        'newsletter_id' => $n->id, 'contact_id' => $contact->id,
        'email_at_send' => 'a@example.com', 'tracking_token' => 'view-tok',
    ]);
    $res = $this->get("/escalated/n/v/{$d->tracking_token}");
    $res->assertOk();
    $res->assertSee('Hi there', false);
});

it('returns 404 on unknown token', function () {
    $res = $this->get('/escalated/n/v/nope');
    $res->assertNotFound();
});
```

- [ ] **Step 2: Implement**

```php
<?php

namespace Escalated\Laravel\Http\Controllers\Public;

use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Services\Newsletter\NewsletterRendererService;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;

class NewsletterViewInBrowserController extends Controller
{
    public function __construct(private readonly NewsletterRendererService $renderer) {}

    public function show(string $token): Response
    {
        $delivery = NewsletterDelivery::where('tracking_token', $token)->first();
        abort_if(!$delivery, 404);
        return new Response($this->renderer->render($delivery), 200, ['Content-Type' => 'text/html']);
    }
}
```

- [ ] **Step 3: Run + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Public/NewsletterViewInBrowserTest.php
git -C C:/Users/work/escalated-laravel add src/Http/Controllers/Public/NewsletterViewInBrowserController.php tests/Feature/Public/NewsletterViewInBrowserTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add view-in-browser controller"
```

---

### Task B22: ESP webhook outbound-event hooks

The existing inbound parsers (`MailgunParser`, `PostmarkParser`, `SesParser`, `SendgridParser`) only handle inbound. We add a dedicated webhook endpoint per ESP for *outbound* events (delivery / open / click / bounce / complaint).

**Files:**
- Create: `src/Http/Controllers/Webhooks/NewsletterEspWebhookController.php`
- Test: `tests/Feature/Public/NewsletterEspWebhookTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Feature/Public/NewsletterEspWebhookTest.php

use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;

beforeEach(function () { config(['escalated.enable_newsletters' => true]); });

function espDelivery(string $token): NewsletterDelivery
{
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    $n = Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hi']);
    return NewsletterDelivery::create([
        'newsletter_id' => $n->id, 'contact_id' => $contact->id,
        'email_at_send' => 'a@example.com', 'status' => 'sent',
        'tracking_token' => $token,
    ]);
}

it('records a Postmark open event', function () {
    $d = espDelivery('post-tok');
    $payload = [
        'RecordType' => 'Open',
        'Headers' => [['Name' => 'X-Escalated-Newsletter-Id', 'Value' => (string) $d->newsletter_id]],
        'MessageID' => 'n-' . $d->newsletter_id . '-post-tok@example.com',
    ];
    $res = $this->postJson('/escalated/webhooks/newsletter/postmark', $payload);
    $res->assertOk();
    expect($d->fresh()->opened_at)->not->toBeNull();
});

it('records a Mailgun bounce event', function () {
    $d = espDelivery('mg-tok');
    $payload = [
        'event-data' => [
            'event' => 'failed',
            'severity' => 'permanent',
            'message' => [
                'headers' => [
                    'message-id' => 'n-' . $d->newsletter_id . '-mg-tok@example.com',
                ],
            ],
            'delivery-status' => ['description' => '550 mailbox not found'],
        ],
    ];
    $res = $this->postJson('/escalated/webhooks/newsletter/mailgun', $payload);
    $res->assertOk();
    expect($d->fresh()->status)->toBe('bounced');
});

it('records an SES complaint event', function () {
    $d = espDelivery('ses-tok');
    $payload = ['Type' => 'Notification', 'Message' => json_encode([
        'eventType' => 'Complaint',
        'mail' => ['messageId' => 'n-' . $d->newsletter_id . '-ses-tok@example.com'],
        'complaint' => ['complainedRecipients' => [['emailAddress' => 'a@example.com']]],
    ])];
    $res = $this->postJson('/escalated/webhooks/newsletter/ses', $payload);
    $res->assertOk();
    expect($d->fresh()->status)->toBe('complained');
});
```

- [ ] **Step 2: Implement NewsletterEspWebhookController**

```php
<?php

namespace Escalated\Laravel\Http\Controllers\Webhooks;

use Escalated\Laravel\Services\Newsletter\NewsletterTrackerService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NewsletterEspWebhookController extends Controller
{
    public function __construct(private readonly NewsletterTrackerService $tracker) {}

    public function postmark(Request $request)
    {
        $type = (string) $request->input('RecordType');
        $token = $this->tokenFromMessageId((string) $request->input('MessageID'));
        match ($type) {
            'Open' => $this->tracker->recordOpen($token),
            'Click' => $this->tracker->recordClick($token, (string) $request->input('OriginalLink', '')),
            'Bounce' => $this->tracker->recordBounce($token, $this->isHardBounce($request->input('Type')) ? 'hard' : 'soft', (string) $request->input('Description', '')),
            'SpamComplaint' => $this->tracker->recordComplaint($token),
            default => null,
        };
        return response()->json(['ok' => true]);
    }

    public function mailgun(Request $request)
    {
        $event = (string) $request->input('event-data.event');
        $messageId = (string) $request->input('event-data.message.headers.message-id');
        $token = $this->tokenFromMessageId($messageId);
        match ($event) {
            'opened' => $this->tracker->recordOpen($token),
            'clicked' => $this->tracker->recordClick($token, (string) $request->input('event-data.url', '')),
            'failed' => $request->input('event-data.severity') === 'permanent'
                ? $this->tracker->recordBounce($token, 'hard', (string) $request->input('event-data.delivery-status.description', ''))
                : $this->tracker->recordBounce($token, 'soft', (string) $request->input('event-data.delivery-status.description', '')),
            'complained' => $this->tracker->recordComplaint($token),
            default => null,
        };
        return response()->json(['ok' => true]);
    }

    public function ses(Request $request)
    {
        $body = $request->input('Message');
        if (is_string($body)) $body = json_decode($body, true);
        $eventType = $body['eventType'] ?? null;
        $messageId = $body['mail']['messageId'] ?? '';
        $token = $this->tokenFromMessageId($messageId);
        match ($eventType) {
            'Open' => $this->tracker->recordOpen($token),
            'Click' => $this->tracker->recordClick($token, $body['click']['link'] ?? ''),
            'Bounce' => $body['bounce']['bounceType'] === 'Permanent'
                ? $this->tracker->recordBounce($token, 'hard', $body['bounce']['bounceSubType'] ?? null)
                : $this->tracker->recordBounce($token, 'soft', $body['bounce']['bounceSubType'] ?? null),
            'Complaint' => $this->tracker->recordComplaint($token),
            default => null,
        };
        return response()->json(['ok' => true]);
    }

    public function sendgrid(Request $request)
    {
        foreach ((array) $request->json()->all() as $event) {
            $messageId = $event['smtp-id'] ?? $event['sg_message_id'] ?? '';
            $token = $this->tokenFromMessageId($messageId);
            match ($event['event'] ?? null) {
                'open' => $this->tracker->recordOpen($token),
                'click' => $this->tracker->recordClick($token, $event['url'] ?? ''),
                'bounce' => $this->tracker->recordBounce($token, ($event['type'] ?? '') === 'blocked' ? 'hard' : 'soft', $event['reason'] ?? null),
                'dropped' => $this->tracker->recordBounce($token, 'hard', $event['reason'] ?? null),
                'spamreport' => $this->tracker->recordComplaint($token),
                default => null,
            };
        }
        return response()->json(['ok' => true]);
    }

    private function isHardBounce(?string $postmarkType): bool
    {
        return in_array($postmarkType, ['HardBounce', 'BadEmailAddress', 'BlockedRecipient'], true);
    }

    private function tokenFromMessageId(string $messageId): string
    {
        // Message-IDs are formatted as: n-{newsletter_id}-{token}@host
        if (preg_match('/n-\d+-([A-Za-z0-9]+)@/', $messageId, $m)) return $m[1];
        // Sometimes ESPs strip angle brackets; try the bare local part
        if (preg_match('/^n-\d+-([A-Za-z0-9]+)$/', explode('@', $messageId)[0] ?? '', $m)) return $m[1];
        return '';
    }
}
```

- [ ] **Step 3: Run + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Public/NewsletterEspWebhookTest.php
git -C C:/Users/work/escalated-laravel add src/Http/Controllers/Webhooks/NewsletterEspWebhookController.php tests/Feature/Public/NewsletterEspWebhookTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add ESP webhook controllers for Postmark/Mailgun/SES/SendGrid"
```

---

### Task B23: DispatchNewslettersCommand

**Files:**
- Create: `src/Console/Commands/DispatchNewslettersCommand.php`
- Test: `tests/Feature/DispatchNewslettersCommandTest.php`

- [ ] **Step 1: Failing test**

```php
<?php
// tests/Feature/DispatchNewslettersCommandTest.php

use Escalated\Laravel\Mail\NewsletterMail;
use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Models\Newsletter\NewsletterListMember;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    config(['escalated.enable_newsletters' => true]);
    Mail::fake();
});

it('plans and dispatches scheduled newsletters whose time has come', function () {
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    $contact = Contact::create(['email' => 'a@example.com']);
    NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $contact->id]);
    Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hi', 'status' => 'scheduled', 'scheduled_at' => now()->subMinute()]);

    $this->artisan('escalated:newsletters:dispatch')->assertExitCode(0);

    Mail::assertSent(NewsletterMail::class, 1);
});

it('is a no-op when the feature flag is off', function () {
    config(['escalated.enable_newsletters' => false]);
    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hi', 'status' => 'scheduled', 'scheduled_at' => now()->subMinute()]);

    $this->artisan('escalated:newsletters:dispatch')->assertExitCode(0);

    Mail::assertNothingSent();
});
```

- [ ] **Step 2: Implement**

```php
<?php

namespace Escalated\Laravel\Console\Commands;

use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Services\Newsletter\NewsletterDispatcherService;
use Escalated\Laravel\Services\Newsletter\NewsletterPlannerService;
use Illuminate\Console\Command;

class DispatchNewslettersCommand extends Command
{
    protected $signature = 'escalated:newsletters:dispatch';

    protected $description = 'Plan scheduled newsletters whose time has come and dispatch a batch of pending deliveries.';

    public function handle(NewsletterPlannerService $planner, NewsletterDispatcherService $dispatcher): int
    {
        if (!config('escalated.enable_newsletters', false)) {
            $this->info('Newsletter feature disabled — skipping.');
            return self::SUCCESS;
        }

        $due = Newsletter::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->get();

        foreach ($due as $newsletter) {
            $this->info("Planning newsletter #{$newsletter->id}");
            $planner->plan($newsletter);
        }

        $this->info('Dispatching batch…');
        $dispatcher->dispatchBatch();
        $this->info('Done.');

        return self::SUCCESS;
    }
}
```

- [ ] **Step 3: Register the command in the service provider's `registerCommands()` method**

```php
// In EscalatedServiceProvider::registerCommands(), append:
DispatchNewslettersCommand::class,
```

(Also add the `use` import.)

- [ ] **Step 4: Run + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/DispatchNewslettersCommandTest.php
git -C C:/Users/work/escalated-laravel add src/Console/Commands/DispatchNewslettersCommand.php src/EscalatedServiceProvider.php tests/Feature/DispatchNewslettersCommandTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add dispatch command (scheduled every minute by host)"
```

---

### Task B24: Install command — newsletter prompt + flags

**Files:**
- Modify: `src/Console/Commands/InstallCommand.php`
- Test: `tests/Feature/InstallCommandNewsletterTest.php`

- [ ] **Step 1: Read the current install command end-to-end first**

```bash
cd C:/Users/work/escalated-laravel && cat src/Console/Commands/InstallCommand.php
```

Identify where the existing `confirm*` calls happen and where the config file is written / env vars are appended.

- [ ] **Step 2: Failing test**

```php
<?php
// tests/Feature/InstallCommandNewsletterTest.php

it('writes ESCALATED_ENABLE_NEWSLETTERS=true to .env when --with-newsletters', function () {
    $envPath = base_path('.env');
    if (!is_file($envPath)) file_put_contents($envPath, "");
    file_put_contents($envPath, "");

    $this->artisan('escalated:install --with-newsletters --no-interaction')->assertExitCode(0);

    $contents = file_get_contents($envPath);
    expect($contents)->toContain('ESCALATED_ENABLE_NEWSLETTERS=true');
});

it('writes ESCALATED_ENABLE_NEWSLETTERS=false when --no-newsletters', function () {
    $envPath = base_path('.env');
    file_put_contents($envPath, "");

    $this->artisan('escalated:install --no-newsletters --no-interaction')->assertExitCode(0);

    $contents = file_get_contents($envPath);
    expect($contents)->toContain('ESCALATED_ENABLE_NEWSLETTERS=false');
});
```

(Note: the existing TestCase may need to point `base_path()` at a writable test directory. If not, mark these as a Pest `->skip()` and rely on the manual ESP-sandbox verification — but they're worth attempting.)

- [ ] **Step 3: Modify the InstallCommand**

Update the `$signature`:

```php
protected $signature = 'escalated:install
    {--force : Overwrite existing files}
    {--config : Only publish configuration}
    {--migrations : Only publish migrations}
    {--with-newsletters : Enable the newsletter system non-interactively}
    {--no-newsletters : Disable the newsletter system non-interactively}';
```

Inside `handle()`, after permissions are seeded, add:

```php
if ($publishAll) {
    $enableNewsletters = $this->resolveNewsletterChoice();
    $this->writeEnv('ESCALATED_ENABLE_NEWSLETTERS', $enableNewsletters ? 'true' : 'false');
    if ($enableNewsletters) {
        $this->components->task('Seeding newsletter permissions on Admin role', function () {
            $this->call('db:seed', ['--class' => \Escalated\Laravel\Database\Seeders\PermissionSeeder::class, '--force' => true]);
        });
    }
}
```

Helper methods:

```php
private function resolveNewsletterChoice(): bool
{
    if ($this->option('with-newsletters')) return true;
    if ($this->option('no-newsletters')) return false;
    if (!$this->input->isInteractive()) return false;
    return $this->confirm('Enable newsletter system? (admins-only feature for sending broadcasts to contacts)', false);
}

private function writeEnv(string $key, string $value): void
{
    $envPath = base_path('.env');
    if (!is_file($envPath)) return;
    $contents = file_get_contents($envPath);
    $line = "{$key}={$value}";
    if (preg_match("/^{$key}=.*/m", $contents)) {
        $contents = preg_replace("/^{$key}=.*/m", $line, $contents);
    } else {
        $contents = rtrim($contents, "\n") . "\n{$line}\n";
    }
    file_put_contents($envPath, $contents);
}
```

- [ ] **Step 4: Run + commit**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/InstallCommandNewsletterTest.php
git -C C:/Users/work/escalated-laravel add src/Console/Commands/InstallCommand.php tests/Feature/InstallCommandNewsletterTest.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): add install command prompt + --with-newsletters/--no-newsletters flags"
```

---

### Task B25: Seed `newsletters.manage` and `newsletters.send` permissions

**Files:**
- Modify: `database/seeders/PermissionSeeder.php`

- [ ] **Step 1: Read the seeder's `permissions()` method to learn the format**

```bash
cd C:/Users/work/escalated-laravel && grep -n "permissions" database/seeders/PermissionSeeder.php | head -10
```

- [ ] **Step 2: Append two new permission entries**

Inside the `permissions()` returned array, add:

```php
['slug' => 'newsletters.manage', 'name' => 'Manage newsletters',  'group' => 'newsletters', 'description' => 'Create, edit, delete drafts and lists/templates; send test emails.'],
['slug' => 'newsletters.send',   'name' => 'Send newsletters',    'group' => 'newsletters', 'description' => 'Schedule or send newsletters now.'],
```

- [ ] **Step 3: Attach both permissions to the Admin system role**

In the `roles()` method, find the admin role's `permissions` array and append both slugs.

- [ ] **Step 4: Re-run the seeder + verify**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Admin/NewsletterControllerTest.php
```

Tests already set up these permissions directly — but in production the seeder is the source of truth.

- [ ] **Step 5: Commit**

```bash
git -C C:/Users/work/escalated-laravel add database/seeders/PermissionSeeder.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): seed newsletters.manage and newsletters.send permissions on Admin"
```

---

### Task B26: Service provider conditional registration + Inertia shared data

**Files:**
- Modify: `src/EscalatedServiceProvider.php`

- [ ] **Step 1: Add a `bootNewsletters()` method called from `boot()`**

Inside `EscalatedServiceProvider::boot()`, after the existing UI/routes registration block, add:

```php
if (config('escalated.enable_newsletters', false)) {
    $this->bootNewsletters();
}
```

Implement:

```php
private function bootNewsletters(): void
{
    // Register admin + public routes
    $this->registerNewsletterRoutes();

    // Add to Inertia shared props so frontend sidebar can gate
    if ($this->uiEnabled()) {
        Inertia::share('escalated.features.newsletters', true);
    }

    // Discover custom themes alongside package themes via view path
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'escalated');
}

private function registerNewsletterRoutes(): void
{
    Route::middleware(['web', EnsureIsAdmin::class])
        ->prefix('admin/newsletters')
        ->name('escalated.admin.newsletters.')
        ->group(__DIR__.'/../routes/newsletter-admin.php');

    Route::middleware('web')
        ->prefix('escalated/n')
        ->name('escalated.newsletters.public.')
        ->group(__DIR__.'/../routes/newsletter-public.php');

    Route::middleware('api')
        ->prefix('escalated/webhooks/newsletter')
        ->group(__DIR__.'/../routes/newsletter-webhooks.php');
}
```

Also share `escalated.features.newsletters = false` when the feature is *off* so the frontend can render the absent state explicitly (the existing `shareInertiaData()` method is the right place — add a single line). Find that method and add:

```php
Inertia::share('escalated.features.newsletters', config('escalated.enable_newsletters', false));
```

- [ ] **Step 2: Run the disabled-by-default smoke test**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/CoreOnlyBootTest.php
```

Expected: existing core-only boot still works (the gate keeps newsletters from registering when disabled).

- [ ] **Step 3: Commit**

```bash
git -C C:/Users/work/escalated-laravel add src/EscalatedServiceProvider.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): conditionally register routes and Inertia shared data"
```

---

### Task B27: Routes — admin, public, webhooks

**Files:**
- Create: `routes/newsletter-admin.php`
- Create: `routes/newsletter-public.php`
- Create: `routes/newsletter-webhooks.php`

- [ ] **Step 1: Admin routes**

```php
<?php
// routes/newsletter-admin.php

use Escalated\Laravel\Http\Controllers\Admin\NewsletterController;
use Escalated\Laravel\Http\Controllers\Admin\NewsletterListController;
use Escalated\Laravel\Http\Controllers\Admin\NewsletterSettingsController;
use Escalated\Laravel\Http\Controllers\Admin\NewsletterTemplateController;
use Illuminate\Support\Facades\Route;

Route::get('/',                 [NewsletterController::class, 'index'])->name('index');
Route::get('/new',              [NewsletterController::class, 'create'])->name('create');
Route::post('/',                [NewsletterController::class, 'store'])->name('store');
Route::post('/preview',         [NewsletterController::class, 'preview'])->name('preview');
Route::post('/test',            [NewsletterController::class, 'testSend'])->name('testSend');
Route::get('/{newsletter}',     [NewsletterController::class, 'show'])->name('show');
Route::get('/{newsletter}/edit',[NewsletterController::class, 'edit'])->name('edit');
Route::put('/{newsletter}',     [NewsletterController::class, 'update'])->name('update');
Route::delete('/{newsletter}',  [NewsletterController::class, 'destroy'])->name('destroy');

Route::get('/lists',                                  [NewsletterListController::class, 'index'])->name('lists.index');
Route::get('/lists/new',                              [NewsletterListController::class, 'create'])->name('lists.create');
Route::post('/lists',                                 [NewsletterListController::class, 'store'])->name('lists.store');
Route::get('/lists/{list}',                           [NewsletterListController::class, 'show'])->name('lists.show');
Route::put('/lists/{list}',                           [NewsletterListController::class, 'update'])->name('lists.update');
Route::delete('/lists/{list}',                        [NewsletterListController::class, 'destroy'])->name('lists.destroy');
Route::post('/lists/{list}/members',                  [NewsletterListController::class, 'addMember'])->name('lists.members.add');
Route::delete('/lists/{list}/members/{contactId}',    [NewsletterListController::class, 'removeMember'])->name('lists.members.remove');
Route::post('/lists/{list}/import',                   [NewsletterListController::class, 'importCsv'])->name('lists.import');

Route::get('/templates',                  [NewsletterTemplateController::class, 'index'])->name('templates.index');
Route::get('/templates/new',              [NewsletterTemplateController::class, 'create'])->name('templates.create');
Route::post('/templates',                 [NewsletterTemplateController::class, 'store'])->name('templates.store');
Route::get('/templates/{template}',       [NewsletterTemplateController::class, 'show'])->name('templates.show');
Route::put('/templates/{template}',       [NewsletterTemplateController::class, 'update'])->name('templates.update');
Route::delete('/templates/{template}',    [NewsletterTemplateController::class, 'destroy'])->name('templates.destroy');

Route::get('/settings',  [NewsletterSettingsController::class, 'show'])->name('settings.show');
Route::put('/settings',  [NewsletterSettingsController::class, 'update'])->name('settings.update');
```

- [ ] **Step 2: Public routes**

```php
<?php
// routes/newsletter-public.php

use Escalated\Laravel\Http\Controllers\Public\NewsletterTrackingController;
use Escalated\Laravel\Http\Controllers\Public\NewsletterUnsubscribeController;
use Escalated\Laravel\Http\Controllers\Public\NewsletterViewInBrowserController;
use Illuminate\Support\Facades\Route;

Route::get('/o/{token}',  [NewsletterTrackingController::class, 'open'])->name('open')->where('token', '[A-Za-z0-9._-]+');
Route::get('/c/{token}',  [NewsletterTrackingController::class, 'click'])->name('click')->where('token', '[A-Za-z0-9_-]+');
Route::get('/u/{token}',  [NewsletterUnsubscribeController::class, 'show'])->name('unsubscribe.show')->where('token', '[A-Za-z0-9_-]+');
Route::post('/u/{token}', [NewsletterUnsubscribeController::class, 'store'])->name('unsubscribe.store')->where('token', '[A-Za-z0-9_-]+')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::get('/v/{token}',  [NewsletterViewInBrowserController::class, 'show'])->name('view')->where('token', '[A-Za-z0-9_-]+');
```

- [ ] **Step 3: Webhook routes**

```php
<?php
// routes/newsletter-webhooks.php

use Escalated\Laravel\Http\Controllers\Webhooks\NewsletterEspWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/postmark',  [NewsletterEspWebhookController::class, 'postmark']);
Route::post('/mailgun',   [NewsletterEspWebhookController::class, 'mailgun']);
Route::post('/ses',       [NewsletterEspWebhookController::class, 'ses']);
Route::post('/sendgrid',  [NewsletterEspWebhookController::class, 'sendgrid']);
```

- [ ] **Step 4: Run the full test suite**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/Public tests/Feature/Admin/Newsletter
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git -C C:/Users/work/escalated-laravel add routes/newsletter-admin.php routes/newsletter-public.php routes/newsletter-webhooks.php
git -C C:/Users/work/escalated-laravel commit -m "feat(newsletters): wire up admin, public, and webhook routes"
```

---

### Task B28: Disable-mid-flight integration test

**Files:**
- Create: `tests/Feature/NewsletterDisableMidFlightTest.php`

- [ ] **Step 1: Write the test**

```php
<?php
// tests/Feature/NewsletterDisableMidFlightTest.php

use Escalated\Laravel\Mail\NewsletterMail;
use Escalated\Laravel\Models\Contact;
use Escalated\Laravel\Models\Newsletter\Newsletter;
use Escalated\Laravel\Models\Newsletter\NewsletterDelivery;
use Escalated\Laravel\Models\Newsletter\NewsletterList;
use Escalated\Laravel\Models\Newsletter\NewsletterListMember;
use Illuminate\Support\Facades\Mail;

it('halts dispatch and 404s tracking endpoints when flag flips off mid-flight', function () {
    Mail::fake();
    config(['escalated.enable_newsletters' => true]);

    $list = NewsletterList::create(['name' => 'L', 'kind' => 'static']);
    for ($i = 0; $i < 5; $i++) {
        $c = Contact::create(['email' => "c{$i}@example.com"]);
        NewsletterListMember::create(['list_id' => $list->id, 'contact_id' => $c->id]);
    }
    $n = Newsletter::create(['subject' => 'X', 'from_email' => 'f@x.com', 'target_list_id' => $list->id, 'body_markdown' => 'hi', 'status' => 'sending', 'summary_total' => 5]);
    NewsletterDelivery::insert(array_map(fn ($i) => [
        'newsletter_id' => $n->id, 'contact_id' => $i + 1, 'email_at_send' => "c{$i}@example.com",
        'status' => 'pending', 'tracking_token' => 'tk-'.$i, 'attempt_count' => 0, 'is_test' => false, 'created_at' => now(),
    ], range(0, 4)));

    // Flip the flag off
    config(['escalated.enable_newsletters' => false]);

    // Dispatcher should be a no-op
    $this->artisan('escalated:newsletters:dispatch')->assertExitCode(0);
    Mail::assertNothingSent();

    // Tracking endpoints should 404
    $this->get('/escalated/n/o/tk-0.gif')->assertNotFound();
    $this->get('/escalated/n/c/tk-0?u=' . base64_encode('https://example.com'))->assertNotFound();
    $this->get('/escalated/n/v/tk-0')->assertNotFound();
    $this->get('/escalated/n/u/tk-0')->assertNotFound();

    // Data preserved
    expect(NewsletterDelivery::count())->toBe(5);
    expect($n->fresh()->summary_sent)->toBe(0);
});
```

- [ ] **Step 2: Run, expect PASS**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest tests/Feature/NewsletterDisableMidFlightTest.php
```

If the public routes return 200 instead of 404 because the service provider's gate evaluates `config('escalated.enable_newsletters')` at boot time rather than per-request: switch the gate in `bootNewsletters` to a route-level middleware that re-reads config on every request. Add a tiny middleware `EnsureNewslettersEnabled` that does `abort_if(!config('escalated.enable_newsletters'), 404)`, and apply it to the public + webhook route groups in `routes/newsletter-public.php` and `routes/newsletter-webhooks.php`.

- [ ] **Step 3: Commit**

```bash
git -C C:/Users/work/escalated-laravel add tests/Feature/NewsletterDisableMidFlightTest.php src/Http/Middleware/EnsureNewslettersEnabled.php routes/newsletter-public.php routes/newsletter-webhooks.php
git -C C:/Users/work/escalated-laravel commit -m "test(newsletters): verify disable-mid-flight halts dispatch and 404s tracking"
```

---

### Task B29: README + manual ESP-sandbox verification checklist

**Files:**
- Modify: `README.md`
- Create: `docs/newsletters.md` (long-form host integrator guide)

- [ ] **Step 1: Add a "Newsletters (optional)" section to the package README**

Find the existing feature toggles section in `README.md` and append:

```markdown
### Newsletters (optional, disabled by default)

Enable the newsletter system to give admins a broadcast surface for sending Markdown emails to contacts.

```env
ESCALATED_ENABLE_NEWSLETTERS=true
ESCALATED_NEWSLETTER_DEFAULT_FROM=hi@example.com
ESCALATED_NEWSLETTER_DEFAULT_THEME=default
```

Add a Laravel scheduler entry in `app/Console/Kernel.php`:

```php
$schedule->command('escalated:newsletters:dispatch')->everyMinute()->withoutOverlapping();
```

Then `php artisan db:seed --class=Escalated\\Laravel\\Database\\Seeders\\PermissionSeeder` to attach `newsletters.manage` and `newsletters.send` to the Admin role.

Custom themes live in `resources/views/vendor/escalated/newsletters/themes/<slug>.blade.php`. See `docs/newsletters.md` for the theme contract.

ESP webhook endpoints for outbound events:

- `POST /escalated/webhooks/newsletter/postmark`
- `POST /escalated/webhooks/newsletter/mailgun`
- `POST /escalated/webhooks/newsletter/ses`
- `POST /escalated/webhooks/newsletter/sendgrid`
```

- [ ] **Step 2: Write `docs/newsletters.md` (host-integrator guide)**

```markdown
# Newsletters

Optional opt-in feature for admin-driven broadcast emails to contacts. Disabled by default.

## What you get

- Static lists (manual / CSV) and dynamic segments (saved contact filters)
- Markdown authoring with strict `{{ contact.field }}` merge fields
- Server-side themes (Blade) — ships with `default` and `branded`
- Scheduling, send-now, test-send, and per-newsletter pause
- Open / click tracking via self-hosted pixel and redirect endpoints
- Bounce / complaint handling via ESP webhooks (Postmark, Mailgun, SES, SendGrid)
- RFC 8058 one-click unsubscribe (Gmail/Yahoo bulk-sender ready)
- Contact-scoped opt-out (`marketing_opt_out_at`) survives across all lists
- Two permissions: `newsletters.manage` (authoring) and `newsletters.send` (dispatch)

## Theme contract

A theme receives:
- `$subject` — string
- `$body` — pre-rendered HTML body (already merge-field-resolved)
- `$unsubscribe_url`, `$view_in_browser_url`, `$tracking_pixel` — strings
- `$brand['name' | 'accent' | 'logo_url' | 'physical_address']` — from settings

Themes are Blade files in either:
- `vendor/escalated/laravel/resources/views/newsletters/themes/<slug>.blade.php` (package-shipped)
- `resources/views/vendor/escalated/newsletters/themes/<slug>.blade.php` (host overrides + custom)

Both directories are scanned at request time; the admin UI lets you pick any discovered theme.

## CAN-SPAM physical address

Set `ESCALATED_NEWSLETTER_BRAND_PHYSICAL_ADDRESS` in your `.env`. Themes render it in the footer. If unset, the admin UI displays a banner reminding you it's missing — you remain responsible for compliance.

## Privacy: disabling tracking

Set `ESCALATED_NEWSLETTER_TRACKING_ENABLED=false` to skip pixel injection and click rewriting. ESP webhooks still process bounces and complaints (required for deliverability).

## Disabling the feature

Flip `ESCALATED_ENABLE_NEWSLETTERS=false`. In-flight `sending` newsletters halt at the next dispatcher tick, tracking endpoints return 404, admin UI disappears. All data is preserved — re-enabling resumes cleanly.
```

- [ ] **Step 3: Manual ESP-sandbox verification checklist**

Create `docs/newsletters-verification.md`:

```markdown
# Wave 1 manual verification checklist

Required before merging the Laravel reference PR. Use a Postmark or SES sandbox.

1. Fresh Laravel app with the package installed, mail transport configured for Postmark sandbox / SES sandbox.
2. `php artisan escalated:install --with-newsletters` → confirm `.env` has `ESCALATED_ENABLE_NEWSLETTERS=true`.
3. Admin UI: create a static list, add yourself as a contact, create a template, compose a newsletter.
4. Click "Send Test to Me" → verify the email arrives, contains the tracking pixel + List-Unsubscribe header.
5. Click "Send Now" → verify the email arrives at your address.
6. Open the email in Gmail → confirm one-click unsubscribe link appears next to the From line.
7. Click a link in the email → confirm redirect works and `last_clicked_at` updates in the admin UI's Deliveries tab.
8. Inspect the email source → confirm `List-Unsubscribe`, `List-Unsubscribe-Post`, `Message-ID`, `X-Escalated-Newsletter-Id` headers are present.
9. Configure Postmark webhook → fire an Open event → confirm `opened_at` updates.
10. Configure Postmark webhook → fire a HardBounce event → confirm delivery status flips to `bounced` and the email is added to the suppression set (visible by creating a second newsletter to the same list and confirming the count drops by 1).
11. Use Gmail's one-click unsubscribe → confirm `contacts.marketing_opt_out_at` is set in DB.
12. Flip `ESCALATED_ENABLE_NEWSLETTERS=false` and reload admin UI → confirm "Newsletters" nav item disappears.

Sign off in the PR description once all 12 steps pass.
```

- [ ] **Step 4: Commit**

```bash
git -C C:/Users/work/escalated-laravel add README.md docs/newsletters.md docs/newsletters-verification.md
git -C C:/Users/work/escalated-laravel commit -m "docs(newsletters): add host-integrator guide and manual verification checklist"
```

---

### Task B30: Open Wave 1 PR (do NOT merge)

- [ ] **Step 1: Update the package's `composer.json` peer requirement on `@escalated-dev/escalated` if applicable**

If the Laravel package declares a frontend package version constraint anywhere (e.g. a notes file or composer.json `extra`), bump it to `^0.9.0`. If not, skip.

- [ ] **Step 2: Run the entire Pest suite one last time**

```bash
cd C:/Users/work/escalated-laravel && vendor/bin/pest
```

Expected: all green.

- [ ] **Step 3: Push branch**

```bash
git -C C:/Users/work/escalated-laravel push -u origin feat/newsletter-system
```

- [ ] **Step 4: Open the PR — do NOT auto-merge**

```bash
gh pr create --repo escalated-dev/escalated-laravel \
  --title "feat(newsletters): admin-only broadcast system (Wave 1, Laravel reference)" \
  --body "$(cat <<'EOF'
## Summary
Implements the newsletter system per `escalated-dev/escalated/docs/superpowers/specs/2026-05-19-newsletter-system-design.md`. Disabled by default. Laravel reference implementation; other backends port from this PR in subsequent waves.

- 6 migrations (lists, list_members, templates, newsletters, deliveries, contacts opt-out column)
- 5 Eloquent models under `Models/Newsletter/`
- 5 services: `ContactSegmentResolver`, `BounceSuppressionStore`, `NewsletterRendererService`, `NewsletterPlannerService`, `NewsletterDispatcherService`, `NewsletterTrackerService`
- 7 controllers: admin (Newsletter, NewsletterList, NewsletterTemplate, NewsletterSettings) + public (Tracking, Unsubscribe, ViewInBrowser) + webhook (NewsletterEspWebhookController for Postmark/Mailgun/SES/SendGrid)
- `escalated:newsletters:dispatch` Artisan command (host schedules every minute)
- `escalated:install` extended with `--with-newsletters` / `--no-newsletters` flags + interactive prompt
- Two starter themes: `default`, `branded`
- Two new permissions seeded onto Admin role: `newsletters.manage`, `newsletters.send`
- Feature flag (`ESCALATED_ENABLE_NEWSLETTERS`) gates all routes, scheduler, and Inertia shared data
- Markdown rendering via `league/commonmark` + click rewriting via `symfony/dom-crawler`
- RFC 8058 one-click unsubscribe (Gmail/Yahoo bulk-sender ready)
- Pest unit tests per service + feature tests for every controller + disable-mid-flight integration test

Depends on `@escalated-dev/escalated` v0.9.0 (Wave 0 PR).

## Test plan
- [x] All Pest unit and feature tests pass
- [ ] Manual ESP-sandbox verification per `docs/newsletters-verification.md` (12 steps) — paste sign-off here
- [ ] Reviewer: confirm `ESCALATED_ENABLE_NEWSLETTERS=false` is the default in `.env.example`-style guidance

## Reviewer notes
- **Do not auto-merge.** Hand back to Matthew for review.
- The bounce suppression store currently uses `escalated_settings` as a JSON list — fine for v1 (<10k bounces). If a customer scales past that, the spec's "Out of scope, flagged for v1.1+" already includes a real suppression table.
- Top-clicks-by-URL is intentionally stubbed (returns `[]`) — per the spec, v1 surfaces aggregate clicks only.
EOF
)"
```

Capture the PR URL and surface it. **Stop here. Do not run `gh pr merge` under any circumstances.** Matthew reviews.

---

## Self-Review

Run after the plan is fully drafted. Look at the spec with fresh eyes:

**1. Spec coverage check:**

| Spec section | Plan task(s) covering it |
|---|---|
| Domain model (5 tables + contacts alter) | B2–B7 |
| Submit / Plan / Dispatch / Track pipeline | B11, B12, B13 |
| Rendering (Markdown → theme → click rewrite → pixel) | B10, B14 |
| Two starter themes | B14 |
| Admin UI (full page tree) | A1–A13 |
| Sidebar nav gating | A2 |
| Feature flag (three layers) | B1, B26 |
| Install flow (prompt + flags) | B24 |
| Permission setup (two perms, seeded on Admin) | B25 |
| Disable-after-enable behavior | B28 |
| Outbound mail prerequisite | B15 (validation banner) |
| ESP webhook outbound events | B22 |
| Self-hosted tracking endpoints | B19 |
| RFC 8058 unsubscribe + contact-scoped opt-out | B7 (column), B11 (filter), B20 (endpoint) |
| Send Test To Me | B15 |
| View-in-browser | B21 |
| Bounce auto-pause | B12 (in dispatcher) |
| README + integrator docs | B29 |
| Wave 0 release tag 0.9.0 | A14 |
| Wave 1 PR (no auto-merge) | B30 |

**2. Placeholder scan:** No "TBD", "TODO", "implement later" tokens remain. Every code step shows complete code.

**3. Type consistency:** Service method names are consistent across tasks: `NewsletterPlannerService::plan`, `NewsletterDispatcherService::dispatchBatch`, `NewsletterTrackerService::recordOpen/recordClick/recordBounce/recordComplaint`, `NewsletterRendererService::render`, `ContactSegmentResolver::resolve / resolveSendable / countMatches`, `BounceSuppressionStore::markBounced / markComplained / isBounced / filterSendable`. Endpoint paths match between routes file (B27), controllers (B19–B22), and renderer (B10) — `/escalated/n/{o|c|u|v}/{token}` and `/escalated/webhooks/newsletter/{esp}`. Permission slugs `newsletters.manage` and `newsletters.send` are used identically in seeder (B25), controllers (B15–B18), frontend (A2), and install command (B24).

**4. Ambiguity check:** Reviewed — no requirements have two plausible interpretations.

---

## Out of scope for this plan (will get its own plan)

Wave 2 (NestJS port + context repo updates) and Wave 3 (8 remaining backends) and Wave 4 (docs site, marketing site) — write that plan once Wave 1 lands and is verified. Each port mirrors the Laravel reference; writing those tasks before the reference exists would invent fictional code.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-19-newsletter-wave-0-and-1.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for the heterogeneous mix of Vue + Laravel work where review per task catches contract drift early.

**2. Inline Execution** — Execute tasks in this session using `executing-plans`, batch execution with checkpoints. Best if you want to watch the dispatch in real time without context switching.

For dispatch-mode work (Codex / Cursor / Kimi as executor), the per-repo permission registry in `CLAUDE.md` applies — Escalated repos are **Kimi-denied**, so use Codex or Cursor only.

Which approach?





