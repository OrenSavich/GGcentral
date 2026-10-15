# Platform integrations

Each gaming platform gets an adapter behind `PlatformAdapter` in `apps/api/src/integrations/platform-adapter.ts`. The adapter fetches that platform's data and returns GGCentral snapshots:

- `PlatformProfileSnapshot`
- `PlatformGameSnapshot`
- `AchievementDefinitionSnapshot`
- `UserAchievementSnapshot`

Every snapshot includes `platform`, a string external id, and `syncedAt`. Fields the platform did not send are null. A completed fetch with no games or achievements is an empty array. The domain never sees a vendor response type.

Steam and PlayStation Network are the intended adapters. Their clients are not implemented. Xbox, Epic, Nintendo, Discord, and Twitch would be additional adapters, not new domain concepts.

## Rules

- Mapping happens inside the adapter. Do not import platform SDKs from domain modules.
- External ids stay strings, even when a platform uses numbers.
- Do not invent a shared achievement scale. A Steam achievement and a PlayStation trophy are separate definitions.
- Do not log tokens, cookies, or account credentials while fetching. Redaction rules are in `AGENTS.md`.
- Synchronization is on demand until a measured limit shows that a queue is required.

## Research gate

Do not add a platform client until a short note for that platform exists in this document. The note has to answer:

1. Which official API or sign-in flow is permitted, and what the terms allow us to store.
2. Which identifiers are stable, and which display names can change.
3. Which library, playtime, achievement, and profile fields are actually returned.
4. Rate limits, pagination, and what a partial failure looks like.
5. What is unavailable, so the domain can keep nulls instead of fake defaults.

Until those answers exist, an in-memory adapter is enough to test the port. That fake stays in the unit test and is not a platform integration.
