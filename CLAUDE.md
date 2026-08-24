@AGENTS.md

# Working rules

## The human runs the servers, not the agent

The developer starts and stops this site themselves. Do not run `npm run dev`,
`next dev`, `npm start`, or anything else that holds a port — port 3000 normally
belongs to their own terminal.

- Never kill a process or free a port you did not start. Check `CommandLine` and
  `CreationDate` before stopping anything; a process started seconds ago is
  theirs, not a leftover.
- If a runtime check is genuinely needed, ask: name the command you want run and
  the output you need back.
- Safe to run yourself (they exit on their own and hold no port):
  `npx tsc --noEmit`, `npx eslint .`, `npm run build`.

A green build does not prove the page behaves. Say what was actually checked
("typecheck, lint and build pass; not opened in a browser") rather than claiming
it works.

## API contract

The backend lives in `../PG-Backend` and is the source of truth for every type in
`lib/api/`. When an endpoint changes, update both sides in the same change.

**A field missing from an interface in `lib/api/` disables type checking for that
field everywhere.** `RoomTypeInput` was missing `roomCount`, so
`payload.push({ type, pricePerBed, ...images })` compiled happily with the field
simply absent, and every room save failed with a server error that blamed a
number the owner had not typed. The moment `roomCount` was added to the
interface, `tsc` pointed at the exact line.

So when a save fails validation, compare the interface in `lib/api/` against the
DTO in `../PG-Backend/src/modules/**/models/` field by field before touching
anything else. Adding the missing field to the interface first will usually find
the bug for you.

## Keep existing functions working

A fix that breaks something else is not a fix. Add a branch or a field rather
than rewriting a working component, and when you change shared code, check every
place that uses it — `grep` the name across `app/`, `components/`, `lib/` and
`stores/`. If you cannot preserve an existing behaviour, say so and explain the
trade-off; never decide it silently.

This covers **functions, components, stores, API types, database models and
migrations alike**. A model is the hardest of these to undo: never remove or
retype a Prisma field to make something else fit, and never write a migration
that drops or rewrites existing rows. Add a nullable column and backfill it.

**Widen with optional parameters that default to today's behaviour.** When a
component needs to serve a second case, give it a prop with the current value as
its default, so every existing call site keeps working untouched and unedited.
`OwnerShell` serves the Super Admin dashboard this way: `role`, `nav` and
`subtitle` are optional and default to the PG owner's, so the owner layout did
not change at all.

## Reuse what is already built

Before writing a new component, look for one that already does the job. The
pieces most worth reaching for:

- `components/owner/OwnerShell` — header, sidebar and role gate for any
  dashboard, owner or admin
- `components/owner/PageHeader` — the title block on every dashboard screen
- `components/owner/PreviewSection` — an honest "designed, not connected yet"
  panel, instead of inventing figures
- `components/common/UserAvatar` — a person's photo, or their initials
- `components/auth/RoleGate` — signed-in and role checks
- `stores/resource-cache` — `useCachedResource`, so data survives navigation

A second copy of any of these will drift from the first. If the existing one
almost fits, add a prop to it rather than forking it.
