KYC VAULT - NEW opt-in consolidation watcher (_KYC_VAULT_NEW)
==============================================================

WHAT THIS IS
------------
A fully separate replacement for the old merger (the old ..\_AUTOMATION
folder has been deleted by the user; this project is now the only
automation). It never
touches a download automatically: a file is only considered after YOU rename
it so its name ends with "-KYC" (case-insensitive), e.g.:

    ACME TRADING - KYC.pdf        <- approved (your manual action)
    acme trading - kyc.PDF        <- also approved (case-insensitive)
    ACME TRADING - KYC (2).pdf    <- approved too (copy-number right after -KYC)
    ACME TRADING invoice.pdf      <- ignored, left alone
    ACME TRADING - KYC copy.pdf   <- ignored (name does not end in -KYC)

Only files whose NORMALIZED name stem matches exactly are grouped together
(normalize = strip -KYC, collapse spaces, ignore case). There is no fuzzy
matching of any kind.

HOW A GROUP BECOMES A VAULT PDF
-------------------------------
1. Every member must be stable: same size+mtime across scans AND untouched
   for the quiet period (default 8 s, "quiet_period_seconds") AND readable
   (not locked by a downloader). With the default 5 s scan interval a
   renamed file is normally consolidated ~10-15 s after you rename it.
   Half-written downloads are still impossible to catch: their size/mtime
   keep changing (or the downloader holds a lock), so the stability check
   restarts until the file is genuinely finished.
2. Members are converted to PDF (PDF copied as-is, images wrapped, DOCX/XLSX
   via installed Word/Excel, with a text-extraction fallback).
3. The merged candidate is built in tmp\ and validated twice (PyMuPDF + pypdf;
   page count must equal the exact expected total).
4. If the target "..\ <name> - KYC.pdf" does not exist: it is written
   atomically and recorded in state\manifest.json as ours.
   If it exists and IS in our manifest with a matching hash: the old file is
   copied to backups\<timestamp>\ first, then replaced atomically.
   If it exists but was NOT created by this project (or was modified outside
   it): NOTHING in the vault is touched. The candidate is put in review\ with
   a .txt explaining your two options (keep existing, or adopt it).
5. Originals are never modified or deleted. Once a group is merged, its
   approved sources are MOVED into KYC VAULT\_SOURCES\<company>\ so
   Downloads stays clean (set "move_sources_after_merge": false to keep
   them in Downloads instead). Filed copies are included in later rebuilds.

IDENTICAL vs CONFLICTING FILES
------------------------------
- Two members with byte-identical content are logged as an "identical hash
  collision" and their content is merged only once.
- A group whose target is not safely ours goes to review\ instead of
  overwriting - conflicting files stay safe and wait for your decision.

DAILY USE
---------
  Rename the downloads you want consolidated so the name ends in -KYC.
  Within ~10-15 seconds (quiet 8 s + scan 5 s) the group is consolidated
  into "KYC VAULT\<stem> - KYC.pdf" and its sources are filed into
  _SOURCES\<company>\.
  Every merge shows a small silent notification-area balloon (no window,
  no console) - "notify": false turns that off. A group whose conversion
  fails (e.g. Word busy) is retried automatically every
  "retry_cooldown_seconds" (default 5 min); groups waiting for your
  decision (review) are never auto-retried.
  Keep "auto_finalize": true for hands-off operation, or set it false and
  run manual commands below.

COMMANDS (open a terminal in this folder)
-----------------------------------------
  python kyc_new_watcher.py status           watcher + pending summary
  python kyc_new_watcher.py pending          groups waiting, no changes made
  python kyc_new_watcher.py scan             one pass now
  python kyc_new_watcher.py finalize "STEM"  force-finalize one group now
                                             (still subject to quiet period
                                             and all safety checks)
  python kyc_new_watcher.py adopt "X - KYC.pdf"
                                             claim an existing vault PDF as
                                             ours so future rebuilds may
                                             replace it (with backup)

START / STOP
------------
  START WATCHER.bat   start it (no window, single instance). Refuses to start
                      while "enabled": false in config.json.
  STOP WATCHER.bat    stop it (only kills kyc_new_watcher.py processes) and
                      shows a silent confirmation balloon
  STATUS.bat          show state (opens in Notepad - no black console)

AUTOSTART: registered for this user in the Run key ("KYC Vault NEW Watcher"),
started silently with pythonw at every Windows logon - no window, no console.
To remove autostart, delete that value from
HKCU\Software\Microsoft\Windows\CurrentVersion\Run.

TESTING
-------
  python tests\run_tests.py
  Runs synthetic files inside tests\sandbox only (never the real Downloads
  or the real vault) and prints PASS/FAIL per scenario.

SAFETY / OLD AUTOMATION
-----------------------
  The old watcher was stopped during setup and its logon autostart was
  removed; the ..\_AUTOMATION folder and the old audit file were then
  deleted by the user (2026-10-15). Nothing references the old program any
  more - verified: no process, no Run entry, no scheduled task. If the old
  system is ever needed again it must come from a backup; there is
  intentionally nothing left to restart.

FILES
-----
  kyc_new_watcher.py   the engine
  config.json          paths, quiet period, enable switch
  logs\watcher.log     what it did (rotated at ~2 MB)
  state\state.json     stability + processed sources
  state\manifest.json  outputs THIS project created/owns (+ baseline hashes)
  tmp\                 candidates are built here (wiped per run)
  backups\             pre-replacement backups of our own outputs
  review\              candidates that need YOUR decision
  tools\*.ps1          Word/Excel conversion helpers
  tests\run_tests.py   synthetic test suite (isolated sandbox)
