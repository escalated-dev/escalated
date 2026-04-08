# Live Chat / Live Tickets — Design Spec

## Overview

Live Chat adds real-time messaging to Escalated. A chat session IS a ticket from the moment it's created (`status: live`, `channel: chat`). Chat messages are stored as replies. When the chat ends, the ticket transitions to `closed`. Customers can reopen, which converts it to a regular async ticket.

## Data Model

### Modified: Ticket
- `channel` (enum: web, email, chat, widget) — origin channel
- `chat_ended_at` (nullable datetime)
- `chat_metadata` (JSON) — browser info, page URL, referrer

### New Table: `escalated_chat_sessions`
- `id`, `ticket_id` (FK)
- `customer_session_id` (string) — browser session ID
- `agent_id` (nullable FK)
- `status` (enum: waiting, active, ended)
- `started_at`, `ended_at`
- `customer_typing_at`, `agent_typing_at` (nullable datetime)
- `metadata` (JSON)
- `rating` (nullable int), `rating_comment` (nullable text)

### New Table: `escalated_chat_routing_rules`
- `id`, `department_id` (nullable FK)
- `routing_strategy` (enum: auto_assign, round_robin, skill_based, least_busy, manual_queue)
- `offline_behavior` (enum: queue, ticket_fallback, offline_form, hide_chat)
- `max_queue_size` (int, default 10)
- `max_concurrent_per_agent` (int, default 5)
- `auto_close_after_minutes` (int, default 30)
- `queue_message`, `offline_message` (text)
- `is_active` (boolean), `position` (int)

### Modified: AgentProfile
- `chat_status` (enum: online, away, offline) — agent availability for chat

## Backend Architecture

### Chat Lifecycle
1. Customer starts chat → POST creates Ticket (status: live, channel: chat) + ChatSession (status: waiting)
2. Routing rules evaluated → agent assigned or queued
3. Messages flow via WebSocket (broadcast on `escalated.chat.{sessionId}`)
4. Chat ends → Ticket status: closed, ChatSession: ended
5. Customer reopens → Ticket status: open (regular async ticket)

### New Controllers
- `ChatController` (agent) — accept, end, transfer chat
- `WidgetChatController` (public) — start, message, end, availability, rate

### New Services
- `ChatRoutingService` — evaluate rules, find agent, manage queue
- `ChatAvailabilityService` — agent online status, capacity, business hours
- `ChatSessionService` — session lifecycle, auto-close idle

### Events (WebSocket)
- `chat.started`, `chat.assigned`, `chat.message`, `chat.typing`
- `chat.ended`, `chat.transferred`, `chat.queue_update`

### Scheduled Tasks
- Auto-close idle chats (no message for X minutes)
- Clean up abandoned sessions

## Frontend — Agent Side

### ActiveChatsPanel.vue
- Floating sidebar showing agent's active chats
- Unread badges, last message preview, color-coded status
- Agent chat status toggle (Online/Away/Offline)
- Browser notifications for new chats

### TicketShow.vue (chat mode)
- When `ticket.status === 'live'`: bubble UI, quick reply input, auto-scroll
- Typing indicator, internal notes toggle, macros/KB access
- Chat action bar: End Chat, Transfer
- Transitions to standard reply thread when chat ends

### ChatQueue.vue
- Unassigned/waiting chats queue
- Accept button, customer info, wait time

## Frontend — Widget / Customer Side

### Chat tab in widget
- Availability check → pre-chat form → live chat view
- Kayako-inspired: clean bubbles, avatars, timestamps
- Typing indicators, file attachments, connection status
- Post-chat: CSAT prompt (1-5 stars)

### Full White-Label Theming
- Colors: primary, background, text, agent/customer bubble, header
- Typography: custom font family
- Shape: border radius, launcher icon/size
- Branding: show/hide "Powered by Escalated"
- Custom CSS injection into shadow DOM
- Admin preview panel with live preview

## Admin Configuration
- Chat routing rules per department
- Offline behavior settings
- Widget theme editor with live preview
- Chat-specific settings: auto-close timer, max queue, concurrent limit
- Pre-chat form field configuration
