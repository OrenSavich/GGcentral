# ADR 0004: Platform adapter boundaries

## Status

Accepted

## Context

Steam and PlayStation Network do not return the same objects, ids, or achievement model. Folding either API into the domain would make the next platform a domain change. Implementing either client before its access rules and fields are known would freeze the wrong model.

## Decision

Domain code depends on `PlatformAdapter` and the GGCentral snapshot types in `apps/api/src/integrations/platform-adapter.ts`. Each future platform gets an adapter that maps its own responses into those snapshots. Vendor types do not leave the adapter. A platform client is not added until [the integration research gate](../architecture/integrations.md) is filled in for that platform.

## Consequences

The port can be tested with an in-memory adapter. Steam and PSN work can start independently once their research notes exist. The snapshot types will change if research shows a field cannot be represented; that change stays at the port instead of leaking vendor JSON into the rest of the API.
