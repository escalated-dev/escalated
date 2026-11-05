// Embedding Escalated's admin in a host admin panel (ADR 2026-11-05).
// This entry point has no Vue or Inertia imports, so a non-Vue admin can use
// the iframe host helper on its own: `@escalated-dev/escalated/embed`.
export { connectEscalatedFrame } from './frameHost';
export { startFrameBridge } from './frameBridge';
export { PROTOCOL_VERSION, FRAME_SOURCE, HOST_SOURCE, isPathUnder, normaliseOrigins } from './protocol';
