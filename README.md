# blk

personal, browser-based utilities created by vtekula to speed up
common ops and text manipulation tasks.

no data is persisted, everything runs client-side in the browser.

## tools

- entities: de-dupe and reformat lists of clients/appservers (line, comma, or
  space delimited; optional sorting and quoting).
- diff: compare two pasted blocks with inline or side-by-side diffs and
  word-level highlights.
- overdue: parse "overdue" alert text and generate restart commands for p1nj.
- sam shell: convert instance mismatch alerts (mobaxterm or prodmon) into
  samsh commands.
- rejectVersion: build a rejectVersion URL for an appserver, version, and
  reason.
- clock: simple clock with timezone converter with live clocks.

## setup

```bash
npm install
npm run dev
npm run deploy
```
