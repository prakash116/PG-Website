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
