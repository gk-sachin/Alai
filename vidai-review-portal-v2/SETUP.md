# Vidai Review Portal — Setup Guide

## What you're deploying
- `index.html` — the whole portal (Phase 1 + Phase 2, single page).
- `Code.gs` — a Google Apps Script backend that logs client decisions to a Sheet.
- Three root image folders, synced from Windows via Git:
  - `Before/` — baseline / current-state screenshots
  - `Proposal/` — proposed-change screenshots (what Phase 1 reviews)
  - `After/` — final screenshots, added only for approved comparisons (Phase 2)

## Folder structure
```
Before/
  keyword-one/
    1.1.png
    1.2.png
  keyword-two/
    2.1.png
Proposal/
  keyword-one/
    1.1.png       <- same filename as its Before counterpart
    1.2.png
  keyword-two/
    2.1.png
After/
  keyword-one/
    (leave empty until the client approves keyword-one in Phase 1)
```
- The comparison list comes from the subfolder names inside `Proposal/`.
- Each image in `Proposal/<title>/` is matched to `Before/<title>/` by **identical filename**.
- Phase 1 shows Before vs Proposal, pair by pair, for every comparison — client Approves or Rejects each one.
- Phase 2 only ever lists comparisons the client **Approved**. Rejected ones never appear again.
  You add images to `After/<title>/` (same filenames as Before/Proposal) only for approved titles.

---

## Step 1 — Create the GitHub repo
1. Go to github.com → **New repository**.
2. Name it (e.g. `vidai-review`), set it to **Public** (a private repo needs a token that
   can't safely live in a page anyone can view — public is the safe/simple option here,
   since these are just proposal screenshots, not sensitive data).

## Step 2 — Upload your folders + index.html
On your Windows machine, using GitHub Desktop (or `git` in a terminal):
1. Clone the new repo to a local folder.
2. Add the `Before/`, `Proposal/`, `After/` folders (see structure above) and `index.html`.
3. Commit and push (GitHub Desktop: "Commit to main" → "Push origin").

## Step 3 — Turn on GitHub Pages
1. In the repo: **Settings → Pages**.
2. Source: **Deploy from a branch**. Branch: `main`, folder: `/ (root)`.
3. Save. After ~1 minute your site is live at:
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

## Step 4 — Create the Google Sheet + Apps Script backend
1. Create a new Google Sheet. Rename the first tab to `Decisions`.
2. In row 1, add headers: `ClientName | Comparison | Decision | Comment | Timestamp`
3. Copy the Sheet's ID from its URL — the long string between `/d/` and `/edit`.
4. In the Sheet: **Extensions → Apps Script**. Delete the placeholder code and paste
   in the contents of `Code.gs`. Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the ID
   from step 3.
5. Click **Deploy → New deployment**. Type: **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click Deploy, authorize the permissions Google asks for, then copy the **Web app URL**
   (ends in `/exec`).

## Step 5 — Wire the config
Open `index.html`, find the `CONFIG` block near the top of the `<script>`, and fill in:
```js
window.CONFIG = {
  githubOwner: "YOUR-GITHUB-USERNAME",
  githubRepo: "YOUR-REPO-NAME",
  githubBranch: "main",
  beforeFolder: "Before",
  proposalFolder: "Proposal",
  afterFolder: "After",
  appsScriptUrl: "https://script.google.com/macros/s/XXXXXXX/exec",
  accessCode: "",              // optional — set a code to require it before starting
  clientLabel: "Vidai — Proposal Review"
};
```
Commit and push this change.

## Step 6 — Try it
Open your GitHub Pages link. You should see the name-entry screen, then Phase 1
with Before vs Proposal pairs, Approve/Reject, comment box, and Next.

## The ongoing workflow
1. Add a new comparison any time: create matching subfolders in `Before/` and `Proposal/`
   with the same title and matching image filenames, then commit + push. Reload the
   link — it appears automatically.
2. Client reviews Phase 1 (Before vs Proposal). Every decision is saved live to your
   Google Sheet, and Back/Next both work if they want to revisit one.
3. Check the Sheet to see which comparisons were **approved**. Rejected ones are done —
   nothing more to do for those.
4. For each approved comparison only, add matching-filename images into
   `After/<comparison-title>/`, then commit + push.
5. Once the client reaches the end of Phase 1 (or reopens the link after finishing),
   they automatically move into Phase 2 — Before vs After, approved comparisons only,
   with its own Back/Next, pulling live from the After folder.
6. Both phases have a **Download PDF** button (browser's native print-to-PDF).

## Optional: custom domain
If you want `review.vidai.ch` instead of the github.io link:
1. Add a `CNAME` file to the repo root containing just: `review.vidai.ch`
2. At your DNS provider, add a CNAME record: `review` → `YOUR-USERNAME.github.io`
3. In repo Settings → Pages, set the custom domain field and enable "Enforce HTTPS"
   once it's verified (can take a few hours).

## Notes / limits
- GitHub's API allows ~60 unauthenticated requests/hour per visitor IP. With a handful
  of comparisons this is comfortable; if you'll have 20+ comparisons and frequent
  reloads, let me know and we can add caching.
- If a client's browser blocks pop-ups/print dialogs, the Download PDF button opens
  the browser's native print dialog — they just choose "Save as PDF" as the destination.
