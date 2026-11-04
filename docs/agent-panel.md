# Agent panel: optional page props

The agent pages (`Escalated/Agent/TicketIndex`, `Escalated/Agent/TicketShow`)
render with the props every backend already sends. The props below are
optional. Without them the panel still works; it shows no counts, views or
stat strip, and names the queue from the URL.

## `inbox` (TicketIndex and TicketShow)

```json
{
    "counts": { "mine": 24, "unassigned": 18, "all": 142 },
    "views": [
        { "id": "urgent", "name": "Urgent", "count": 6, "filters": { "priority": "urgent" } },
        { "id": 12, "name": "Billing escalations", "count": 3, "filters": { "department_id": 4 } }
    ],
    "stats": { "open": 24, "urgent": 6, "sla_at_risk": 4, "resolved_today": 27 }
}
```

- `counts` labels the rail's Inbox (assigned to the current agent),
  Unassigned and All tickets. A missing key shows no number.
- `views` are listed under Views in the rail, each linking to the ticket list
  with its `filters` as query parameters. Sending the key (even `[]`) also
  shows the "+" that saves the current filters as a view. The built-in views
  get their own icon when their `id` is `urgent`, `sla_at_risk`,
  `waiting_on_me`, `waiting_on_customer` or `recently_updated`; the backend
  decides which of them exist.
- `stats` fills the strip above the list. Each tile filters the list by adding
  query parameters, and clicking it again removes them:

  | Tile | Adds |
  |---|---|
  | Open | `status=open` |
  | Urgent | `priority=urgent` |
  | SLA at risk | `sla_at_risk=1` |
  | Resolved today | `status=resolved&resolved_today=1` |

  A tile the backend leaves out of `stats` is not shown.

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
| `is_unread` | The subject in full weight |
| `requester_online`, `requester.is_online`, `is_live_chat` | A green dot after the reference |
| `latest_reply.body` | The one-line preview (falls back to `description`) |
| `last_reply_at` | The age (falls back to `updated_at`, then `created_at`) |
| `first_response_due_at`, `resolution_due_at`, `sla_*_breached` | An SLA marker when breached or due within the hour |

The **New ticket** button appears only when the host has a route named
`escalated.agent.tickets.create`.

## The ticket page

`Escalated/Agent/TicketShow` takes the same optional `inbox` (for the rail)
and `queue` (it names the "Back to" link and marks the rail). On a wide screen
the list the agent opened the ticket from stays beside it; that list is kept
in the browser from the last inbox visit, so it needs nothing from the
backend. Opened directly, the ticket fills the pane.

Actions are offered only when the host has the route: status, priority,
tags (`escalated.agent.tickets.tags`, posting `tag_ids`), assign, follow,
macros, pin, and snooze (`escalated.agent.tickets.snooze`, posting
`snoozed_until`). Merge is offered to admins through the admin merge routes.
"Send and set waiting on customer" and "Send and resolve" post the reply and
then `{ status }` to the status route.

Ticket fields the page reads beyond the existing ones, all optional:

| Field | Shows |
|---|---|
| `custom_fields` (`[{ label, value }]` or `{ label: value }`) | Rows in the Details tab |
| `requester_tickets` (falls back to `related_tickets`) | Recent tickets in the Customer tab |
| `links_as_parent[].child_ticket`, `links_as_child[].parent_ticket`, `merged_tickets`, `merged_into` | Linked tickets in the Related tab |
| `attachments[].size` | The file size on attachment cards |
