# ADR 0002: Modular monolith

## Status

Accepted

## Context

The MVP needs one API that can grow internal boundaries for identity, connected accounts, games, and achievements. It does not need independent deploys, a service mesh, or a message bus. The first deployment target is a single virtual machine.

## Decision

Ship one NestJS process. Modules are code boundaries inside that process. Do not introduce microservices, Kubernetes, Redis, or Kafka unless a later ADR shows an MVP requirement they satisfy.

## Consequences

Local development and the first deployment stay small. A boundary that later needs its own process can be split from a module that already hides its data access. That split is not part of the scaffold.
