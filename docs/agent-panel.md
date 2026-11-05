# Agent panel: optional page props

The agent pages (`Escalated/Agent/TicketIndex`, `Escalated/Agent/TicketShow`)
render with the props every backend already sends. The props below are
optional. Without them the panel still works; it shows no counts, views or
summary, and names the queue from the URL.

## `inbox` (TicketIndex and TicketShow)

```json
{
    "counts": { "mine": 24, "unassigned": 18, "all": 142 },
    "views": [
        { "id": "urgent", "name": "Urgent", "count": 6, "filters": { "priority": "urgent" } },
        { "id": 12, "name": "Billing escalations", "count": 3, "filters": { "department_id": 4 } }
    ],
    "stats": { "open": 24, "urgent": 6, "sla_at_risk": 4, "resolved_today": 27 },
    "unread": { "mine": 3, "unassigned": 5, "all": 11 }
}
```

- `counts` labels the rail's Inbox (assigned to the current agent),
  Unassigned and All tickets. A missing key shows no number. The counts are
  of open (unresolved, unsnoozed) tickets, so when `counts` is sent the rail
  links add `open=1`: Inbox opens `assigned_to=<me>&open=1`, Unassigned
  `unassigned=1&open=1`, All tickets `open=1`. The list then shows the same
  tickets the number counts, says "open" in its subline, and offers
  "Include resolved" to drop the filter (and "Open only" to restore it).
  Without `counts` the links carry no `open` filter, as before.
- `views` are listed under Views in the rail, each linking to the ticket list
  as `view=<id>`, which the backend expands to the view's `filters`. The link
  adds `open=1` unless the view's filters name a `status` or `open`, matching
  how its count is taken. A `view=<id>` URL selects that view in the rail and
  titles the list with its name. Sending the key (even `[]`) also
  shows the "+" that saves the current filters as a view. The built-in views
  get their own icon when their `id` is `urgent`, `sla_at_risk`,
  `waiting_on_me`, `waiting_on_customer` or `recently_updated`; the backend
  decides which of them exist.
- `stats` fills the one-line summary above the list (an icon, the number and a
  short label per item). Each item filters the list by adding query
  parameters, and clicking it again removes them:

  | Item | Adds |
  |---|---|
  | Open | `status=open` |
  | Urgent | `priority=urgent` |
  | SLA at risk | `sla_at_risk=1` |
  | Resolved today | `status=resolved&resolved_today=1` |

  An item the backend leaves out of `stats` is not shown.

- `unread` has the same keys as `counts`: how many of those open tickets are
  unread for the current agent. A queue with a number above zero gets a small
  accent dot before its count (and "3 unread" for screen readers and as the
  tooltip). A missing key, or no `unread`, shows no dot.

The counts and stats are for the current agent and queue as the backend sees
them; the frontend never computes or estimates them.

## `queue` (TicketIndex and TicketShow)

```json
{ "key": "mine", "title": "My inbox" }
```

The queue the list shows. `key` is `mine`, `unassigned`, `all`, `live`, or
`view:<id>` for a saved view, and marks that entry in the rail; `title` heads
the list. Without it the frontend reads the queue off the query string
(`assigned_to=<me>`, `unassigned=1`, none, or a view's filters).

## Ticket fields the list reads

All optional; each one only adds to the row when present.

| Field | Shows |
|---|---|
| `is_unread` | An accent dot, and the requester and subject in full weight |
| `requester_online`, `requester.is_online`, `is_live_chat` | A green dot after the requester's name |
| `latest_reply.body` | The one-line preview (falls back to `description`) |
| `last_reply_at` | The age (falls back to `updated_at`, then `created_at`) |
| `first_response_due_at`, `resolution_due_at`, `sla_*_breached` | An SLA marker when breached or due within the hour |

The **New ticket** button appears only when the host has a route named
`escalated.agent.tickets.create`.

### Marking read and unread

When the host has the routes `escalated.agent.tickets.read` and
`escalated.agent.tickets.unread` (`POST {prefix}/agent/tickets/{ticket}/read`
and `/unread`, answering `{ "is_unread": false | true }` to a JSON request):

- each row has a menu (the "..." over the age on hover) with Mark as read or
  Mark as unread, and `Shift U` does the same for the focused row;
- the bulk bar adds Mark read and Mark unread, posting `action: "mark_read"`
  or `"mark_unread"` (no `value`) to `escalated.agent.tickets.bulk`;
- the ticket page's overflow menu offers Mark as unread, which goes back to
  the list (opening the ticket again would mark it read).

The change shows at once and then reloads `inbox` for the counts; if the
backend refuses, the row goes back and a toast says so. Opening a ticket
marks it read on the backend (`GET escalated.agent.tickets.show`), and the list
beside the ticket shows it read straight away. Without the routes there is no
menu, no bulk action and no shortcut; `is_unread` is still shown. Semantics
(what counts as activity, the read marker) are in the developer-context ADR
`decisions/2026-11-05-agent-panel-data.md`.

## The ticket page

`Escalated/Agent/TicketShow` takes the same optional `inbox` (for the rail)
and `queue` (it names the "Back to" link and marks the rail). On a wide screen
the list the agent opened the ticket from stays beside it; that list is kept
in the browser from the last inbox visit, so it needs nothing from the
backend. Opened directly, the ticket fills the pane.

The page is a compact header (reference, subject, the frequent actions, then
status, priority, assignee, department and tags), the conversation in its own
scroll region with the composer under it, and a customer and details panel.
The panel sits beside the conversation when the pane is at least 900px wide
(the conversation keeps 600px) and opens there by default; on a narrower pane
it opens over the conversation on demand. The header button and `i` toggle
it; the wide-layout choice is remembered in the browser
(`escalated-context-panel`), as are collapsed sections
(`escalated-context-sections`).

The thread shows the customer's messages, agent replies (an accent rule),
internal notes (amber, with a lock) and, from `ticket.activities`, one-line
system events (status, priority, assignment, tags, department, snooze and
SLA). `replied` and `note_added` activities are not repeated as events. A
reply is the customer's when the backend says so (`is_customer: true` or
`is_agent: false`), when its `author_type`/`author_id` match the ticket's
`requester_type`/`requester_id`, or when it has no author (a guest).

Customer presence (`requester_online`, `requester_last_seen_at`) is staff-only
data: the backend sends it on agent pages, never to customers, guests or the
widget. A customer is online when the widget, a live chat or the customer
portal saw them within the backend's window (2 minutes by default). See the
developer-context ADR `decisions/2026-11-05-agent-panel-data.md`.

### Optional prop: `agents`

```json
[{ "id": 8, "name": "Ana Lopez" }]
```

Who the ticket can be assigned to. With it the assignee is a menu (with a
filter past six agents) posting `agent_id` to the assign route; without it
the page offers only "Assign to me".

### Actions

Actions are offered only when the host has the route:

| Action | Route | Posts |
|---|---|---|
| Status, Resolve, Reopen | `escalated.agent.tickets.status` | `status` (`resolved`; `open` to reopen) |
| Priority | `escalated.agent.tickets.priority` | `priority` |
| Assign | `escalated.agent.tickets.assign` | `agent_id` |
| Department | `escalated.agent.tickets.department` | `department_id` (needs `departments`) |
| Tags | `escalated.agent.tickets.tags` | `tag_ids` |
| Snooze | `escalated.agent.tickets.snooze`, else `escalated.admin.tickets.snooze` for admins | `snoozed_until` (ISO 8601) |
| Unsnooze | `escalated.agent.tickets.unsnooze`, else the admin route for admins | nothing |
| Follow, macros, pin | as before | |

Snooze offers 1 hour, 4 hours, tomorrow 9:00, next Monday 9:00 (local time)
and a date picker; a ticket whose `snoozed_until` is in the future says so in
the header. Merge is offered to admins through the admin merge routes.
"Send and set waiting on customer" and "Send and resolve" post the reply and
then `{ status }` to the status route. Previous and next ticket (`Shift K` /
`Shift J`) walk the list the ticket was opened from.

Ticket fields the page reads beyond the existing ones, all optional:

| Field | Shows |
|---|---|
| `requester_tickets` (`[{ id, reference, subject, status, created_at, updated_at }]`) | Previous conversations in the customer panel. `related_tickets` is not used for this: it holds linked tickets. |
| `requester.organization` (`{ name }` or a string), `organization`, `requester.company` | The customer's organization |
| `requester_ticket_count` | "N tickets in total" |
| `requester_online`, `requester_last_seen_at` | "Online now" with a green dot, else "Last seen 12m ago" under the customer's name; nothing when neither is sent or the customer was never seen (`null`) |
| `custom_fields` (`[{ label, value }]` or `{ label: value }`) | Details; fields without a value are left out |
| `links_as_parent[].child_ticket`, `links_as_child[].parent_ticket`, `merged_tickets`, `merged_into` | Related tickets |
| `snoozed_until` | "Snoozed until ..." in the header, and Unsnooze |
| `requester_type`, `requester_id`, `replies[].author_type`, `replies[].author_id` | Who wrote each message |
| `activities[].type`, `.properties` (`new_status`, `new_priority`, `agent_id`, `new_department_id`, `tag`), `.causer.name` | System events and the ticket history |
| `attachments[].size` | The file size on attachment chips |

### The composer

Idle and empty, the composer is one line under the Reply / Internal note
tabs. Focus, a draft, attached files or an open menu open it up: the text box
grows with the text (up to 40% of the window, then scrolls) and the toolbar
appears. A public reply names its recipient (`ticket.requester.name`, with
the email in the tooltip); an internal note turns the whole composer amber
and says only agents can see it. `Ctrl Enter` (`⌘ Enter` on a Mac) sends,
`Ctrl Shift Enter` sends and resolves, and Escape leaves an empty box. Files
can be attached with the paperclip, dropped on the composer or pasted. Drafts
are kept per ticket and mode in the browser (`escalated-draft:<reference>:<mode>`)
and can be discarded after a confirmation. `Composer` takes an optional
`recipient` (`{ name, email }`).

## The agent's own status

The rail footer and the top bar show the signed-in agent with a status dot
and a menu: Online, Away, Offline. The status is read from the shared
`escalated.agent_status` (falling back to the live-chat
`escalated.chat_status`), then from the agent's last choice in this browser
(localStorage key `escalated-agent-status`), then defaults to Online.

The backend may also share `escalated.agent_statuses`, the values it accepts
(`["online", "away", "offline"]`); the menu then offers only those. Without
it all three are offered.

Choosing a status updates both places at once, remembers it in the browser
and posts `{ "status": "online" | "away" | "offline" }` to the host's
`escalated.agent.status` route (`PUT`/`POST {prefix}/agent/status`, open to
every agent). A host without that route but with the admin live-chat route
`escalated.admin.chat.status` gets the post there instead, as before. When the
answer is JSON with `agent_status`, that value is shown; when the backend
refuses the change (a 4xx or 5xx), the previous status comes back. A host with
neither route gets a status that lives in the browser only.

The shapes are fixed by the developer-context ADR
`decisions/2026-11-05-agent-panel-data.md`. The status is the same field
live-chat routing uses, so there is one stored status per agent.
