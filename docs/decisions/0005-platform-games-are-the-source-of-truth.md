# ADR 0005: Platform games are the source of truth

## Status

Accepted

## Context

A Steam app id does not identify a PlayStation product, and an achievement on one platform is not the same record as a trophy on another. A required canonical game would block a library on a matching problem the MVP has not solved.

## Decision

Store each platform's game as a `PlatformGame` keyed by platform and that platform's external id. Libraries and achievement definitions attach to those records. A canonical `Game` may be linked later through a nullable foreign key. Do not merge achievement progress across platforms.

The matching source, if any, is an open product decision in [the data model](../architecture/data-model.md). It is not implemented here.

## Consequences

A player can have a Steam library and a PlayStation library before any cross-platform match exists. Unmatched games remain visible. A later matching job fills `canonicalGameId` without rewriting platform identifiers.
