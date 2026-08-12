# TikTok Channel Add-On — API Feasibility Research (Shop + Social + Comments)

**Date**: 2026-08-11
**Context**: Follow-up to `tiktok-channel-addon-phase-1-foundation.plan.md` (Shop/marketplace-only, uncommitted on `feat/tiktok-channel-addon-phase-1-foundation`). User wants TikTok to support **both** marketplace (Shop) and social media (DM + comments). This doc checks whether TikTok's real public APIs actually expose message/conversation data for each surface before any further architecture/plan work.

## Summary

| Surface | Message/conversation access? | What's actually exposed | Access hurdle |
|---|---|---|---|
| **TikTok Shop** (marketplace) | ✅ Yes | Dedicated **Customer Service API** in TikTok Shop Partner Center — includes a "get all messages in a conversation" endpoint and webhooks for new buyer messages, tied to shop/orders | Standard TikTok Shop Partner Center app registration (same tier as the OAuth/shop-connect flow already stashed in Phase 1) |
| **TikTok Social** (DMs) | ✅ Yes, but gated | **Business Messaging API** — real-time send/receive DMs, webhook subscriptions for message events, thread/conversation management | Requires the connecting company to hold a **Verified TikTok Business Account**, *and* the integrating app needs to be (or integrate through) an approved **Messaging Partner** — a formal partnership tier TikTok grants to a short list (e.g. SleekFlow, MessageGate), not the standard self-serve app review used for Instagram/Messenger. This is a business/BD step, not just engineering, and can gate the timeline independently of any code work. |
| **TikTok Comments** | ❌ No | No public endpoint to read, reply to, hide, or delete comments on videos. The only API-level control anywhere is a `disable_comment` flag set at *post creation* time. Endpoints named "Business comment reply/list" live under the Ads (Business/Marketing) API and are scoped to paid/Spark Ads content, not general organic comments — and independent sources describe even that as effectively unusable for moderation. TikTok's Research API has read-only comment access, but it's restricted to approved academic institutions and can't back a commercial inbox. | N/A — not buildable today regardless of approach |

## Implications for scope

- **Shop + Social DM is realistic.** It matches the internal pipeline pattern already used for Instagram DMs in this codebase (webhook → gRPC → RabbitMQ → `conversation-service`, traced via `apps/instagram`). Shop conversations need the existing stashed `tiktok.proto` extended with real conversation/message RPCs — today it only has OAuth/shop-connect/generic-webhook, no message-fetching yet, even for Shop. Social DM would need a new service modeled directly on `apps/instagram`.
- **Comments cannot be part of "both" right now.** There is no API surface to build against. Recommend dropping it from scope entirely, or explicitly flagging it in any ticket/plan as "blocked on TikTok API availability" rather than designing speculative architecture for an endpoint that doesn't exist.
- **The Messaging Partner requirement is the real risk for Social DM**, not the engineering effort. Worth surfacing to whoever owns the TikTok relationship before committing engineering time, since that approval could gate the whole feature independently of anything built internally.

## Internal architecture note (from prior research on this thread)

Instagram/Messenger and WhatsApp/WhatsApp-API are each split into separate microservices per surface despite sharing a vendor, because the underlying flows differ. The same split is recommended for TikTok:
- Keep the existing stashed `tiktok` service/proto scoped to **Shop** (OAuth, shop connect, webhook, token refresh — extended with the Customer Service API's conversation/message endpoints).
- Add a **separate new service** (e.g. `tiktok-social`) for DMs, mirroring `apps/instagram`'s webhook → RabbitMQ → `conversation-service` pipeline, gated behind the Messaging Partner approval above.

## Sources

- [Customer Service API overview - TikTok Shop Partner Center](https://partner.tiktokshop.com/docv2/page/659645f9a46cdd02bc8aeacf)
- [Get conversation messages - TikTok Shop Partner Center](https://partner.tiktokshop.com/docv2/page/get-conversation-messages-202309)
- [Business Messaging API Education Hub | TikTok API for Business](https://business-api.tiktok.com/portal/bm-api/education-hub)
- [Overview | TikTok API for Business Documentation (Business Messaging v1.3)](https://business-api.tiktok.com/portal/docs/business-messaging/v1.3)
- [Subscribe to TikTok Business Messaging events via Webhooks](https://business-api.tiktok.com/portal/docs/subscribe-to-business-messaging-webhook-events-via-webhooks-api/v1.3)
- [About Messaging Partners | TikTok For Business](https://ads.tiktok.com/help/article/about-message-management-tools)
- [Reply to a comment | TikTok API for Business](https://business-api.tiktok.com/portal/docs/reply-to-a-comment/v1.3)
- [How to Automate TikTok Comment Moderation using the API | RapidDev](https://www.rapidevelopers.com/api-automations/how-to-automate-tiktok-comment-moderation-using-the-api)
- [TikTok Video Comments API Documentation (Research API)](https://developers.tiktok.com/doc/research-api-specs-query-video-comments)
