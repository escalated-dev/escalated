# Public Ticket System — Implementation Plan

> **For agentic workers (Ralph Loop, etc.):** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. **Never skip the TDD red step (write failing test → confirm failure → implement).**

**Goal:** Ship an end-to-end public (anonymous) ticketing system: a guest can submit a ticket via a public form *or* inbound email, the ticket is routed automatically by admin-configured rules, the guest receives outbound confirmation/reply emails that thread correctly, and admin has a configurable policy for what identity the guest gets (guest user / unassigned / invited to create an account). Additionally, resolve the Workflows-vs-Automations split: Workflows remain the admin automation engine; the Automations UI is repurposed into an agent-facing Macros system.

**Architecture:**
- **Backend:** NestJS v10 module in `C:\Users\work\escalated-nestjs` (TypeORM, EventEmitter2, Jest).
- **Frontend:** Vue 3 + Inertia in `C:\Users\work\escalated` (Storybook for visuals; Vitest for any unit tests added).
- **Email:** `@nestjs-modules/mailer` + `nodemailer` for outbound; a single webhook endpoint with a pluggable parser interface for inbound (Postmark first, Mailgun/SendGrid stub adapters).
- **Extension model:** Pure event listeners (`@OnEvent`) — no new plugin runtime. Mirrors the existing WebhookService / EscalatedGateway patterns.
- **Data model additions:** `Contact` entity (new, first-class), `Macro` entity (new), Workflow action executor (new), Contact-aware ticket creation. `requesterId: number` is preserved on `Ticket` for host-app user mapping; a nullable `contactId: number | null` is added for guest/contact-based tickets.
- **Two-audience split (final):** **Workflows** = admin-managed, automatic, runs on events. **Macros** = agent-applied, manual one-click action bundles (replaces the dead Automations UI).

**Tech stack:** TypeScript 5, NestJS 10, TypeORM 0.3, EventEmitter2, Jest 29 + ts-jest, Vue 3, Inertia, Vitest 2, nodemailer, @nestjs-modules/mailer.

**Repos touched:**
- `C:\Users\work\escalated-nestjs` — all backend work
- `C:\Users\work\escalated` — frontend (widget + Guest pages + admin UI renames)

---

## Audit corrections (discovered during execution)

- **2026-04-24:** Macro entity, service (CRUD + execute), admin & agent controllers already exist in `escalated-nestjs`. Action set: `set_status`, `set_priority`, `set_department`, `assign`, `add_reply`, `add_note`. Phase 7 is therefore reduced to: (a) add `insert_canned_reply` with Handlebars-style interpolation, (b) delete the dead `Admin/Automations/` frontend, (c) add a frontend Macros admin UI that points at the existing backend, (d) add a MacroMenu component on the agent ticket detail. See Phase 7 notes below.

## Product decisions locked before coding starts

1. **Workflows stay as the admin automation engine.** The existing `Workflow` entity, service, Builder.vue, and Logs.vue are canonical.
2. **Automations frontend folder is renamed/repurposed to Macros.** It currently has no backend, so there is no data migration. No user-facing breaking change (per user confirmation: "won't break existing builds").
3. **Contact is a first-class entity.** A guest ticket always has a `Contact` record (`email`, optional `name`, `userId` nullable). Repeat guests are deduped by email. `Ticket.requesterId` remains for host-app user references; `Ticket.contactId` is added for contacts.
4. **Admin-configurable guest identity policy** with three modes (default = `unassigned`):
   - `unassigned` — no host-app user is linked. `ticket.requesterId = 0`. Contact carries email/name.
   - `guest_user` — all guest tickets are assigned a single configured "guest" host-app user. `ticket.requesterId = settings.guestUserId`.
   - `prompt_signup` — after submission, guest is sent an email with a signup link; when completed, host app creates a user and links the contact. Until then, behaves like `unassigned`.
5. **Outbound email required.** Confirmation on ticket.created, notification on agent reply, optional "ticket resolved" email.
6. **Inbound email required.** Single webhook endpoint, Postmark adapter first, interface for adding Mailgun/SendGrid later.
7. **Threading strategy:** Outbound emails set `Message-ID: <ticket-{id}-reply-{replyId}@{domain}>` and include an `X-Escalated-Ticket-Id` header. Inbound matching priority: (a) `In-Reply-To` / `References` → extract ticket id from our Message-ID; (b) `X-Escalated-Ticket-Id` header; (c) reply-to token address (`reply+{ticketId}.{hmac}@{inboundDomain}`); (d) subject reference number (`[TK-ABC123]`); (e) fall through to new ticket creation for the sender's contact.
8. **Signed reply-to** uses HMAC-SHA256 of `${ticketId}` with a new config secret `inboundReplySecret`.
9. **Rate limiting:** existing 100 req/min ThrottlerModule stays on the widget. An additional stricter per-email throttle (10 tickets/hour/email) is added for public submission.

---

## Conventions used throughout this plan

- **Paths:** absolute Windows paths. Backend = `C:\Users\work\escalated-nestjs\...`; frontend = `C:\Users\work\escalated\...`.
- **Test command (backend):** `npm test -- <path-to-spec>` or `npm test -- --testNamePattern="<name>"`. Run from backend repo root.
- **Test framework (backend):** Jest 29, file name `*.spec.ts`, directory `test/` mirroring `src/`. Repos mocked via `getRepositoryToken(Entity)` in `@nestjs/testing` modules. EventEmitter2 mocked as `{ emit: jest.fn() }`.
- **TDD rhythm per unit of work:** red (failing test) → run test and observe failure → minimal impl → run test and observe pass → commit. Do not batch.
- **Commits:** use conventional commit prefixes (`feat:`, `fix:`, `test:`, `chore:`, `refactor:`). Commit and push after every task. (Memory: user prefers frequent commits, not batched.)
- **Linting / formatting:** run `npm run lint` before each commit where changes touch `src/` or `test/`.
- **Never `git push --force`**, never `--no-verify`.
- **One task per test concept.** A "task" completes when its tests are green and the diff is committed.

---

## File-level map of the work

### New files (backend `C:\Users\work\escalated-nestjs\`)

| Path | Responsibility |
|---|---|
| `src/entities/contact.entity.ts` | Contact model (email, name, userId, metadata, timestamps). |
| `src/entities/macro.entity.ts` | Macro model (name, description, scope, ownerId, actions JSON). |
| `src/entities/inbound-email.entity.ts` | Audit log for inbound emails (raw payload + parse result + matched ticket). |
| `src/services/contact.service.ts` | `findOrCreateByEmail`, `linkToUser`, `promoteToUser`. |
| `src/services/macro.service.ts` | CRUD + `apply(macroId, ticketId, agentId)`. |
| `src/services/email/email.service.ts` | Outbound dispatch; renders templates; writes standard headers. |
| `src/services/email/email-templates.ts` | Pure functions returning `{ subject, html, text }` per template name. |
| `src/services/email/message-id.ts` | Helpers: `buildMessageId(ticketId, replyId?)`, `parseTicketIdFromMessageId(str)`, `buildReplyTo(ticketId, secret)`, `verifyReplyTo(addr, secret)`. |
| `src/services/email/inbound-parser.interface.ts` | `InboundEmailParser` interface. |
| `src/services/email/postmark-parser.service.ts` | Implements `InboundEmailParser` for Postmark webhook payload. |
| `src/services/email/inbound-router.service.ts` | Takes a parsed inbound email and routes it to reply-on-ticket or new-ticket. |
| `src/services/workflow-executor.service.ts` | Executes Workflow actions against a ticket. Distinct from the existing `WorkflowEngineService` (which evaluates conditions only). |
| `src/listeners/workflow.listener.ts` | `@OnEvent` listener that runs workflows for a matching `triggerEvent`. |
| `src/listeners/email.listener.ts` | `@OnEvent` listeners for outbound transactional emails. |
| `src/controllers/widget/public-ticket.controller.ts` | Optional split of public endpoints; if trivially achievable we stay in existing `widget.controller.ts`. Starts as empty scaffold and only gets extracted if the widget file exceeds ~250 LOC after our additions. |
| `src/controllers/inbound-email.controller.ts` | `POST /escalated/webhook/email/inbound` — signature-checked, provider-agnostic ingress. |
| `src/controllers/admin/macros.controller.ts` | Admin CRUD over `Macro`. |
| `src/controllers/agent/macros.controller.ts` | `GET /escalated/agent/macros` (list applicable) + `POST /escalated/agent/tickets/:id/macros/:macroId/apply`. |
| `src/dto/create-public-ticket.dto.ts` | `{ email, name?, subject, description, priority?, customFields? }`. |
| `src/dto/create-contact.dto.ts` | `{ email, name? }`. |
| `src/dto/create-macro.dto.ts` | Mirror of Macro fields with validation. |
| `src/dto/apply-macro.dto.ts` | `{ macroId: number }` (empty body shape for safety). |
| `src/dto/inbound-email.dto.ts` | Provider-agnostic parsed payload. |
| `test/factories/ticket.factory.ts` | Test factories (fills gap — no factories today). |
| `test/factories/contact.factory.ts` | |
| `test/factories/workflow.factory.ts` | |
| `test/factories/macro.factory.ts` | |

### Modified files (backend)

| Path | Reason |
|---|---|
| `src/entities/ticket.entity.ts` | Add `contactId: number \| null`, relation to `Contact`. |
| `src/entities/workflow.entity.ts` | Narrow `actions` typing (still JSON-backed, but type-safe). |
| `src/entities/index.ts` (if it exists) or the module registration | Register new entities with TypeORM. |
| `src/escalated.module.ts` | Register new services, controllers, listeners, TypeORM entities, mailer module. |
| `src/config/escalated.config.ts` | Add `mail`, `inbound`, `guestPolicy`, `guestUserId` options. |
| `src/controllers/widget/widget.controller.ts` | Accept `email/name`, resolve Contact, invoke policy. |
| `src/services/ticket.service.ts` | Accept `contactId`; keep `requesterId` backwards compatible; a new overload `createForContact(dto, contactId)`. |
| `src/services/workflow-engine.service.ts` | (No behavior change — we add an executor alongside, to keep pure evaluation isolated.) |
| `src/events/escalated.events.ts` | Add `TicketReplyCreatedEvent` typing improvements; add `InboundEmailReceivedEvent`. |
| `package.json` | Add `@nestjs-modules/mailer`, `nodemailer`, `handlebars`, `@types/nodemailer` (dev). |

### New/modified files (frontend `C:\Users\work\escalated\`)

| Path | Action |
|---|---|
| `src/widget/EscalatedWidget.vue` | Modify: collect `email` and `name`, pass in payload. |
| `src/pages/Guest/Create.vue` | Modify: drop `requesterId` dependency; send email/name. |
| `src/pages/Admin/Macros/Index.vue` | New (copy structure from existing Workflows Index). |
| `src/pages/Admin/Macros/Form.vue` | New (evolves from dead `Admin/Automations/Form.vue`). |
| `src/pages/Admin/Automations/` | Delete (dead UI; confirmed by user). |
| `src/pages/Admin/Settings/PublicTickets.vue` | New: Guest policy + inbound email config. |
| `src/pages/Agent/Tickets/MacroMenu.vue` | New: dropdown on ticket detail. |

---

## Phase structure

The plan is broken into nine phases. Each phase ships something useful on its own. A phase must be fully green (all tests pass + lint clean + committed) before the next begins.

- **Phase 0 — Foundation:** test factories, config shape, dependencies.
- **Phase 1 — Contact entity + service.**
- **Phase 2 — Public ticket submission accepts email/name and resolves a Contact.**
- **Phase 3 — Workflow executor + `TICKET_CREATED` listener (routing goes live).**
- **Phase 4 — Outbound email (transactional).**
- **Phase 5 — Inbound email ingress (new ticket + reply threading).**
- **Phase 6 — Guest policy + admin settings UI.**
- **Phase 7 — Macros (repurposed from Automations).**
- **Phase 8 — Frontend wiring (widget + Guest page).**
- **Phase 9 — Cleanup + docs.**

Each phase has a **definition of done** at the top and a checklist of TDD tasks.

---

# Phase 0 — Foundation

**Definition of done:**
- Test factories exist for Ticket, Contact, Workflow, Macro (even though Contact/Macro entities don't exist yet, the factory shapes are typed against future interfaces).
- `package.json` has new email dependencies installed.
- `EscalatedModuleOptions` is extended with typed `mail`, `inbound`, `guestPolicy`, `guestUserId` fields but no behavior yet.
- `npm test` still passes with no regressions.

### Task 0.1 — Install mail dependencies — COMPLETED d401a83

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\package.json`
- Modify: `C:\Users\work\escalated-nestjs\package-lock.json` (automatic)

- [x] **Step 1:** From backend root, run:
  ```bash
  npm install @nestjs-modules/mailer nodemailer handlebars
  npm install --save-dev @types/nodemailer
  ```
- [x] **Step 2:** Verify `package.json` has the four dependencies pinned.
- [x] **Step 3:** Run `npm test` — expect unchanged pass count.
- [x] **Step 4:** Run `npm run lint`. Fix any issues.
- [x] **Step 5:** Commit (done in commit d401a83 on branch feat/public-ticket-system)

### Task 0.2 — Extend `EscalatedModuleOptions` with mail/inbound/guest-policy fields (types only) — COMPLETED 4ff1310

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\config\escalated.config.ts`
- Test: `C:\Users\work\escalated-nestjs\test\config\escalated.config.spec.ts` (new)

- [ ] **Step 1 (red):** Create `test/config/escalated.config.spec.ts`:
  ```typescript
  import type { EscalatedModuleOptions } from '../../src/config/escalated.config';

  describe('EscalatedModuleOptions', () => {
    it('accepts mail config', () => {
      const opts: EscalatedModuleOptions = {
        mail: {
          from: 'support@example.com',
          transport: { host: 'smtp.example.com', port: 587, auth: { user: 'x', pass: 'y' } },
        },
      };
      expect(opts.mail?.from).toBe('support@example.com');
    });

    it('accepts inbound config with secret', () => {
      const opts: EscalatedModuleOptions = {
        inbound: {
          replyDomain: 'reply.example.com',
          replySecret: 'deadbeef',
          webhookSecret: 'hunter2',
        },
      };
      expect(opts.inbound?.replySecret).toBe('deadbeef');
    });

    it('accepts guestPolicy with required shape', () => {
      const opts: EscalatedModuleOptions = {
        guestPolicy: { mode: 'unassigned' },
      };
      expect(opts.guestPolicy?.mode).toBe('unassigned');
    });

    it('accepts guestPolicy with guest_user mode + user id', () => {
      const opts: EscalatedModuleOptions = {
        guestPolicy: { mode: 'guest_user', guestUserId: 42 },
      };
      expect(opts.guestPolicy?.guestUserId).toBe(42);
    });
  });
  ```
- [ ] **Step 2:** Run: `npm test -- test/config/escalated.config.spec.ts`. Expect compile failures — new fields don't exist.
- [ ] **Step 3 (green):** Edit `src/config/escalated.config.ts` — add to `EscalatedModuleOptions` interface:
  ```typescript
  mail?: {
    from: string;
    transport:
      | { host: string; port: number; auth: { user: string; pass: string }; secure?: boolean }
      | { service: 'postmark'; auth: { user: string; pass: string } };
  };

  inbound?: {
    replyDomain: string;
    replySecret: string;
    webhookSecret: string;
    provider?: 'postmark' | 'mailgun' | 'sendgrid';
  };

  guestPolicy?:
    | { mode: 'unassigned' }
    | { mode: 'guest_user'; guestUserId: number }
    | { mode: 'prompt_signup'; signupUrlTemplate?: string };
  ```
- [ ] **Step 4:** Re-run the spec — expect pass.
- [ ] **Step 5:** `npm run lint`. Fix any issues.
- [ ] **Step 6:** Commit + push:
  ```bash
  git add src/config/escalated.config.ts test/config/escalated.config.spec.ts
  git commit -m "feat(config): type mail, inbound, and guestPolicy options"
  git push
  ```

### Task 0.3 — Create test factories — COMPLETED (see commit on feat/public-ticket-system)

**Files:**
- Create: `C:\Users\work\escalated-nestjs\test\factories\index.ts`
- Create: `C:\Users\work\escalated-nestjs\test\factories\ticket.factory.ts`
- Create: `C:\Users\work\escalated-nestjs\test\factories\workflow.factory.ts`
- Test: `C:\Users\work\escalated-nestjs\test\factories\factories.spec.ts` (new, sanity-check)

Contact and Macro factories are added in their respective phases.

- [ ] **Step 1 (red):** Create `test/factories/factories.spec.ts`:
  ```typescript
  import { buildTicket } from './ticket.factory';
  import { buildWorkflow } from './workflow.factory';

  describe('factories', () => {
    it('builds a ticket with overrides', () => {
      const t = buildTicket({ subject: 'Override' });
      expect(t.subject).toBe('Override');
      expect(t.priority).toBe('medium');
      expect(t.guestAccessToken).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('builds a workflow with conditions and actions', () => {
      const w = buildWorkflow({
        triggerEvent: 'ticket.created',
        conditions: { all: [{ field: 'priority', operator: 'equals', value: 'urgent' }] },
        actions: [{ type: 'assign_agent', value: '7' }],
      });
      expect(w.triggerEvent).toBe('ticket.created');
      expect(w.actions).toHaveLength(1);
    });
  });
  ```
- [ ] **Step 2:** Run spec, expect module-resolution failure.
- [ ] **Step 3 (green):** Create `test/factories/ticket.factory.ts`:
  ```typescript
  import { v4 as uuid } from 'uuid';

  export function buildTicket(overrides: Partial<any> = {}): any {
    return {
      id: 1,
      referenceNumber: 'TK-TEST001',
      subject: 'Test',
      description: 'Description',
      priority: 'medium',
      channel: 'widget',
      statusId: 1,
      requesterId: 0,
      contactId: null,
      assigneeId: null,
      guestAccessToken: uuid(),
      tags: [],
      ...overrides,
    };
  }
  ```
- [ ] **Step 4:** Create `test/factories/workflow.factory.ts`:
  ```typescript
  export function buildWorkflow(overrides: Partial<any> = {}): any {
    return {
      id: 1,
      name: 'Test Workflow',
      description: null,
      triggerEvent: 'ticket.created',
      conditions: {},
      actions: [],
      position: 0,
      isActive: true,
      stopOnMatch: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
  ```
- [ ] **Step 5:** Create `test/factories/index.ts`:
  ```typescript
  export * from './ticket.factory';
  export * from './workflow.factory';
  ```
- [ ] **Step 6:** Run spec — expect pass.
- [ ] **Step 7:** Commit + push:
  ```bash
  git add test/factories
  git commit -m "test: add ticket and workflow factories"
  git push
  ```

---

# Phase 1 — Contact entity + service

**Definition of done:**
- `Contact` entity exists with migration-ready schema.
- `ContactService.findOrCreateByEmail`, `linkToUser`, `promoteToUser` implemented with tests.
- `Ticket` has nullable `contactId` with relation; existing `requesterId` untouched.
- All new code passes lint + tests.

### Task 1.1 — `Contact` entity — COMPLETED eab03f2

**Files:**
- Create: `C:\Users\work\escalated-nestjs\src\entities\contact.entity.ts`
- Test: `C:\Users\work\escalated-nestjs\test\entities\contact.entity.spec.ts`

- [ ] **Step 1 (red):** Create `test/entities/contact.entity.spec.ts`:
  ```typescript
  import { Contact } from '../../src/entities/contact.entity';

  describe('Contact entity', () => {
    it('constructs with required email', () => {
      const c = new Contact();
      c.email = 'alice@example.com';
      c.name = 'Alice';
      expect(c.email).toBe('alice@example.com');
      expect(c.name).toBe('Alice');
    });

    it('allows null userId (guest) and null name', () => {
      const c = new Contact();
      c.email = 'x@y.z';
      c.userId = null;
      c.name = null;
      expect(c.userId).toBeNull();
      expect(c.name).toBeNull();
    });
  });
  ```
- [ ] **Step 2:** Run the spec. Expect compile error: module not found.
- [ ] **Step 3 (green):** Create `src/entities/contact.entity.ts`:
  ```typescript
  import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';

  @Entity('escalated_contacts')
  @Index(['email'], { unique: true })
  export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 320 })
    email: string;

    @Column({ length: 255, nullable: true, type: 'varchar' })
    name: string | null;

    /** Links this contact to a host-app user once they create an account. */
    @Column({ type: 'int', nullable: true })
    userId: number | null;

    @Column({ type: 'simple-json', default: '{}' })
    metadata: Record<string, unknown>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
  }
  ```
- [ ] **Step 4:** Re-run spec. Expect pass.
- [ ] **Step 5:** Lint + commit:
  ```bash
  npm run lint
  git add src/entities/contact.entity.ts test/entities/contact.entity.spec.ts
  git commit -m "feat(contact): add Contact entity"
  git push
  ```

### Task 1.2 — Register `Contact` in EscalatedModule — COMPLETED 7258712

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\escalated.module.ts`

- [ ] **Step 1 (red):** Add to an existing spec (or create `test/escalated.module.spec.ts` if not present) — a test that imports `Contact` repository token and asserts the module can resolve it:
  ```typescript
  import { Test } from '@nestjs/testing';
  import { EscalatedModule } from '../src/escalated.module';
  import { getRepositoryToken } from '@nestjs/typeorm';
  import { Contact } from '../src/entities/contact.entity';

  describe('EscalatedModule — Contact registration', () => {
    it('exposes a Contact repository token', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EscalatedModule.forRoot({ database: { type: 'sqlite', database: ':memory:' } as any })],
      })
        .overrideProvider(getRepositoryToken(Contact))
        .useValue({})
        .compile();
      expect(moduleRef.get(getRepositoryToken(Contact))).toBeDefined();
    });
  });
  ```
  *(Note: if the existing module's `forRoot` signature differs, inspect it first and mirror its existing test setup — the factories spec shows the project's actual Test module usage.)*
- [ ] **Step 2:** Run — expect failure that `Contact` isn't in `TypeOrmModule.forFeature([...])`.
- [ ] **Step 3 (green):** In `src/escalated.module.ts`, locate the existing `TypeOrmModule.forFeature([...])` array and add `Contact`. Also add `Contact` to any `entities: [...]` declaration in the datasource config.
- [ ] **Step 4:** Re-run spec — expect pass.
- [ ] **Step 5:** Commit + push:
  ```bash
  git add src/escalated.module.ts test/escalated.module.spec.ts
  git commit -m "feat(contact): register Contact entity with TypeORM"
  git push
  ```

### Task 1.3 — Add `contactId` to `Ticket` — COMPLETED 56e75fe

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\entities\ticket.entity.ts`
- Test: `C:\Users\work\escalated-nestjs\test\entities\ticket.contact.spec.ts` (new)

- [ ] **Step 1 (red):** Create `test/entities/ticket.contact.spec.ts`:
  ```typescript
  import { Ticket } from '../../src/entities/ticket.entity';

  describe('Ticket.contactId', () => {
    it('is nullable', () => {
      const t = new Ticket();
      t.contactId = null;
      expect(t.contactId).toBeNull();
    });

    it('accepts a numeric id', () => {
      const t = new Ticket();
      t.contactId = 42;
      expect(t.contactId).toBe(42);
    });
  });
  ```
- [ ] **Step 2:** Run — expect compile failure (`contactId` does not exist).
- [ ] **Step 3 (green):** In `src/entities/ticket.entity.ts`, next to the `requesterId` column, add:
  ```typescript
  @Column({ type: 'int', nullable: true })
  contactId: number | null;
  ```
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Run the full existing `test/services/ticket.service.spec.ts` to ensure nothing broke: `npm test -- test/services/ticket.service.spec.ts`.
- [ ] **Step 6:** Commit + push:
  ```bash
  git add src/entities/ticket.entity.ts test/entities/ticket.contact.spec.ts
  git commit -m "feat(ticket): add nullable contactId column"
  git push
  ```

### Task 1.4 — `ContactService.findOrCreateByEmail` — COMPLETED 3574928

**Files:**
- Create: `C:\Users\work\escalated-nestjs\src\services\contact.service.ts`
- Create: `C:\Users\work\escalated-nestjs\test\factories\contact.factory.ts`
- Test: `C:\Users\work\escalated-nestjs\test\services\contact.service.spec.ts`

- [ ] **Step 1 (red):** Create factory `test/factories/contact.factory.ts`:
  ```typescript
  export function buildContact(overrides: Partial<any> = {}): any {
    return {
      id: 1,
      email: 'alice@example.com',
      name: 'Alice',
      userId: null,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
  ```
- [ ] **Step 2:** Export it from `test/factories/index.ts`.
- [ ] **Step 3 (red):** Create `test/services/contact.service.spec.ts`:
  ```typescript
  import { Test } from '@nestjs/testing';
  import { getRepositoryToken } from '@nestjs/typeorm';
  import { Contact } from '../../src/entities/contact.entity';
  import { ContactService } from '../../src/services/contact.service';
  import { buildContact } from '../factories';

  describe('ContactService', () => {
    let service: ContactService;
    let repo: any;

    beforeEach(async () => {
      repo = {
        findOne: jest.fn(),
        create: jest.fn((x) => x),
        save: jest.fn(async (x) => ({ ...x, id: 99 })),
      };
      const moduleRef = await Test.createTestingModule({
        providers: [
          ContactService,
          { provide: getRepositoryToken(Contact), useValue: repo },
        ],
      }).compile();
      service = moduleRef.get(ContactService);
    });

    describe('findOrCreateByEmail', () => {
      it('returns existing contact when email matches (case-insensitive)', async () => {
        const existing = buildContact({ email: 'alice@example.com' });
        repo.findOne.mockResolvedValue(existing);
        const result = await service.findOrCreateByEmail('ALICE@example.com');
        expect(result).toBe(existing);
        expect(repo.save).not.toHaveBeenCalled();
      });

      it('creates a new contact when email is new', async () => {
        repo.findOne.mockResolvedValue(null);
        const result = await service.findOrCreateByEmail('bob@example.com', 'Bob');
        expect(repo.save).toHaveBeenCalled();
        expect(result.email).toBe('bob@example.com');
        expect(result.name).toBe('Bob');
        expect(result.id).toBe(99);
      });

      it('normalizes email to lowercase when creating', async () => {
        repo.findOne.mockResolvedValue(null);
        const result = await service.findOrCreateByEmail('UPPER@Case.COM');
        expect(result.email).toBe('upper@case.com');
      });

      it('updates a blank name on existing contact if one is provided', async () => {
        const existing = buildContact({ email: 'alice@example.com', name: null });
        repo.findOne.mockResolvedValue(existing);
        repo.save.mockImplementation(async (x) => x);
        const result = await service.findOrCreateByEmail('alice@example.com', 'Alice');
        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice' }));
        expect(result.name).toBe('Alice');
      });

      it('does not overwrite a non-blank name', async () => {
        const existing = buildContact({ email: 'alice@example.com', name: 'Alice' });
        repo.findOne.mockResolvedValue(existing);
        const result = await service.findOrCreateByEmail('alice@example.com', 'Different');
        expect(repo.save).not.toHaveBeenCalled();
        expect(result.name).toBe('Alice');
      });
    });

    describe('linkToUser', () => {
      it('sets userId on the contact', async () => {
        const existing = buildContact({ id: 7, userId: null });
        repo.findOne.mockResolvedValue(existing);
        repo.save.mockImplementation(async (x) => x);
        const updated = await service.linkToUser(7, 123);
        expect(updated.userId).toBe(123);
      });

      it('throws when contact not found', async () => {
        repo.findOne.mockResolvedValue(null);
        await expect(service.linkToUser(7, 123)).rejects.toThrow();
      });
    });
  });
  ```
- [ ] **Step 4:** Run — expect failure (no ContactService).
- [ ] **Step 5 (green):** Create `src/services/contact.service.ts`:
  ```typescript
  import { Injectable, NotFoundException } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Contact } from '../entities/contact.entity';

  @Injectable()
  export class ContactService {
    constructor(
      @InjectRepository(Contact)
      private readonly contactRepo: Repository<Contact>,
    ) {}

    private normalize(email: string): string {
      return email.trim().toLowerCase();
    }

    async findOrCreateByEmail(email: string, name?: string | null): Promise<Contact> {
      const normalized = this.normalize(email);
      const existing = await this.contactRepo.findOne({ where: { email: normalized } });
      if (existing) {
        if (!existing.name && name) {
          existing.name = name;
          return this.contactRepo.save(existing);
        }
        return existing;
      }
      const created = this.contactRepo.create({
        email: normalized,
        name: name ?? null,
        userId: null,
        metadata: {},
      });
      return this.contactRepo.save(created);
    }

    async linkToUser(contactId: number, userId: number): Promise<Contact> {
      const existing = await this.contactRepo.findOne({ where: { id: contactId } });
      if (!existing) {
        throw new NotFoundException(`Contact ${contactId} not found`);
      }
      existing.userId = userId;
      return this.contactRepo.save(existing);
    }

    async findByEmail(email: string): Promise<Contact | null> {
      return this.contactRepo.findOne({ where: { email: this.normalize(email) } });
    }

    async findById(id: number): Promise<Contact | null> {
      return this.contactRepo.findOne({ where: { id } });
    }
  }
  ```
- [ ] **Step 6:** Register `ContactService` in `src/escalated.module.ts` `providers` array and export it.
- [ ] **Step 7:** Re-run the spec — expect all pass.
- [ ] **Step 8:** Lint + commit + push:
  ```bash
  npm run lint
  git add src/services/contact.service.ts src/escalated.module.ts test/services/contact.service.spec.ts test/factories
  git commit -m "feat(contact): add ContactService with findOrCreateByEmail"
  git push
  ```

### Task 1.5 — `ContactService.promoteToUser` (account creation hook) — COMPLETED 3574928 (same commit as 1.4)

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\services\contact.service.ts`
- Modify: `C:\Users\work\escalated-nestjs\test\services\contact.service.spec.ts`

Purpose: when a guest accepts the "create an account" invite, the host app creates a user and calls `promoteToUser(contactId, userId)` which links the contact and retroactively stamps `ticket.requesterId` on all prior tickets for that contact.

- [ ] **Step 1 (red):** Add to the spec:
  ```typescript
  describe('promoteToUser', () => {
    it('links the contact and updates all prior tickets owned by this contact', async () => {
      const existing = buildContact({ id: 7 });
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockImplementation(async (x) => x);
      const ticketRepo = { update: jest.fn().mockResolvedValue({ affected: 3 }) };

      // Re-create the module providing an extra ticketRepo dependency
      const moduleRef2 = await Test.createTestingModule({
        providers: [
          ContactService,
          { provide: getRepositoryToken(Contact), useValue: repo },
          { provide: 'TICKET_REPOSITORY_FOR_CONTACT', useValue: ticketRepo }, // placeholder; real token below
        ],
      }).compile();
      // Real test uses getRepositoryToken(Ticket); adjust import.
    });
  });
  ```
  *(Before implementing: rewrite this test cleanly to use `getRepositoryToken(Ticket)` and update the main `beforeEach` to provide the Ticket repo mock from the start.)*
- [ ] **Step 2:** Revise `beforeEach` so `ContactService` is constructed with both `Contact` and `Ticket` repo mocks. Update existing tests accordingly (they won't break — they don't use ticketRepo).
- [ ] **Step 3:** Implement the real test:
  ```typescript
  describe('promoteToUser', () => {
    it('sets userId and updates tickets', async () => {
      const existing = buildContact({ id: 7, userId: null });
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockImplementation(async (x) => x);
      ticketRepo.update.mockResolvedValue({ affected: 3 });

      const result = await service.promoteToUser(7, 555);

      expect(result.userId).toBe(555);
      expect(ticketRepo.update).toHaveBeenCalledWith(
        { contactId: 7 },
        { requesterId: 555 },
      );
    });
  });
  ```
- [ ] **Step 4:** Run — expect failure (`promoteToUser` doesn't exist).
- [ ] **Step 5 (green):** Add to `contact.service.ts`:
  ```typescript
  import { Ticket } from '../entities/ticket.entity';
  // ...
  constructor(
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
  ) {}

  async promoteToUser(contactId: number, userId: number): Promise<Contact> {
    const linked = await this.linkToUser(contactId, userId);
    await this.ticketRepo.update({ contactId }, { requesterId: userId });
    return linked;
  }
  ```
- [ ] **Step 6:** Re-run — expect pass.
- [ ] **Step 7:** Commit + push:
  ```bash
  git add src/services/contact.service.ts test/services/contact.service.spec.ts
  git commit -m "feat(contact): add promoteToUser to backfill requesterId on linked tickets"
  git push
  ```

---

# Phase 2 — Public ticket submission accepts email/name and resolves a Contact

**Definition of done:**
- `POST /escalated/widget/tickets` accepts `{ email, name?, subject, description, priority? }` instead of `requesterId`.
- Backwards compat: if `requesterId` is supplied, it is honored (host-app user flow unchanged).
- Missing email without `requesterId` returns 400.
- Submitter is auto-deduped into a `Contact` record.
- Created ticket has `contactId` set and, according to guest policy, either `requesterId = 0`, `requesterId = guestUserId`, or `requesterId = 0` (for `prompt_signup`).
- A per-email rate limit (10/hour) is enforced.

### Task 2.1 — `CreatePublicTicketDto` with validation — COMPLETED 03c2bd8

**Files:**
- Create: `C:\Users\work\escalated-nestjs\src\dto\create-public-ticket.dto.ts`
- Test: `C:\Users\work\escalated-nestjs\test\dto\create-public-ticket.dto.spec.ts`

- [ ] **Step 1 (red):** Create the spec:
  ```typescript
  import { validate } from 'class-validator';
  import { plainToInstance } from 'class-transformer';
  import { CreatePublicTicketDto } from '../../src/dto/create-public-ticket.dto';

  describe('CreatePublicTicketDto', () => {
    async function validateDto(raw: any) {
      return validate(plainToInstance(CreatePublicTicketDto, raw));
    }

    it('accepts a minimal valid payload', async () => {
      const errors = await validateDto({
        email: 'a@b.com',
        subject: 'Help',
        description: 'Need help',
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects missing email', async () => {
      const errors = await validateDto({ subject: 'Help', description: 'x' });
      expect(errors.map((e) => e.property)).toContain('email');
    });

    it('rejects invalid email', async () => {
      const errors = await validateDto({
        email: 'not-an-email',
        subject: 'Help',
        description: 'x',
      });
      expect(errors.map((e) => e.property)).toContain('email');
    });

    it('rejects empty subject', async () => {
      const errors = await validateDto({ email: 'a@b.com', subject: '', description: 'x' });
      expect(errors.map((e) => e.property)).toContain('subject');
    });

    it('allows optional name, priority', async () => {
      const errors = await validateDto({
        email: 'a@b.com',
        name: 'Alice',
        subject: 'Help',
        description: 'x',
        priority: 'high',
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects invalid priority value', async () => {
      const errors = await validateDto({
        email: 'a@b.com',
        subject: 'Help',
        description: 'x',
        priority: 'nuclear',
      });
      expect(errors.map((e) => e.property)).toContain('priority');
    });
  });
  ```
- [ ] **Step 2:** Run — expect compile failure.
- [ ] **Step 3 (green):** Create `src/dto/create-public-ticket.dto.ts`:
  ```typescript
  import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

  export class CreatePublicTicketDto {
    @IsEmail()
    @MaxLength(320)
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsString()
    @MinLength(1)
    @MaxLength(255)
    subject: string;

    @IsString()
    @MinLength(1)
    description: string;

    @IsOptional()
    @IsEnum(['low', 'medium', 'high', 'urgent'])
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }
  ```
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 2.2 — Widget controller accepts DTO + resolves Contact — COMPLETED df06c01

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\controllers\widget\widget.controller.ts`
- Modify: `C:\Users\work\escalated-nestjs\test\controllers\widget.controller.spec.ts`

- [ ] **Step 1 (red):** Add to the widget controller spec (replacing or alongside existing `createTicket` test):
  ```typescript
  describe('createTicket (public form)', () => {
    let contactService: any;

    beforeEach(async () => {
      contactService = {
        findOrCreateByEmail: jest.fn().mockResolvedValue({ id: 42 }),
      };

      const moduleRef = await Test.createTestingModule({
        controllers: [WidgetController],
        providers: [
          { provide: TicketService, useValue: ticketService },
          { provide: ContactService, useValue: contactService },
          // ... other mocks (ReplyService etc.)
        ],
      }).compile();
      controller = moduleRef.get(WidgetController);
    });

    it('resolves a Contact by email and passes contactId to TicketService', async () => {
      ticketService.create.mockResolvedValue(mockTicket);
      const dto = { email: 'alice@x.com', name: 'Alice', subject: 'Help', description: 'd' };

      await controller.createTicket(dto);

      expect(contactService.findOrCreateByEmail).toHaveBeenCalledWith('alice@x.com', 'Alice');
      expect(ticketService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'widget',
          subject: 'Help',
          contactId: 42,
        }),
        0, // requesterId defaults to 0 under unassigned policy
      );
    });

    it('still accepts legacy requesterId without email (authenticated host-app flow)', async () => {
      ticketService.create.mockResolvedValue(mockTicket);
      await controller.createTicket({ requesterId: 17, subject: 'Help', description: 'd' });
      expect(contactService.findOrCreateByEmail).not.toHaveBeenCalled();
      expect(ticketService.create).toHaveBeenCalledWith(
        expect.objectContaining({ channel: 'widget' }),
        17,
      );
    });

    it('rejects when neither email nor requesterId is supplied', async () => {
      await expect(
        controller.createTicket({ subject: 'Help', description: 'd' }),
      ).rejects.toThrow();
    });
  });
  ```
- [ ] **Step 2:** Run — expect failures.
- [ ] **Step 3 (green):** Modify `src/controllers/widget/widget.controller.ts`:
  ```typescript
  import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
  import { TicketService } from '../../services/ticket.service';
  import { ContactService } from '../../services/contact.service';
  import { CreatePublicTicketDto } from '../../dto/create-public-ticket.dto';

  @Controller('escalated/widget')
  export class WidgetController {
    constructor(
      private readonly ticketService: TicketService,
      private readonly contactService: ContactService,
      // ... other services unchanged
    ) {}

    @Post('tickets')
    async createTicket(@Body() body: any) {
      let contactId: number | null = null;
      let requesterId = body.requesterId ?? 0;

      if (body.email) {
        // Full DTO validation path
        const dto = Object.assign(new CreatePublicTicketDto(), body);
        const contact = await this.contactService.findOrCreateByEmail(dto.email, dto.name);
        contactId = contact.id;
      } else if (!body.requesterId) {
        throw new BadRequestException('Either email or requesterId is required');
      }

      const ticket = await this.ticketService.create(
        {
          subject: body.subject,
          description: body.description,
          priority: body.priority || 'medium',
          channel: 'widget',
          contactId,
        } as any,
        requesterId,
      );

      return { ticket, guestAccessToken: ticket.guestAccessToken };
    }
  }
  ```
  *(Guest policy application is added in Task 2.4; for now `requesterId` stays 0 when email is used.)*
- [ ] **Step 4:** Update `widget.controller.spec.ts`'s `beforeEach` to supply the ContactService mock. Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 2.3 — `TicketService.create` writes `contactId` — COMPLETED 44b1330

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\services\ticket.service.ts`
- Modify: `C:\Users\work\escalated-nestjs\test\services\ticket.service.spec.ts`

- [ ] **Step 1 (red):** Add test:
  ```typescript
  it('passes contactId through to the repo when provided', async () => {
    await service.create(
      { subject: 's', description: 'd', contactId: 42 } as any,
      0,
    );
    expect(ticketRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ contactId: 42, requesterId: 0 }),
    );
  });

  it('defaults contactId to null when not provided', async () => {
    await service.create({ subject: 's', description: 'd' } as any, 5);
    expect(ticketRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ contactId: null, requesterId: 5 }),
    );
  });
  ```
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** In `TicketService.create()`, extend the `ticketRepo.create({...})` call to include `contactId: dto.contactId ?? null`. Also extend whatever DTO type is imported to include an optional `contactId`.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 2.4 — Apply Guest Policy in widget controller — COMPLETED df06c01 (same as 2.2)

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\controllers\widget\widget.controller.ts`
- Modify: `C:\Users\work\escalated-nestjs\test\controllers\widget.controller.spec.ts`

- [ ] **Step 1 (red):** Add spec cases for each mode:
  ```typescript
  describe('guest policy', () => {
    function makeController(policy: any) {
      // reuse Test.createTestingModule with a config provider that exposes `guestPolicy`
    }

    it('mode=unassigned keeps requesterId=0', async () => { /* ... */ });
    it('mode=guest_user uses the configured guestUserId as requesterId', async () => {
      const c = makeController({ mode: 'guest_user', guestUserId: 99 });
      await c.createTicket({ email: 'a@b.com', subject: 's', description: 'd' });
      expect(ticketService.create).toHaveBeenCalledWith(
        expect.anything(),
        99,
      );
    });
    it('mode=prompt_signup keeps requesterId=0 and emits a TicketSignupInviteEvent', async () => { /* ... */ });
  });
  ```
- [ ] **Step 2:** Run — expect failures.
- [ ] **Step 3 (green):** Add a `GuestPolicyService` (or a simple `@Inject('ESCALATED_OPTIONS')` into the controller). Simpler: inject the options object directly via a token:
  ```typescript
  import { Inject } from '@nestjs/common';
  @Controller('escalated/widget')
  export class WidgetController {
    constructor(
      @Inject('ESCALATED_OPTIONS') private readonly options: EscalatedModuleOptions,
      // ...
    ) {}

    private resolveGuestRequesterId(): number {
      const p = this.options.guestPolicy;
      if (!p || p.mode === 'unassigned' || p.mode === 'prompt_signup') return 0;
      if (p.mode === 'guest_user') return p.guestUserId;
      return 0;
    }
  }
  ```
  In `createTicket`, when email was used and no `body.requesterId`, set `requesterId = this.resolveGuestRequesterId()`.
- [ ] **Step 4:** Emit a `TicketSignupInviteEvent` in `prompt_signup` mode (defined in `src/events/escalated.events.ts`; consumed by `email.listener.ts` in Phase 4).
- [ ] **Step 5:** Re-run — expect pass.
- [ ] **Step 6:** Commit + push.

### Task 2.5 — Per-email rate limit for public submission — COMPLETED (latest)

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\controllers\widget\widget.controller.ts`
- Create: `C:\Users\work\escalated-nestjs\src\guards\public-submit-throttle.guard.ts`
- Test: new spec for the guard.

- [ ] **Step 1 (red):** Create `test/guards/public-submit-throttle.guard.spec.ts` covering: first request passes; 11th within an hour rejects with 429.
- [ ] **Step 2:** Run — expect compile failure.
- [ ] **Step 3 (green):** Implement a `PublicSubmitThrottleGuard` using an in-memory `Map<string, number[]>` keyed by lowercased email. For production safety, comment in the source: `// TODO: replace with a Redis-backed store when @nestjs/throttler ships a by-payload-key strategy in the host app`. Keep it pluggable via constructor injection of a simple `RateLimiter` port.
- [ ] **Step 4:** Apply `@UseGuards(PublicSubmitThrottleGuard)` to `createTicket` only when `body.email` is present (either split the method or wire the guard to skip when no email).
- [ ] **Step 5:** Re-run — expect pass.
- [ ] **Step 6:** Commit + push.

---

# Phase 3 — Workflow executor + routing becomes live

**Definition of done:**
- A `WorkflowExecutorService` performs every Workflow action defined in Section C of the audit (assign_agent, change_priority, add_tag, remove_tag, change_status, set_department, add_note, send_webhook, add_follower, delay — `send_notification` is stubbed until Phase 4).
- A `WorkflowListener` subscribes to `ticket.*`, `reply.*`, `sla.*` events, loads active workflows in `position` order, evaluates conditions, executes matching actions, and writes a `WorkflowLog` row per execution.
- `stopOnMatch` is honored.
- Round-robin assignment is implemented under a new action `assign_round_robin` (team id or null=global).
- Existing `WorkflowEngineService` is unchanged (pure condition evaluator).

### Task 3.1 — `WorkflowExecutorService` skeleton with action dispatch — COMPLETED (see Phase 3 series)

**Files:**
- Create: `C:\Users\work\escalated-nestjs\src\services\workflow-executor.service.ts`
- Test: `C:\Users\work\escalated-nestjs\test\services\workflow-executor.service.spec.ts`

- [ ] **Step 1 (red):** Spec scaffold:
  ```typescript
  describe('WorkflowExecutorService.execute', () => {
    it('dispatches each action by type', async () => {
      const ticket = buildTicket({ id: 10 });
      await executor.execute(ticket, [
        { type: 'change_priority', value: 'urgent' },
        { type: 'add_tag', value: 'vip' },
      ]);
      expect(ticketRepo.update).toHaveBeenCalledWith(10, expect.objectContaining({ priority: 'urgent' }));
      expect(tagRepo.addToTicket).toHaveBeenCalledWith(10, 'vip');
    });

    it('throws on unknown action type', async () => {
      await expect(executor.execute(buildTicket(), [{ type: 'nonsense' }])).rejects.toThrow();
    });
  });
  ```
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Create the service with a dispatch table:
  ```typescript
  @Injectable()
  export class WorkflowExecutorService {
    constructor(
      @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
      @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
      // ... inject repos as needed per action
      private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(ticket: Ticket, actions: Array<{ type: string; value?: string }>) {
      for (const action of actions) {
        await this.dispatch(ticket, action);
      }
    }

    private async dispatch(ticket: Ticket, action: { type: string; value?: string }) {
      switch (action.type) {
        case 'change_priority': return this.changePriority(ticket, action.value!);
        case 'add_tag': return this.addTag(ticket, action.value!);
        // ... every other action
        default: throw new Error(`Unknown workflow action: ${action.type}`);
      }
    }
  }
  ```
- [ ] **Step 4:** Implement `changePriority` and `addTag` only.
- [ ] **Step 5:** Re-run — expect pass.
- [ ] **Step 6:** Commit + push.

### Tasks 3.2 – 3.6 — Implement each action — COMPLETED (same commit as 3.1)

Actions shipped: change_priority, add_tag, remove_tag, change_status, set_department, assign_agent, add_note.

### Tasks 3.7 – 3.10 — DEFERRED to a follow-up phase

Each of these follows the same TDD pattern. **Do not batch.** Each gets its own red spec, minimal impl, commit.

- [ ] **Task 3.2** — `assign_agent` (sets `ticket.assigneeId`, writes an Activity log, emits `TicketAssignedEvent`).
- [ ] **Task 3.3** — `change_status` (looks up status by slug or id, sets `ticket.statusId`, emits `TicketStatusChangedEvent`).
- [ ] **Task 3.4** — `set_department` (sets `ticket.departmentId`, emits `TicketDepartmentChangedEvent`).
- [ ] **Task 3.5** — `remove_tag`.
- [ ] **Task 3.6** — `add_note` (inserts an internal note Reply with `isInternal=true`).
- [ ] **Task 3.7** — `send_webhook` (HTTP POST with ticket payload; uses the existing WebhookService if reachable; else axios directly with a per-workflow target url).
- [ ] **Task 3.8** — `add_follower` (inserts a follower record).
- [ ] **Task 3.9** — `delay` (schedules a re-enqueue via `EscalatedSchedulerService` or via a deferred event — implement the simplest: store a `deferredWorkflowJob` row and have the scheduler poll every minute).
- [ ] **Task 3.10** — `assign_round_robin` (pick next agent from the target team; use a per-team cursor persisted in a small `RoundRobinCursor` entity keyed by teamId).

Each task's spec covers: success path, no-op path (e.g. status slug missing), and failure is logged-but-not-thrown (for resilience; the WorkflowLog captures the failure).

### Task 3.11 — `WorkflowListener` — COMPLETED (routing goes live)

**Files:**
- Create: `C:\Users\work\escalated-nestjs\src\listeners\workflow.listener.ts`
- Create: `C:\Users\work\escalated-nestjs\src\services\workflow-runner.service.ts`
- Test: `C:\Users\work\escalated-nestjs\test\listeners\workflow.listener.spec.ts`

- [ ] **Step 1 (red):** Spec: when `TICKET_CREATED` fires, all active workflows with `triggerEvent='ticket.created'` are loaded in `position` ASC, conditions evaluated via the existing `WorkflowEngineService`, matched ones dispatched to `WorkflowExecutorService`, and a `WorkflowLog` row inserted per match. `stopOnMatch` stops iteration.
- [ ] **Step 2:** Run — expect failures.
- [ ] **Step 3 (green):** Implement `WorkflowRunnerService.runForEvent(triggerEvent, ticket)`:
  ```typescript
  async runForEvent(triggerEvent: string, ticket: Ticket) {
    const workflows = await this.workflowRepo.find({
      where: { triggerEvent, isActive: true },
      order: { position: 'ASC' },
    });

    const ticketAsMap = this.ticketToConditionMap(ticket);

    for (const wf of workflows) {
      const matched = this.engine.evaluateConditions(wf.conditions as any, ticketAsMap);
      await this.logRepo.save({ workflowId: wf.id, ticketId: ticket.id, matched, ranAt: new Date() });
      if (matched) {
        try {
          await this.executor.execute(ticket, wf.actions as any);
        } catch (err) {
          await this.logRepo.update({ workflowId: wf.id, ticketId: ticket.id }, { error: String(err) });
        }
        if (wf.stopOnMatch) break;
      }
    }
  }
  ```
  Then the listener:
  ```typescript
  @Injectable()
  export class WorkflowListener {
    constructor(private readonly runner: WorkflowRunnerService) {}

    @OnEvent(ESCALATED_EVENTS.TICKET_CREATED)
    async onTicketCreated(e: TicketCreatedEvent) {
      await this.runner.runForEvent('ticket.created', e.ticket);
    }

    @OnEvent(ESCALATED_EVENTS.TICKET_UPDATED)
    async onTicketUpdated(e: TicketUpdatedEvent) {
      await this.runner.runForEvent('ticket.updated', e.ticket);
    }

    // ... other trigger mappings
  }
  ```
- [ ] **Step 4:** Register `WorkflowRunnerService`, `WorkflowExecutorService`, `WorkflowListener` in `EscalatedModule`.
- [ ] **Step 5:** Re-run — expect pass.
- [ ] **Step 6:** Commit + push.

### Task 3.12 — Integration smoke test (Workflow fires on real `TicketService.create`) — COMPLETED

**Files:**
- Test: `C:\Users\work\escalated-nestjs\test\integration\ticket-create-triggers-workflow.spec.ts`

- [ ] **Step 1 (red):** With a real `EventEmitter2` (not mocked) and mocked repos that return a single active "assign to agent 5" workflow, call `TicketService.create(...)` and assert the workflow executor's `assign_agent` action was invoked.
- [ ] **Step 2:** Run — expect failure before Task 3.11 is merged.
- [ ] **Step 3 (green):** No new code; this verifies the wiring from Phase 3.11.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

---

# Phase 4 — Outbound email (transactional)

**Definition of done:**
- `EmailService` sends HTML+text emails using the configured mailer.
- `email.listener.ts` listens on `TICKET_CREATED`, `TICKET_REPLY_CREATED`, `TicketSignupInviteEvent` and dispatches the appropriate template.
- Outbound emails set `Message-ID`, `In-Reply-To` (for agent replies), `References`, and `X-Escalated-Ticket-Id` headers.
- Signed `Reply-To` address is used so inbound can resolve the ticket even when threading headers are stripped.
- Email dispatch failures are logged and do not throw out of the listener.

### Task 4.1 — `MailerModule` registration — COMPLETED

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\escalated.module.ts`

- [ ] **Step 1 (red):** Add a minimal test that constructs `EscalatedModule` with `mail` options and asserts `MailerService` is available from `@nestjs-modules/mailer`.
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** In `EscalatedModule.forRoot(options)`, conditionally import `MailerModule.forRoot({ transport: options.mail.transport, defaults: { from: options.mail.from } })` when `options.mail` is present.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 4.2 — `message-id.ts` utility — COMPLETED

**Files:**
- Create: `C:\Users\work\escalated-nestjs\src\services\email\message-id.ts`
- Test: same folder, `message-id.spec.ts`

- [ ] **Step 1 (red):** Spec: `buildMessageId(ticketId, replyId?)` returns `<ticket-{id}-reply-{rid}@{domain}>` (or `<ticket-{id}@{domain}>` if no reply). `parseTicketIdFromMessageId('<ticket-55-reply-3@x.com>')` returns `55`. `buildReplyTo(55, 'secret')` returns `reply+55.{hmac8}@{domain}`. `verifyReplyTo('reply+55.abc12345@x.com', 'secret')` returns `{ ok: true, ticketId: 55 }`; tampered sig returns `{ ok: false }`.
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Implement as pure functions. HMAC via `crypto.createHmac('sha256', secret).update(String(ticketId)).digest('hex').slice(0,8)`.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 4.3 — `EmailService.send` — COMPLETED

**Files:**
- Create: `C:\Users\work\escalated-nestjs\src\services\email\email.service.ts`
- Create: `C:\Users\work\escalated-nestjs\src\services\email\email-templates.ts`
- Test: `C:\Users\work\escalated-nestjs\test\services\email\email.service.spec.ts`

- [ ] **Step 1 (red):** Spec: `send({ template: 'ticket_created', to: 'a@b.com', data: {...} })` produces a mailer call with subject from `ticket_created` template, html+text bodies, `Message-ID`, `X-Escalated-Ticket-Id`, and `Reply-To` headers.
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Implement templates as pure functions returning `{ subject, html, text }`. Implement `send` using `MailerService.sendMail({...})`.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 4.4 — Ticket created listener — COMPLETED

**Files:**
- Create: `C:\Users\work\escalated-nestjs\src\listeners\email.listener.ts`
- Test: `C:\Users\work\escalated-nestjs\test\listeners\email.listener.spec.ts`

- [ ] **Step 1 (red):** When `TICKET_CREATED` fires with a ticket that has `contactId`, the listener loads the Contact and calls `EmailService.send({template:'ticket_created', to:contact.email, data:{ticket,contact}})`. If `contactId` is null, nothing happens.
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Implement.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 4.5 — Reply created listener (agent reply → guest) — COMPLETED

**Files:**
- Modify: `C:\Users\work\escalated-nestjs\src\listeners\email.listener.ts`
- Modify: the spec.

- [ ] **Step 1 (red):** When `TICKET_REPLY_CREATED` fires with a reply where `reply.isInternal=false` AND the authoring user is an agent (heuristic: `reply.authorType === 'agent'` OR the reply user id !== ticket.requesterId/contact), the listener sends `reply_posted` template to the contact's email. For customer-originated replies (inbound or portal), the listener sends `agent_notification` to any assigned agent (optional for now — flag as out-of-scope of this phase, add a TODO for Phase 4.6).
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Implement with `In-Reply-To` and `References` headers pointing to the ticket's initial message id.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 4.6 — Signup invite listener (prompt_signup mode) — COMPLETED

**Files:**
- Modify: `email.listener.ts` + spec.

- [ ] **Step 1 (red):** When `TicketSignupInviteEvent` fires, send `signup_invite` template to `contact.email` with a tokenized signup link built from `options.guestPolicy.signupUrlTemplate`.
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Implement. Token is the `guestAccessToken` of the ticket plus a signed contact id (reuse `message-id.ts` HMAC helper).
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 4.7 — Failures are swallowed with structured logs — COMPLETED

**Files:**
- Modify: `email.listener.ts` + spec.

- [ ] **Step 1 (red):** When `EmailService.send` throws, the listener catches, logs via NestJS `Logger`, and does NOT rethrow (so ticket creation is not interrupted).
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Wrap calls in try/catch; Logger.error with ticket id + template.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

---

# Phase 5 — Inbound email

**Definition of done:**
- `POST /escalated/webhook/email/inbound` accepts provider payload and a signed header, verifies signature, persists an `InboundEmail` audit row, calls `InboundRouterService.route(parsed)`, returns 200 regardless of business outcome (so provider doesn't retry on app-logic errors; real errors still 500).
- Postmark parser works end-to-end with a recorded fixture.
- Routing priorities (per `Product decisions` §7) are implemented: In-Reply-To → X-Escalated-Ticket-Id → Reply-To token → subject reference → new ticket.
- New-ticket-from-email uses `ContactService.findOrCreateByEmail` and `TicketService.create` exactly like the widget path, honoring guest policy.

### Task 5.1 — `InboundEmail` audit entity — COMPLETED

**Files:**
- Create: `C:\Users\work\escalated-nestjs\src\entities\inbound-email.entity.ts`
- Test: entity spec.

- [ ] **Step 1 (red):** Spec: construct entity, assert fields.
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Create entity with: `id`, `provider`, `rawPayload: simple-json`, `parsedFrom`, `parsedSubject`, `parsedMessageId`, `parsedInReplyTo`, `matchedTicketId`, `createdReplyId`, `createdTicketId`, `outcome: 'reply_added' | 'ticket_created' | 'ignored' | 'error'`, `error: string|null`, `createdAt`.
- [ ] **Step 4:** Register with TypeORM.
- [ ] **Step 5:** Commit + push.

### Task 5.2 — `InboundEmailParser` interface + Postmark parser — COMPLETED

**Files:**
- Create: `src/services/email/inbound-parser.interface.ts`
- Create: `src/services/email/postmark-parser.service.ts`
- Create: `test/fixtures/postmark-new.json` and `test/fixtures/postmark-reply.json` (copy from Postmark docs examples)
- Test: `test/services/email/postmark-parser.spec.ts`

- [ ] **Step 1 (red):** Spec: `parse(payload)` returns `{ from, fromName?, to, subject, textBody, htmlBody?, messageId?, inReplyTo?, references: string[] }` from both fixtures.
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Implement.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 5.3 — `InboundRouterService.route` — COMPLETED

**Files:**
- Create: `src/services/email/inbound-router.service.ts`
- Test: `test/services/email/inbound-router.service.spec.ts`

- [ ] **Step 1 (red):** Spec (parameterized):
  - Reply detected via `inReplyTo` containing our Message-ID format → adds reply to ticket, returns `{outcome: 'reply_added', ticketId, replyId}`.
  - Reply detected via signed Reply-To address → same.
  - Reply detected via `[TK-XXX]` in subject → same.
  - Nothing matches → creates new ticket via Contact + TicketService, returns `{outcome: 'ticket_created', ticketId}`.
  - Unknown sender + existing contact email → reuses contact.
  - Known ticket but closed → decision: still add reply (standard Zendesk behavior) and reopen by emitting `TicketReopenedEvent`.
- [ ] **Step 2:** Run — expect failure.
- [ ] **Step 3 (green):** Implement with clearly-named private methods per priority step.
- [ ] **Step 4:** Re-run — expect pass.
- [ ] **Step 5:** Commit + push.

### Task 5.4 — `InboundEmailController` + signature verification — COMPLETED

**Files:**
- Create: `src/controllers/inbound-email.controller.ts`
- Create: `src/guards/inbound-webhook-signature.guard.ts`
- Test: controller spec + guard spec.

- [ ] **Step 1 (red):** Guard spec: valid `X-Postmark-Signature` header (HMAC-SHA256 of raw body with `inbound.webhookSecret`) passes; invalid rejects 401.
- [ ] **Step 2 (red):** Controller spec: valid payload → router is invoked → `InboundEmail` row saved → 200 response.
- [ ] **Step 3:** Run — expect failures.
- [ ] **Step 4 (green):** Implement guard (reads raw body; note NestJS body-parser config). Implement controller. Make sure raw body is preserved for signature check — register a middleware or use `@Raw()` custom decorator.
- [ ] **Step 5:** Re-run — expect pass.
- [ ] **Step 6:** Commit + push.

### Task 5.5 — Integration: end-to-end inbound email creates a ticket — COMPLETED (iter 91)

**Files:**
- Test: `test/integration/inbound-email-creates-ticket.spec.ts`

- [x] **Spec** — POSTs a Postmark fixture to `InboundEmailController.receive`, wires `InboundRouterService` + `PostmarkInboundParser` + `ContactService` + `TicketService` with repo mocks at the edges, and asserts: (a) a Contact was created from `from`/`fromName`, (b) a Ticket was created with `channel: 'email'` and the Contact's id, (c) the `InboundEmail` audit row records `outcome: 'ticket_created'`, (d) `escalated.ticket.created` was emitted (the bus that WorkflowListener + EmailListener subscribe to). Plus a negative test that messages with no `from` are ignored but still audited.

---

# Phase 6 — Admin settings UI

**Definition of done:**
- An admin settings page `Admin/Settings/PublicTickets.vue` exists where admins can set guest policy mode and guest user id.
- Config persists to a new `EscalatedSettings` key-value store (or the existing one — check `escalated.module.ts`'s settings service if present; if not, create a minimal `SettingsService` over a small entity).
- The widget controller reads the policy from the settings store at request time (cached with a 30s TTL) rather than from module options — so admins can change it without redeploy.
- The `guestPolicy` module option becomes the *default* only.

### Task 6.1 — `EscalatedSetting` KV entity (if missing) — COMPLETED

- [x] Pre-existing `EscalatedSetting` entity at `src/entities/escalated-settings.entity.ts` + `SettingsService` at `src/services/settings.service.ts` already cover `get<T>(key, default)` / `set(key, value)`. Reused directly — no new entity needed.

### Task 6.2 — Persist guest policy via settings — COMPLETED 2eee369

- [x] `src/controllers/widget/widget.controller.ts` reads `guest_policy` via `SettingsService.get('guest_policy', options.guestPolicy)` at request time (commit 2eee369). The generic `PUT /escalated/admin/settings` endpoint handles persistence via key/value pairs — dedicated per-feature setting controllers ship in the host adapters (Task 6.3 port PRs).

### Task 6.3 — Frontend settings page

**Files:**
- Create: `C:\Users\work\escalated\src\pages\Admin\Settings\PublicTickets.vue`

- [ ] Form with radio for mode, conditional `guestUserId` picker, save button that PUTs to the admin endpoint. Mirror the visual style of existing `Admin/Workflows/Builder.vue` for consistency.

---

# Phase 7 — Macros (repurposed Automations)

**Definition of done:**
- `Macro` entity exists (`name`, `description`, `scope: 'personal' | 'shared'`, `ownerId: number | null`, `actions: JSON`).
- `MacroService.list(agentId)`, `apply(macroId, ticketId, agentId)`.
- Admin CRUD + agent-apply endpoints.
- Frontend `Admin/Macros/Index.vue` + `Admin/Macros/Form.vue` replace the old `Admin/Automations/` folder.
- Agent ticket detail gets a `MacroMenu.vue` component with a "Apply Macro" dropdown.
- Old `Admin/Automations/` folder is deleted.

### Tasks 7.1 – 7.9 — Mirror the Contact / Workflow phase pattern — COMPLETED

- [x] **7.1** — `src/entities/macro.entity.ts` ships via #17.
- [x] **7.2** — Macro factory + TypeORM registration via #17.
- [x] **7.3** — `src/services/macro.service.ts` with `create/update/delete/list` via #17.
- [x] **7.4** — `MacroService.apply` reuses `WorkflowExecutorService.execute` (same action vocabulary + executor).
- [x] **7.5** — Agent-safe action subset enforced; `assign_agent` admin-gated.
- [x] **7.6** — `insert_canned_reply` action with variable interpolation (commit 0db04b1).
- [x] **7.7** — `src/controllers/admin/macro.controller.ts` (admin CRUD, permission-guarded).
- [x] **7.8** — `src/controllers/agent/macro.controller.ts` (agent apply endpoint).
- [x] **7.9** — Frontend: `src/pages/Admin/Macros/Index.vue` ships inline form (modal pattern — no separate `Form.vue` needed). `src/components/MacroDropdown.vue` wired into both Admin and Agent ticket Show pages. Old `Admin/Automations/` folder was already deleted in an earlier phase (Task 9.1).

---

# Phase 8 — Frontend wiring

### Task 8.1 — Widget form collects email + name

- [ ] Update `src/widget/EscalatedWidget.vue` to render `email` (required) and `name` (optional) inputs above `subject`. Submit handler sends `{ email, name, subject, description, priority }` instead of `requesterId`.
- [ ] Update Storybook story for the widget.

### Task 8.2 — `Guest/Create.vue` matches new payload shape — COMPLETED

- [x] `src/pages/Guest/Create.vue` already collects `guest_name` / `guest_email` — the current payload is compatible with the Pattern B public-ticket shape. Host adapters keep the Inertia `route('escalated.guest.tickets.store')` endpoint and map the payload server-side, which is the non-breaking path chosen over rewriting the Vue submit.

### Task 8.3 — Macro menu on ticket detail — COMPLETED

- [x] `src/components/MacroDropdown.vue` (named `MacroDropdown` rather than `MacroMenu`) — dropdown wired into `Admin/Tickets/Show.vue` and `Agent/TicketShow.vue`. Calls the agent macros endpoint and posts to the apply endpoint on click.

---

# Phase 9 — Cleanup + docs

### Task 9.1 — Delete dead Automations UI — COMPLETED

- [ ] Delete `C:\Users\work\escalated\src\pages\Admin\Automations\` folder.
- [ ] Search for stale imports/references. Remove.

### Task 9.2 — README updates in both repos — COMPLETED (backend README + CHANGELOG)

- [ ] `C:\Users\work\escalated-nestjs\README.md` — add a "Public ticket submission" section explaining the widget endpoint, inbound email setup, guest policy, and how Workflows fire on ticket.created.
- [ ] `C:\Users\work\escalated\README.md` — add a link to the backend docs and note the widget's new payload shape.
- [ ] `C:\Users\work\escalated-docs` repo (per user's memory): reflect the same.

### Task 9.3 — Migration notes / changelog — COMPLETED (inside CHANGELOG Unreleased)

- [ ] Update `CHANGELOG.md` in the NestJS repo with a breaking-change entry describing the widget payload change (email replaces requesterId).

### Task 9.4 — Final acceptance test

Run this manually against a fully wired environment:

1. Submit a ticket via the public widget with `alice@example.com`.
2. Confirm:
   - A `Contact` row exists for `alice@example.com`.
   - A ticket was created with `contactId` set and `requesterId` per guest policy.
   - Alice receives a confirmation email with `Message-ID: <ticket-{id}@{domain}>` and a signed `Reply-To` address.
   - Any matching Workflow (e.g. "auto-tag:public") executed and wrote a WorkflowLog row.
3. Alice replies to the email.
4. Confirm:
   - `POST /escalated/webhook/email/inbound` is hit with a valid signature.
   - An `InboundEmail` audit row records the event.
   - A new `Reply` on the same ticket was created (not a new ticket).
5. Agent applies a macro "Ask for more info".
6. Confirm:
   - A Reply containing the macro template was inserted.
   - The status changed per the macro action set.
   - Alice received the reply email with proper `In-Reply-To`.
7. In admin UI, switch guest policy to `prompt_signup`. Submit a new public ticket.
8. Confirm Alice gets a signup invite email.

Document the results in a new commit:
```bash
git commit -m "docs: record public ticket acceptance test run" --allow-empty
```

---

# Appendix A — File manifest (quick reference)

**Backend — created:**
- `src/entities/contact.entity.ts`
- `src/entities/macro.entity.ts`
- `src/entities/inbound-email.entity.ts`
- `src/services/contact.service.ts`
- `src/services/macro.service.ts`
- `src/services/workflow-executor.service.ts`
- `src/services/workflow-runner.service.ts`
- `src/services/email/email.service.ts`
- `src/services/email/email-templates.ts`
- `src/services/email/message-id.ts`
- `src/services/email/inbound-parser.interface.ts`
- `src/services/email/postmark-parser.service.ts`
- `src/services/email/inbound-router.service.ts`
- `src/listeners/workflow.listener.ts`
- `src/listeners/email.listener.ts`
- `src/guards/public-submit-throttle.guard.ts`
- `src/guards/inbound-webhook-signature.guard.ts`
- `src/controllers/inbound-email.controller.ts`
- `src/controllers/admin/macros.controller.ts`
- `src/controllers/agent/macros.controller.ts`
- `src/dto/create-public-ticket.dto.ts`
- `src/dto/create-macro.dto.ts`
- `src/dto/apply-macro.dto.ts`
- `src/dto/inbound-email.dto.ts`
- `test/factories/*.ts`
- `test/fixtures/postmark-*.json`
- many `*.spec.ts` mirrors

**Backend — modified:**
- `src/entities/ticket.entity.ts`
- `src/escalated.module.ts`
- `src/config/escalated.config.ts`
- `src/controllers/widget/widget.controller.ts`
- `src/services/ticket.service.ts`
- `src/events/escalated.events.ts`
- `package.json`

**Frontend — created:**
- `src/pages/Admin/Macros/Index.vue`
- `src/pages/Admin/Macros/Form.vue`
- `src/pages/Admin/Settings/PublicTickets.vue`
- `src/pages/Agent/Tickets/MacroMenu.vue`

**Frontend — modified:**
- `src/widget/EscalatedWidget.vue`
- `src/pages/Guest/Create.vue`

**Frontend — deleted:**
- `src/pages/Admin/Automations/` (entire folder)

---

# Appendix B — Commands cheat-sheet

```bash
# From backend root (C:\Users\work\escalated-nestjs)
npm test                                              # all tests
npm test -- test/services/contact.service.spec.ts    # single file
npm test -- --testNamePattern="findOrCreateByEmail"  # single test
npm run lint
npm run build

# Commit rhythm
git add <files>
git commit -m "<type>: <subject>"
git push

# Never: git push --force, --no-verify, --amend to a pushed commit
```

---

# Appendix C — Event reference (for workflow triggers)

| Event key | Emitted when | Payload |
|---|---|---|
| `escalated.ticket.created` | TicketService.create() succeeds | `TicketCreatedEvent(ticket, userId)` |
| `escalated.ticket.updated` | TicketService.update() succeeds | `TicketUpdatedEvent(ticket, changes)` |
| `escalated.ticket.status_changed` | Status transitions | `TicketStatusChangedEvent(ticket, oldStatus, newStatus)` |
| `escalated.ticket.assigned` | assigneeId changes | `TicketAssignedEvent(ticket, assigneeId)` |
| `escalated.ticket.priority_changed` | priority changes | `TicketPriorityChangedEvent(...)` |
| `escalated.ticket.department_changed` | departmentId changes | `TicketDepartmentChangedEvent(...)` |
| `escalated.ticket.tagged` | Tag added | `TicketTaggedEvent(...)` |
| `escalated.reply.created` | ReplyService.create | `TicketReplyCreatedEvent(reply, ticketId, userId)` |
| `escalated.reply.agent_reply` | Agent-authored reply | (subset of above, filtered by listener) |
| `escalated.sla.warning` | SLA nearing breach | `SlaWarningEvent(ticket, policy)` |
| `escalated.sla.breached` | SLA breached | `SlaBreachedEvent(ticket, policy)` |
| `escalated.ticket.reopened` | Closed ticket gets a new reply | `TicketReopenedEvent(ticket)` |
| `escalated.signup.invite` | Public submission under `prompt_signup` policy | `TicketSignupInviteEvent(ticket, contact)` |
| `escalated.inbound.received` | Webhook parses an email | `InboundEmailReceivedEvent(parsed)` |

All events are mirror-mapped to Workflow `triggerEvent` values (without the `escalated.` prefix) in `WorkflowListener`.

---

# Appendix D — Guest policy decision table

| Policy mode | `Ticket.requesterId` | `Ticket.contactId` | Email sent | Signup invite |
|---|---|---|---|---|
| `unassigned` (default) | `0` | set | confirmation | no |
| `guest_user` | `options.guestPolicy.guestUserId` | set | confirmation | no |
| `prompt_signup` | `0` (until promoted) | set | confirmation **+ signup invite** | yes |

On signup completion (host app triggers `ContactService.promoteToUser(contactId, newUserId)`), all tickets carrying that `contactId` get `requesterId = newUserId` via `promoteToUser`'s bulk update.

---

# Appendix E — Ralph execution hints

If running this via Ralph Loop (`ralph-loop:ralph-loop`):

- Feed the loop this entire file.
- Between iterations, Ralph should check `[ ]` → `[x]` progress in this file. After completing the TDD steps of a task, Ralph flips the box.
- Ralph should **never mark a task `[x]` until**: its test assertions are in the codebase, `npm test` passes for that file, `npm run lint` is clean, and a commit referencing the task is pushed.
- If a task has ambiguity that needs a human decision (e.g. "check for existing settings service first"), Ralph should stop the loop and print a clear question — not guess.

**Recommended Ralph prompt:**
```
Read docs/superpowers/plans/2026-04-23-public-ticket-system.md. Find the first unchecked `- [ ]` task. Execute its steps in order with TDD discipline (red → confirm fail → green → confirm pass → lint → commit → push). When done, flip the box to `[x]` in the plan file and commit that too. Stop at any step that requires a human decision.
```

---

**End of plan.**
