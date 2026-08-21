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
