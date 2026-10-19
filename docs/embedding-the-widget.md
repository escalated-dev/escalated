# Embedding the widget on other sites

The support widget (knowledge base, ticket form, live chat and status check)
can run on any site, not only the one Escalated is installed on. A store, a
marketing site or a customer portal loads one script from the Escalated
install and gets a floating launcher or an on-page support form.

The backend decides which sites may do this. Until a site's origin is on the
backend's allow list, the browser refuses its requests.

## Quick start

1. In Escalated, open **Admin > Settings > Support Widget**, turn the widget on
   and add the embedding site under **Sites that can embed the widget**, for
   example `https://shop.example.com`.
2. Add the script to the other site:

```html
<script src="https://help.example.com/support/widget/embed.js" async></script>
```

The script finds its backend from its own URL, so `data-base-url` is only
needed when the bundle is served from somewhere else (a CDN, or a copy in the
host's own build).

## An on-page support form

Use inline mode and point it at an element:

```html
<div id="support-form"></div>
<script
    src="https://help.example.com/support/widget/embed.js"
    data-mode="inline"
    data-target="#support-form"
    data-tabs="ticket"
    data-department="3"
    data-lock-department="true"
></script>
```

With one tab the tab bar is hidden, so this renders a plain support form.

## Script attributes

Every attribute can also be set on `window.EscalatedWidget` before the script
loads, using the camelCase name (`baseUrl`, `lockDepartment`, ...). Attributes
win over the global object.

| Attribute | Default | Meaning |
|---|---|---|
| `data-base-url` | the script's origin when loaded from `…/widget/embed.js`, else the page | Escalated install to talk to |
| `data-widget-path` | `/support/widget` (or the script's path) | Widget route prefix; NestJS uses `/escalated/widget` |
| `data-mode` | `launcher` | `launcher` floats a button; `inline` renders in `data-target` |
| `data-target` | none | Selector of the element that holds an inline widget |
| `data-tabs` | all available | Comma list and order of `help`, `ticket`, `chat`, `status` (`kb`, `contact` also accepted) |
| `data-tab` | first tab | Tab to start on |
| `data-department` | none | Department id to preselect |
| `data-lock-department` | `false` | Hide the department choice and always use `data-department` |
| `data-name`, `data-email` | empty | Visitor details the host already knows |
| `data-subject`, `data-message` | empty | Prefilled ticket subject and message |
| `data-title` | `Support` | Panel heading |
| `data-greeting` | admin setting | Line under the heading |
| `data-color`, `data-position` | admin setting | Launcher colour and `bottom-right`/`bottom-left` |
| `data-open` | `false` | Open the launcher panel on load |
| `data-hide-launcher` | `false` | No floating button; open it from your own UI |
| `data-meta-*` | none | Host parameters, e.g. `data-meta-order-number="A-1001"` |
| `data-metadata` | none | Host parameters as a JSON object |

Visitors can still edit prefilled fields, and email verification still
applies: prefilling an email address does not prove the visitor owns it.

## Host parameters

Host parameters travel with tickets and chats, so agents see which order,
plan or account a request is about. Set them with `data-meta-*`, with
`data-metadata`, as an object in `window.EscalatedWidget.metadata`, or as a
function there that is called at submit time:

```html
<script>
    window.EscalatedWidget = {
        metadata: () => ({ cart_total: window.cart.total, plan: 'pro' }),
    };
</script>
```

The widget adds `page_url` (origin and path only, never the query string).
Parameters are sent only to a backend whose `/config` returns
`accepts_metadata: true`. The backend keeps a flat map of short scalar values
and records the embedding site itself, so a page cannot claim to be another
site.

## JavaScript API

After loading, `window.EscalatedWidget` controls the widget. It also fires an
`escalated:widget-ready` event on `window`.

```js
EscalatedWidget.open('ticket'); // open, optionally on a tab
EscalatedWidget.close();
EscalatedWidget.toggle();
EscalatedWidget.identify({ name: 'Jane', email: 'jane@example.com' }); // fills empty fields
EscalatedWidget.setMetadata({ order_number: 'A-1001' }); // merges; { merge: false } replaces
EscalatedWidget.setDepartment(3, { lock: true });
const second = EscalatedWidget.mount({ mode: 'inline', target: '#footer-help' });
second.destroy();
```

Loading the script twice does not mount a second launcher.

## Using the bundle from npm

`@escalated-dev/escalated/widget` is the same standalone bundle
(`dist/widget/escalated-widget.js`). `@escalated-dev/escalated/widget/source`
is the unbundled entry for hosts that build it themselves; it also exports
`mountEscalatedWidget(options)`.

## Backend contract

A backend that supports embedding:

- serves the bundle at `{widgetPath}/embed.js`;
- keeps an allow list of origins (`scheme://host[:port]`, with optional
  `https://*.example.com` subdomain wildcards, never a bare `*`);
- answers preflight requests from allowed origins with
  `Access-Control-Allow-Origin: <origin>`, methods `GET, POST, OPTIONS` and
  headers `Accept, Authorization, Content-Type, X-Requested-With`, and adds
  `Access-Control-Allow-Origin` and `Vary: Origin` to every widget response
  for those origins, including 422 and 429;
- skips its CSRF check for requests from allowed origins, and treats them as
  guests even if the browser has a signed-in session;
- handles every other request exactly as before;
- returns `accepts_metadata: true` from `/config` when it stores host
  parameters.
- returns `status_lookup_enabled: false` from `/config` when it does not offer
  verified guest lookup (`/verification`, `/lookup`, Bearer
  `/tickets/{reference}`). The widget then hides the status tab; a backend must
  never grant access to a ticket from a claimed email address alone.

The Laravel backend implements this from 1.9.4; see its
`docs/embedding-the-widget.md`.
