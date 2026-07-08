# PRODUCT REQUIREMENT DOCUMENT (PRD)

**Feature**: WhatsApp API Template Builder — Meta-Parity CRUD, Live Preview, Per-Type Pricing & Two-Way Meta Sync
**Related feature**: existing Broadcast Template CRUD (`broadcast-service` + `whatsapp-api` service) — this PRD **extends** it, it does not replace it.
**Product Lead**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Status**: Draft for implementation hand-off
**Date (Asia/Jakarta)**: 2026-07-07

> **Why this document exists.** SatuInbox already lets a user create WhatsApp Business API message templates, submit them to Meta, and receive approval/rejection webhooks. But the builder is a thin subset of what Meta's own tooling (WhatsApp Manager + the Cloud API `/message_templates` endpoint) supports: today a template is **only** a plain-text header + a body with variables. There is **no footer, no buttons, no media header, no live preview of the WhatsApp bubble, and no indication of what a template will cost to send.** Users build a template blind, submit it, and often get it rejected by Meta for structural reasons the UI never let them express or preview. Worse, a template created **directly in Meta's WhatsApp Manager never appears in SatuInbox at all** — the two sources of truth drift. This PRD raises the builder to **feature-parity with Meta's template tooling** (for the template types our business uses — **MARKETING and UTILITY**), adds a **WYSIWYG live preview** that mirrors the WhatsApp bubble as the user edits, surfaces **per-template-type send pricing** in the UI so users understand cost before they commit, and keeps SatuInbox and Meta **in sync both ways** so templates authored in either place are reflected in the other.

> **Scope note — no AUTHENTICATION templates.** Our business does not send authentication/OTP templates, so this PRD deliberately covers only **MARKETING** and **UTILITY** categories. Meta's OTP button types, security disclaimer, and code-expiration mechanics are explicitly out of scope.

---

## 1. Background — what already shipped (verified against source)

Templates are implemented across two backend services and one frontend surface. **Naming note:** the domain is called *broadcast template* in code; the WhatsApp API submission lives in the `whatsapp-api` service.

| Layer | Status | Evidence |
|---|---|---|
| Template Mongoose schema (name, language, channels, content{header?,body}, variableSamples, whatsappApiProperties{category,accountChannelId}, status, meta* fields) | Built | `backend/apps/broadcast-service/src/app/schemas/broadcast-template.schema.ts` |
| gRPC `BroadcastTemplateService` (Get, GetById, Create, Update, Delete, UpdateApprovalStatus) | Built | `backend/proto/broadcast.proto:33-40` |
| REST endpoints (`POST/GET/PATCH/DELETE /broadcast/template`, `GET …/:id/approval/:status`) | Built | `backend/apps/api-gateway/src/app/broadcast/broadcast-template.controller.ts` |
| Create/Update DTOs + validation (name, language, channelIds, whatsappApiCategory, content{header?,body}, variableSamples) | Built | `backend/apps/api-gateway/src/app/broadcast/dto/broadcast-template.dto.ts` |
| Meta Cloud API submission — `POST {graph}/v18/{waba-id}/message_templates` | Built | `backend/apps/whatsapp-api/src/app/services/message-template.service.ts:71-457` |
| Parameter formats: POSITIONAL `{{1}}` and NAMED `{{name}}` | Built | `whatsapp-api/.../base.constant.ts:73-76`; `submit-template.dto.ts` |
| Webhook status resolver: APPROVED/REJECTED/PENDING/DISABLED → internal status | Built | `backend/apps/whatsapp-api/src/app/resolvers/template-status.resolver.ts` |
| Rejection/disable metadata persisted (`metaRejectionReason`, `metaRejectionInfo`, `metaDisableInfo`) | Built | `broadcast-template.schema.ts:207-224` |
| FE pages: list / create / edit under broadcast → templates | Built | `frontend/apps/omnichannel/app/[locale]/(main)/broadcast/templates/**` |
| FE form: name, language(EN/ID), channel, category, account, header(text), body(bold/italic/emoji/variable insert), variable samples | Built | `frontend/apps/omnichannel/components/molecules/broadcast/TemplateFormLayout.tsx` |
| FE Zod schema + React Query hooks | Built | `validations/broadcast/create-template.schema.ts`; `services/broadcast/broadcast-template.service.ts` |
| i18n `broadcast.templateForm.*` (en + id) | Built | `frontend/packages/i18n/src/translations/broadcast/{en,id}.json` |

**What is NOT in place (the gap this PRD closes):**

- **Header** supports only `TEXT`. No `IMAGE`, `VIDEO`, `DOCUMENT`, or `LOCATION` media headers.
- **No FOOTER** field at all.
- **No BUTTONS** at all — none of `QUICK_REPLY`, `URL` (static/dynamic), `PHONE_NUMBER`, `COPY_CODE`, or `FLOW`.
- **No CAROUSEL / Limited-Time-Offer (LTO)** templates.
- **Language** is limited to `EN` / `ID` only; Meta supports 60+ locales.
- **No live preview** — the user cannot see the rendered WhatsApp bubble while editing.
- **No pricing** — nothing tells the user that a MARKETING vs UTILITY template costs different amounts to send, or that utility inside the service window may be free.
- **No sync from Meta** — the app only *pushes* templates to Meta. Templates created/edited/deleted directly in Meta's WhatsApp Manager are never pulled back, so SatuInbox's list drifts from Meta's actual template set. Only *status* changes (approve/reject/disable) flow back, via webhook — not creations or content edits made in Meta.

---

## 2. Problem Statement

| ID | Problem | Impact |
|---|---|---|
| PS-WT-01 | The builder expresses only header-text + body. Meta templates routinely need footers and buttons (CTA, quick reply, OTP). Users cannot build the templates their campaigns actually require. | Users leave SatuInbox and build templates directly in Meta's WhatsApp Manager, fragmenting the workflow; SatuInbox is not a complete tool. |
| PS-WT-02 | No media header (image/video/document/location). Rich marketing/utility templates are impossible to author here. | Marketing templates (the highest-value, highest-priced type) cannot be created — direct revenue-feature gap. |
| PS-WT-04 | No live preview. The user builds structure blind and only learns how it looks after submitting to Meta (or never). | High rejection rate; slow trial-and-error loop against Meta's async review; poor authoring confidence. |
| PS-WT-05 | Client-side validation does not enforce Meta's structural rules (button counts, combination rules, char limits, variable/sample parity, category-specific constraints). Invalid templates are submitted and rejected asynchronously by Meta. | Wasted review cycles (hours–days per rejection); user frustration; support load. |
| PS-WT-06 | No pricing shown. Users do not know that MARKETING and UTILITY are priced differently per message and per country, or that utility within the customer-service window can be free. | Users incur unexpected send costs; cannot make cost-informed category choices; finance/billing surprises. |
| PS-WT-07 | Language is capped at EN/ID in the enum, while Meta requires the template's declared language to match the content and supports many locales. | Businesses serving other markets cannot localize templates through SatuInbox. |
| PS-WT-08 | Sync is one-way (app → Meta) for content. A template created or edited **directly in Meta's WhatsApp Manager** never appears/updates in SatuInbox; only status webhooks flow back. The two systems drift, so the SatuInbox template list is an incomplete, stale view of what actually exists on the WABA. | Users can't broadcast with templates they made in Meta; duplicate/naming collisions on next create; no single source of truth. |

---

## 3. Goals & Non-Goals

| In Scope | Out of Scope |
|---|---|
| Full component model to Meta parity **for MARKETING & UTILITY**: media headers, footer, and the button set (QUICK_REPLY, URL static/dynamic, PHONE_NUMBER, COPY_CODE). | **AUTHENTICATION / OTP templates** — our business does not use them: no OTP button variants, no security disclaimer, no code-expiration. |
| **Two-way sync with Meta:** pull templates created/edited/deleted in Meta's WhatsApp Manager into SatuInbox and reconcile them against locally-authored ones (in addition to the existing app → Meta push). | Building a WhatsApp **Flows** designer (a FLOW button may reference an existing published flow ID, but authoring flows is out of scope). |
| Live, WYSIWYG WhatsApp-bubble preview that updates as the user edits (header, body with sample-substituted variables, footer, buttons). | Re-architecting the two-service split (broadcast-service ↔ whatsapp-api); we extend the existing contract. |
| Per-type send-pricing display in the UI (MARKETING / UTILITY), country-aware, with the free-utility-window caveat surfaced. | Pixel-perfect device-frame emulation of every WhatsApp client version. A faithful, single, brand-correct bubble is sufficient. |
| Structural validation on the client **and** api-gateway that mirrors Meta's rules, so invalid templates are rejected before submission. | A full billing/invoicing or spend-metering system. This PRD shows **indicative** pricing; metered billing is a separate track. |
| Expand supported template languages to Meta's locale set. | Guaranteeing Meta approval — content-policy judgments remain Meta's. We only prevent *structural* rejections. Also: auto-translation of copy between languages. |
| Carousel & Limited-Time-Offer templates. | **Deferred to a later phase** — captured as P2, not required for the parity milestone (see §7 phasing). |

---

## 4. Objectives & Key Results

| Objective | Key Result |
|---|---|
| The SatuInbox builder can express any MARKETING/UTILITY Meta template a user needs. | A user can author, from SatuInbox alone, a template with a media header, body, footer, and a valid button mix, and submit it to Meta successfully. Parity checklist (§6a) 100% covered for P0/P1 component types. |
| Users see what they are building. | The preview reflects every supported component with sample-substituted variables and updates within one render frame of an edit; ≥90% of surveyed users report the preview matched the delivered message. |
| Structural rejections from Meta drop sharply. | Meta rejections attributable to **structural/format** reasons fall by ≥80% vs the pre-change baseline (rejections for content/policy are excluded). |
| Users make cost-informed choices. | The builder shows the indicative per-message price for the selected category + destination market before submission; pricing is present on 100% of WhatsApp-API template create/edit sessions. |
| SatuInbox and Meta stay in sync. | Every template on the connected WABA — whether authored in SatuInbox or in Meta's WhatsApp Manager — is present and status-accurate in SatuInbox within the sync SLA; template count/status parity between the two systems is ≥99% after a sync cycle. |

---

## 5. Personas & Usage

| Persona | Need |
|---|---|
| Marketing manager | Authors rich MARKETING templates (media header, CTA/URL buttons, coupon copy-code) and wants to see the cost per message per market before launching a broadcast. |
| Operations / CS lead | Authors UTILITY templates (order updates, reminders) and wants to know which are free inside the service window vs billable. |
| Existing Meta-Manager user | Already manages some templates directly in Meta's WhatsApp Manager and expects those to show up in SatuInbox so they can broadcast without re-creating them. |
| Approver (internal review) | Uses the existing internal approval step before Meta submission; benefits from the preview to judge a template quickly. |

> **Multi-tenancy & permissions unchanged.** Template CRUD stays scoped to `companyId` (+ `organizationId`) and gated by the same broadcast/template permissions in place today. This PRD adds no new permission; it enriches the existing gated surface.

---

## 6. User Stories & Acceptance Criteria

| ID | Priority | User Story | Acceptance Criteria |
|---|---|---|---|
| US-WT-01 | P0 | As a template author, I can add a **media header** (image / video / document) or a **location** header, or a text header, or none. | 1. Header type selector offers NONE / TEXT / IMAGE / VIDEO / DOCUMENT / LOCATION. 2. Selecting a media type lets me upload/attach a sample asset (stored via existing media-service/S3). 3. TEXT header allows at most one variable and enforces its char limit. 4. The chosen header is submitted to Meta in the correct component shape and rendered in the preview. |
| US-WT-02 | P0 | As a template author, I can add a **footer**. | 1. Optional footer text input with Meta's char limit enforced. 2. Footer renders in the preview beneath the body. 3. Footer is included in the Meta payload only when non-empty. |
| US-WT-03 | P0 | As a template author, I can add **buttons**: quick-reply and call-to-action (URL static/dynamic, phone number, copy-code). | 1. I can add/remove/reorder buttons up to Meta's limits. 2. The builder enforces combination rules (see §6a) and blocks invalid mixes with an inline, i18n error. 3. Dynamic URL buttons accept a variable + sample. 4. Buttons render in the preview as tappable rows/chips. 5. Buttons serialize to the correct Meta `BUTTONS` component. |
| US-WT-04 | P0 | As a user who has templates in **Meta's WhatsApp Manager**, I see those templates in SatuInbox without re-creating them. | 1. Templates that exist on the connected WABA but not in SatuInbox are imported and appear in the list with their real Meta status. 2. Content edits and deletions made in Meta are reconciled into SatuInbox on the next sync. 3. Imported templates are visually distinguishable as Meta-sourced and are usable in broadcasts (subject to APPROVED status). 4. Sync runs on a schedule **and** on demand via a "Sync now" action. |
| US-WT-05 | P0 | As a template author, I see a **live WhatsApp preview** that updates as I edit. | 1. The preview shows header (media thumbnail or text), body with `{{var}}` replaced by sample values, footer, and buttons. 2. It updates on edit without a save/submit. 3. When a required sample is missing, the preview shows a clearly-marked placeholder rather than raw `{{n}}`. |
| US-WT-06 | P0 | As a template author, I see the **indicative send price for my chosen category and market** before I submit. | 1. On selecting a category + destination market, the builder shows the per-message price (currency + amount) for MARKETING / UTILITY. 2. The UTILITY free-service-window caveat is shown. 3. The price is clearly labelled **indicative** with an "as of" date and source note. 4. If pricing for a market is unavailable, a graceful "pricing unavailable" state shows — never a wrong number. |
| US-WT-07 | P0 | As a template author, invalid structures are caught **before** submission. | 1. Client validation blocks submit and shows inline i18n errors for: char limits, missing samples, illegal button counts/combinations, media-header requirements, category constraints, and variable/sample parity. 2. The api-gateway re-validates the same rules server-side (source of truth). 3. A template that passes both is accepted by Meta without a structural rejection. |
| US-WT-08 | P1 | As a business serving other markets, I can pick from **Meta's supported languages**. | 1. Language selector lists Meta's supported locales (not just EN/ID). 2. The selected locale is submitted as Meta's language code. 3. Existing EN/ID templates keep working. |
| US-WT-09 | P1 | As a template author, when Meta **rejects** my template I see the reason and a fix hint in the builder. | 1. The stored `metaRejectionInfo{reason,recommendation}` is surfaced on the edit screen. 2. I can edit (where status allows) and resubmit. |
| US-WT-10 | P2 | As a marketing manager, I can build **Carousel** and **Limited-Time-Offer** templates. | 1. Carousel: 2–N cards, each with media + body + buttons, previewed as a swipeable set. 2. LTO: offer/expiration structure with countdown copy. 3. Both serialize to Meta's respective contracts. (Deferred — see §7.) |

---

## 6a. Meta Parity Component Matrix (authoritative checklist)

> Numeric limits and combination rules **must be verified against the live Meta Cloud API version in use** (`base.constant.ts` currently pins `v18`) during TRD/implementation — Meta changes these. Values below are the target set; the TRD locks exact numbers.

| Component | Options to support | Phase | Notes / rules to enforce |
|---|---|---|---|
| Header | NONE, TEXT (≤1 var), IMAGE, VIDEO, DOCUMENT, LOCATION | P0 | Exactly one header max. Media headers require a sample asset for Meta. |
| Body | Text, positional `{{1}}` **or** named `{{name}}` vars, emoji, bold/italic (already built) | P0 (extend) | Enforce char limit; every var needs a sample; keep single parameter-format per template (positional XOR named) — matches existing `buildCreateTemplatePayload` detection. |
| Footer | Text (no variables) | P0 | Enforce char limit; optional. |
| Buttons — Quick Reply | QUICK_REPLY | P0 | Count + combination limits per Meta. |
| Buttons — CTA | URL (static / dynamic w/ var+sample), PHONE_NUMBER | P0 | URL/phone counts + combination rules; dynamic URL needs sample. |
| Buttons — Coupon | COPY_CODE | P1 | Marketing coupon code. |
| Buttons — Flow | FLOW (reference existing flow id) | P2 | Authoring flows is out of scope; referencing a published flow only. |
| Category | MARKETING, UTILITY | P0 | Already supported at category level. **AUTHENTICATION is intentionally excluded** (not used by our business). |
| Sync from Meta | Import + reconcile templates authored/edited/deleted in Meta's WhatsApp Manager | P0 | Map Meta `components[]` → our component model; match by `metaTemplateId`, else `(name, language)`. |
| Language | Meta locale set | P1 | Expand `BroadcastTemplateLanguageEnum`; migrate EN/ID. |
| Carousel | 2–N cards | P2 | Deferred. |
| Limited-Time Offer | offer + expiration | P2 | Deferred. |

---

## 7. Functional Requirements (phased)

**Phase P0 — Parity core + preview + pricing (the milestone this PRD targets):**

- **FR-WT-1 [P0]** Extend the template **schema/proto/DTOs** to model a full component list: typed header (NONE/TEXT/IMAGE/VIDEO/DOCUMENT/LOCATION with sample asset ref), footer, and a typed `buttons[]` array (QUICK_REPLY, URL static/dynamic, PHONE_NUMBER, COPY_CODE). Preserve backward compatibility with existing `content{header,body}` records via migration/mapping. Regenerate proto types (`npm run generate-proto-types`).
- **FR-WT-2 [P0]** Extend the **Meta submission builder** (`message-template.service.ts`) to serialize the new components (media header via header handle/example, footer, buttons) to the Cloud API `components[]` contract, keeping the existing positional/named parameter-format detection.
- **FR-WT-3 [P0]** Add **two-way Meta sync**: a reconciliation routine in the `whatsapp-api` service that lists templates from Meta (`GET {graph}/{waba-id}/message_templates`, paginated), maps each Meta `components[]` back into our component model, and upserts/soft-deletes into the broadcast-service template store per WABA/tenant. Match existing records by `metaTemplateId` first, then by `(name, language)`; never overwrite an in-flight locally-drafted template that hasn't been submitted. Trigger on (a) a schedule, (b) an on-demand "Sync now" action exposed via api-gateway, and (c) existing status webhooks. Emit the reconciled result to broadcast-service via the current RabbitMQ event path.
- **FR-WT-4 [P0]** Build the **live preview** component in `@satuinbox/ui` (or omnichannel molecules) rendering the WhatsApp bubble from the current form state with sample-substituted variables; update reactively on edit.
- **FR-WT-5 [P0]** Add **structural validation** (Zod on FE + class-validator/service checks on api-gateway) mirroring Meta rules from §6a: char limits, sample/variable parity, button counts & combinations, media-header sample requirement, category constraints. Server-side is the source of truth.
- **FR-WT-6 [P0]** Add a **pricing source + read endpoint**: a maintained rate-card keyed by (category, destination market/country) returning per-message price + currency + "as of" date + free-window note. The builder calls it to render US-WT-06. See §8 for the pricing-data decision.
- **FR-WT-7 [P0]** Media header uploads reuse the existing **media-service / S3** path; store the asset reference on the template and pass Meta the required example/handle.
- **FR-WT-8 [P0]** All new user-facing strings go through **next-intl** (`en` + `id`); no hardcoded copy (ESLint enforces).

**Phase P1 — Breadth:**

- **FR-WT-9 [P1]** Expand **`BroadcastTemplateLanguageEnum`** to Meta's supported locales; migrate existing EN/ID; update the FE language selector.
- **FR-WT-10 [P1]** Support **COPY_CODE** (coupon) buttons for MARKETING.
- **FR-WT-11 [P1]** Surface **Meta rejection reason + recommendation** on the edit screen and support edit-and-resubmit where status allows (extends existing `metaRejectionInfo`).
- **FR-WT-12 [P1]** Pricing UI shows a **market/country selector** and per-type comparison (MARKETING vs UTILITY side by side) for the selected market.
- **FR-WT-16 [P1]** Sync UX: show a **last-synced timestamp**, a per-template **source badge** (SatuInbox-authored vs Meta-authored), and surface **sync conflicts** (e.g. a name collision between a local draft and a Meta template) for the user to resolve rather than silently overwriting.

**Phase P2 — Advanced templates:**

- **FR-WT-13 [P2]** **Carousel** templates (multi-card) — schema, builder, preview, submission.
- **FR-WT-14 [P2]** **Limited-Time-Offer** templates — offer/expiration structure + countdown preview.
- **FR-WT-15 [P2]** **FLOW** button referencing an existing published WhatsApp Flow id.

---

## 8. Pricing — data-source decision (needs confirmation)

Meta moved WhatsApp template messaging to a **per-message** pricing model (rolled out through 2024–2025), priced by **category** and by **destination country/market**, with **UTILITY messages inside an open 24-hour customer-service window generally free**. We only surface the categories our business uses — **MARKETING** and **UTILITY**. Exact rates change and are published by Meta as rate cards; the research pass could not confirm a single clean public Graph API "rate-card" endpoint.

**Decision required (TRD):** choose the pricing source, in order of preference:

1. **Meta pricing/analytics APIs** if a reliable rate endpoint is available for the WABA (preferred — always current).
2. **Maintained rate-card config** (a versioned table by country × category, with an "as of" date) seeded/updated operationally. Pragmatic, honest, and shippable now.
3. **Hybrid:** rate-card fallback with periodic sync from Meta where possible.

**Non-negotiable UX rules regardless of source:** the number is always labelled **indicative**, carries an **"as of" date** and source note, degrades to a clear **"pricing unavailable"** state rather than showing a wrong figure, and states the **UTILITY free-window** caveat. This PRD does **not** promise metered/actual billing — that is a separate track.

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Meta's structural rules (button counts, combinations, limits) drift from what we hard-code, causing new rejections. | Centralize the rule set in one shared constants module (BE + FE); pin the Cloud API version; verify limits against live Meta docs during the TRD; make numbers config, not scattered literals. |
| Backward compatibility: existing `content{header,body}` templates break under the new component model. | Additive schema + a mapping/migration that reads old records into the new shape; keep the old fields readable; test the read path for legacy templates. |
| Pricing shown is wrong or stale → user distrust / billing disputes. | "Indicative" labelling + "as of" date + graceful unavailable state (§8); never fabricate a rate; keep the rate-card source in one place with an update owner. |
| Media-header submission to Meta (handle/example upload) is a distinct, error-prone Meta flow. | Reuse existing media-service/S3; isolate the Meta media-handle step behind the existing whatsapp-api client; add explicit error handling + retry; cover with integration tests against Meta sandbox. |
| Preview diverges from real WhatsApp rendering → false confidence. | Target a faithful, single canonical bubble (not per-client pixel parity); validate against real delivered messages in QA; treat preview as authoring aid, not a guarantee. |
| Scope is large; a big-bang release stalls. | Ship in phases: P0 (parity core + preview + pricing + sync) → P1 (breadth) → P2 (carousel/LTO/flow). Each phase is independently shippable and testable. |
| Sync overwrites a locally-drafted (not-yet-submitted) template or creates duplicates. | Match by `metaTemplateId` first, then `(name, language)`; never touch records in a local-draft/pre-submission state; surface conflicts for user resolution (FR-WT-16) instead of silent overwrite. |
| Meta returns components (e.g. an unsupported button type, or an AUTHENTICATION template on the WABA) that don't map cleanly to our model. | Import what maps; store the raw Meta payload for unmappable parts; mark such templates **read-only / view-in-Meta** in SatuInbox rather than dropping or corrupting them. AUTHENTICATION templates found on the WABA are imported as read-only, never editable here. |

---

## 10. Success Metrics

- **Parity:** a user can author + successfully submit to Meta a template using each P0/P1 component type from §6a — 100% of the checklist.
- **Rejection reduction:** structural/format Meta rejections down ≥80% vs the pre-change baseline (content/policy rejections excluded).
- **Preview fidelity:** ≥90% of surveyed authors report the preview matched the delivered message.
- **Pricing coverage:** indicative pricing renders on 100% of WhatsApp-API template create/edit sessions for supported markets; 0 reported instances of a wrong (vs "unavailable") price.
- **Sync parity:** after a sync cycle, ≥99% of templates on the connected WABA are present in SatuInbox with matching status; 0 incidents of a local pre-submission draft being overwritten by sync.
- **Adoption:** measurable shift of template authoring from Meta's WhatsApp Manager into SatuInbox (e.g. templates created in-app / active WABA up and to the right after GA).
- **No regression:** existing EN/ID header-text + body templates continue to create, edit, submit, and receive status webhooks unchanged.

---

## 11. Open Questions (resolve during TRD)

| # | Question | Owner |
|---|---|---|
| Q1 | Pricing source: Meta API vs maintained rate-card vs hybrid (§8)? | Eng + Finance |
| Q2 | Which Cloud API version do we target, and what are the **exact** current limits for header/body/footer chars, button counts, and combination rules? | Eng |
| Q3 | Full set of Meta locales to expose in the language selector, and the EN/ID migration mapping? | Product + Eng |
| Q4 | Does the internal approval step (existing `approval` token/attempts flow) stay ahead of Meta submission for the new component types, unchanged? How does a **Meta-authored, already-APPROVED** template that syncs in fit this internal approval gate? | Product |
| Q5 | Sync cadence + conflict policy: schedule interval, whether webhook events can drive incremental sync, and the exact rule when a Meta template and a local draft share a `(name, language)`? | Eng + Product |
| Q6 | Carousel/LTO/Flow (P2) — confirm demand and sequencing before committing build. | Product |

---

## 12. Appendix — key source references

| Area | File |
|---|---|
| Template schema | `backend/apps/broadcast-service/src/app/schemas/broadcast-template.schema.ts` |
| gRPC contract | `backend/proto/broadcast.proto:33-40` |
| REST endpoints | `backend/apps/api-gateway/src/app/broadcast/broadcast-template.controller.ts` |
| Create/Update DTOs | `backend/apps/api-gateway/src/app/broadcast/dto/broadcast-template.dto.ts` |
| Meta submission | `backend/apps/whatsapp-api/src/app/services/message-template.service.ts` |
| Parameter-format constants | `backend/apps/whatsapp-api/src/app/constants/base.constant.ts` |
| Webhook status resolver | `backend/apps/whatsapp-api/src/app/resolvers/template-status.resolver.ts` |
| FE form | `frontend/apps/omnichannel/components/molecules/broadcast/TemplateFormLayout.tsx` |
| FE pages | `frontend/apps/omnichannel/app/[locale]/(main)/broadcast/templates/**` |
| FE Zod schema | `frontend/apps/omnichannel/validations/broadcast/create-template.schema.ts` |
| FE React Query hooks | `frontend/apps/omnichannel/services/broadcast/broadcast-template.service.ts` |
| i18n | `frontend/packages/i18n/src/translations/broadcast/{en,id}.json` |
</content>
</invoke>
