# For package maintainers

## For Package Maintainers

Verified guest access is enabled by backend capabilities. `Escalated/Guest/Create`
accepts optional `verification_url` and `lookup_url` props. With these URLs, the
form requests an email code before posting a ticket; a separate form verifies
email to find existing tickets by tracking/ticket reference and renew private
links. `Guest/Show` displays `ticket.guest_access_expires_at` when supplied.

The built-in widget enables the same flow only when `/config` returns
`guest_verification_required: true`. The backend must provide POST `/verification`
with email and purpose (`ticket`, `chat`, `lookup`), returning `verification_id`;
creation accepts `verification_id` and the eight-digit `verification_code`.
POST `/lookup` returns `{ data: [{ reference, subject, guest_access_token,
expires_at }] }`; subsequent widget status reads send the token as a Bearer
header. Chat creation returns an opaque `id` and polling uses
`/chat/{id}/messages`. Proofs and private results are cleared on destination or
identity changes. Tokens remain in component memory. CSRF headers are sent only
to the page's own origin.

Backends that omit these capabilities retain their existing form contract. Hosts
must ship these forms before requiring verification in their backend. This does
not implement verification in the other backend packages or release the separate
web-widget plugin.

The widget can also be embedded on other sites, as a launcher or an on-page
support form, with host parameters (department, prefill, metadata) and a
JavaScript API. Backends opt in with an origin allow list, CORS and a CSRF
exemption for those origins. See [Embedding the widget](embedding-the-widget.md).

Backends with account isolation can share `escalated.broadcasting.channel_prefix`
through Inertia, for example `escalated.tenants.<opaque-account-namespace>`.
Ticket, agent, chat and presence subscriptions use this prefix and rejoin when it
changes. Omitting it preserves the existing `escalated` channels. Standalone
`PresenceIndicator` consumers can pass its `channelPrefix` prop; `useRealtime`
and `useChat` accept `channelPrefix` as a string, ref or getter. Raw
`useRealtime().listen(channel, event, callback)` still treats the channel literally.

The backend must authorize the current account and each private/presence join.
Channel names alone are not authorization. Ticket presence should expose only
agent identity/display names, with requester access limited to private ticket
updates. Deploy a frontend version containing this support before enabling a
backend's account-scoped channels.

If you're building a new backend integration, this package is available on npm:

```bash
npm install @escalated-dev/escalated
```

```js
// Import the plugin
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Import individual components
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// Or reference pages directly for Inertia resolution
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Peer dependencies: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0 || ^3.0.0

The API token and two-factor pages accept flash data from `page.props.flash`
(legacy shared props) and `page.flash` (Inertia 3). Top-level values take
precedence, including explicit `null` values that clear legacy data. Inertia 3
backends should send one-time tokens, setup URIs, and recovery codes through
top-level flash so they are excluded from the adapter's browser history state.
Hosts must deploy a frontend release containing this support before changing
their backend's flash protocol.

## Backend settings capabilities

The `Escalated/Admin/Settings` page accepts optional `supported_settings` and
`update_url` props. Pass an array of editable setting names to show and submit only
those fields, and a URL accepting a flat POST payload. An empty array exposes no
editable settings. Omitting these props preserves the full settings form and its
Laravel named route. Backends must validate their own setting allowlist; hiding a
control is not authorization.

For example, a backend implementing only knowledge-base and branding preferences
can expose `knowledge_base_enabled`, `knowledge_base_public`,
`knowledge_base_feedback_enabled`, and `show_powered_by`. Supply typed values in
the `settings` prop. Changing the settings/account props clears stale form values
and pending requests, including previously entered credentials.
