# Audit: Default Channel Display per Company (Conversation Sidebar Nav)

Task: t_f8ff6734. Verify sidebar shows only channels ACTIVE in that company;
different companies may have different active-channel sets. Find hardcode or
filters not scoped to company.

Repos:
- BE: `Desktop/BE satuinbox/omnichannel-satuinbox-be`
- FE: `Desktop/FE satuinbox/omnichannel-satuinbox-fe`

Scope note: "channel display" in the sidebar = the `channels[]` array of the
counter response (`countConversations`), rendered by `ChannelsSection.tsx`.
Each channel row is company-scoped counter data, NOT the channel-management page.

## Verdict

Company scoping is CORRECT at the source query, but a merge bug and a stale-cache
bug BOTH let NON-ACTIVE channels appear:

- Behavior expected: sidebar `channels[]` = only channels with `status==ACTIVE`
  in the caller's company.
- Behavior actual: `channels[]` = union of (active channels) ∪ (any channel
  that has at least one open/non-junk conversation of a whitelisted platform),
  and once cached the counter is never invalidated when a channel is
  deactivated.

Both a false-positive (inactive channel shows) and a false-negative
(active channel missing on init, if >25 channels) exist. Details below with
file+line.

## How the channel list is built (traced end to end)

1. `conversation.service.ts:1293 countConversations()`
   - `company = userContext.company`
   - `existCounter = counterRepository.findCounter(userContext)` — per-company
     cached counter doc. If it exists and no `reset`, returns it AS-IS (line 1302).
   - Only on cache miss: `activeChannels = getActiveChannel(company)` (1306),
     emits `CONVERSATION_INIT_COUNTER`, builds fresh via `buildCountResponse`.
2. `getActiveChannel(company)` — `conversation.service.ts:2857`
   - Calls `channelService.getChannels({ companyContext: company, pagination:{limit:25,...} })`
   - `channelItems = channels.items.filter(i => i.status == ChannelStatusEnum.ACTIVE)` (2873)
   - Adds synthetic group rows (WA group, IG comment) when a matching real
     channel is active. Correct + company-scoped.
3. `buildCountResponse(data, teams, channels)` — `conversation.service.ts:1233`
   - Seeds `channelMap` keyed by `channel.platform.code` from activeChannels (1258).
   - Then MERGES aggregation counts: `for (const channel of data.channels ?? [])
     { channelMap.set(channel.id, {...existing, ...channel}) }` (1272-1281) —
     **unconditional `.set()`, no `channelMap.has()` guard.**
4. Aggregation source `data.channels` — `conversation.repository.ts:1956
   countChannelPipeline` -> `buildChannelMatchStage` (1969):
   - `$match` filters spam + `isJunked:false` + hardcoded platform whitelist
     `['widget','whatsapp_api','whatsapp_web','instagram','email','facebook_messenger']`.
   - Group `_id = channel.platform.code`; project `id: '$_id'`. So aggregation
     row `id` == platform code == the same key the seed uses.

Because keys collide, step 3's merge adds any aggregated channel that is NOT in
the active-seed. There is NO join to channel status in the aggregation.

## Findings

### F1 — [HIGH] Inactive channel leaks into sidebar via unconditional merge
File: `conversation.service.ts:1272-1281` (`buildCountResponse` merge loop).
Root cause: merge does `channelMap.set(channelKey, ...)` with no
`if (channelMap.has(channelKey))` guard. Seed = active channels only, but any
channel with an open non-junk conversation of a whitelisted platform gets added
even if `status != ACTIVE`.
Effect: deactivate a channel that still has open conversations -> it still shows
in the sidebar with its count.
Fix (lazy, root cause): guard the merge so aggregation only updates channels
already seeded from activeChannels.
```ts
for (const channel of data.channels ?? []) {
  if (!channelMap.has(channel.id)) continue; // ponytail: only count active channels
  channelMap.set(channel.id, { ...channelMap.get(channel.id), ...channel, id: channel.id });
}
```

### F2 — [HIGH] Counter never invalidated on channel activate/deactivate -> stale display
File: `conversation.service.ts:1300-1302` (returns cached `existCounter` as-is).
channel-service emits NO `CONVERSATION_COUNTER_UPDATE` / `CONVERSATION_INIT_COUNTER`
on channel status change (only people-service emits counter-update, for team
membership). So even after F1 is fixed, a company whose counter is already
cached keeps the old channel set until an unrelated `reset` rebuild happens.
Effect: activate a new channel -> not shown until cache rebuild; deactivate ->
lingers. Company-scoped but time-stale.
Fix: on channel status change in channel-service, emit an event that
invalidates/rebuilds that company's counter (reuse `CONVERSATION_INIT_COUNTER`
path with `reset`), or add a counter TTL.

### F3 — [MEDIUM] Hardcoded `limit:25` -> active channels dropped for large companies
File: `conversation.service.ts:2861-2865` (`getActiveChannel` pagination).
Only first 25 channels (sorted `createdAt:desc`) are fetched, THEN filtered by
active. A company with >25 channels can have active channels beyond page 1 that
never seed the map -> active channel MISSING from sidebar (false negative).
Fix: paginate through all, or filter `status==ACTIVE` server-side in
`getChannels` and raise/remove the limit.

### F4 — [MEDIUM] Hardcoded platform whitelist in aggregation, not company-config-driven
File: `conversation.repository.ts:1969-1988` (`buildChannelMatchStage`).
The `channel.platform.code $in [...]` list is a static array. Any platform a
company uses that is not in this list is silently excluded from counts, and the
list is not derived from that company's configured/active channels. Coupled with
F1 this is the reason the display set diverges from the true active set.
Fix: drive the platform set from the company's active channels (pass codes in),
or drop the platform filter and rely on the F1 active-channel guard.

### F5 — [LOW] Aggregation counts convs on inactive channels
File: `conversation.repository.ts:1956` (`countChannelPipeline`).
No stage joins channel status, so counts include conversations belonging to
now-inactive channels. Harmless once F1 guard drops those keys, but the count
numbers themselves are computed over inactive-channel data. Fix only if counts
must exclude inactive-channel history.

## Company-scoping conclusion

Scoping IS applied: `getActiveChannel(company)` uses `companyContext`, and the
counter doc / aggregation `$match` are per-user/company. There is NO cross-company
hardcode that shows another company's channels. The divergence from "only active
channels" is caused by F1 (merge with no active guard) + F2 (stale cache), not
by a scoping leak. F3/F4 are secondary correctness gaps in how the active set is
assembled.

## Priority

- Fix F1 first (one guard line, root cause of inactive-channel display).
- Fix F2 next (invalidate counter on channel status change) so F1 takes effect
  on already-cached companies.
- F3/F4 as follow-up hardening.
