# Deploying storying.app

Cloudflare Pages, connected to a Git repository. Once this is set up, publishing a change
is `git push` and nothing else. No zips, no uploads, no dashboard.

Domain registered at Namecheap, hosting on Cloudflare Pages, free on both sides.

---

## Part 1. Put this folder in a Git repository

From this folder:

```bash
git init
git add .
git commit -m "storying.app pitch page"
```

Then create an empty repo on GitHub (private is fine) and push:

```bash
git remote add origin https://github.com/<you>/storying-app-site.git
git branch -M main
git push -u origin main
```

`dist/` and `node_modules/` are gitignored. Cloudflare builds `dist/` itself.

---

## Part 2. Connect Cloudflare Pages to the repo

1. Cloudflare dashboard, **Workers & Pages**, **Create application**, **Pages** tab,
   **Connect to Git**.
2. Authorise GitHub and pick the repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy.**

You get a live URL at `<project-name>.pages.dev` within a couple of minutes. Every push to
`main` redeploys automatically. Pull requests get their own preview URL.

**Test it on a phone before going further.** That is the whole point of this page existing.

---

## Part 3. The one thing that shapes the domain setup

To serve the site at **storying.app** with no `www`, Cloudflare has to be the DNS provider
for the domain. That is not a Cloudflare preference, it is how DNS works: the root of a
domain cannot be a CNAME record, and Pages needs one. Cloudflare works around it with CNAME
flattening, but only for domains whose nameservers point at Cloudflare.

**Namecheap stays your registrar.** You keep owning and renewing the domain there. Only DNS
lookups move.

### Before you switch: does anything else use storying.app?

The moment nameservers move, any DNS record not already in Cloudflare stops existing. If
storying.app has email (MX records), a domain-verification TXT record, or any subdomain in
use, screenshot them first: Namecheap, **Domain List**, **Manage**, **Advanced DNS** tab.
Cloudflare's scanner usually finds them, but email breaking silently is a bad afternoon.

If the domain is parked and unused there is nothing to preserve.

### Add the domain to Cloudflare

1. Dashboard, **Domains**, **Onboard a domain** (older dashboards: **Add a site**).
2. Enter `storying.app`, let Cloudflare scan for existing records, choose the **Free** plan.
3. Check the scanned records against your screenshot. Add anything missing.
4. Cloudflare gives you **two nameservers**. Copy both exactly.

### Point Namecheap at them

1. Namecheap, **Domain List**, **Manage** next to storying.app.
2. In the **Nameservers** section change the dropdown from **Namecheap BasicDNS** to
   **Custom DNS**.
3. Paste both Cloudflare nameservers, delete any empty rows, click the **green checkmark**.
4. While you are there: if **DNSSEC** is enabled on the Advanced DNS tab, turn it off.
   DNSSEC configured for the old nameservers will stop the domain resolving entirely once
   it moves. It is off by default on most Namecheap domains, but check.

Namecheap says up to 24 hours; for a `.app` it is usually 15 to 60 minutes. Cloudflare
emails you when the domain is Active. **Wait for that before the next step.**

### Attach the domain to the Pages project

1. **Workers & Pages**, your project, **Custom domains** tab, **Set up a domain**.
2. Enter `storying.app`. Cloudflare creates the DNS record itself.
3. Repeat for `www.storying.app` so people who type `www` still land correctly.

Then wait a few minutes for the TLS certificate.

**`.app` is special.** Google owns the TLD and has it on the browser HSTS preload list, so
every browser refuses to load any `.app` site over plain HTTP. There is no insecure
fallback and no way to preview early. Until the certificate is issued you will see a
security warning instead of the site. Normal. Give it 15 minutes.

---

## Part 4. Check it

- Open it on a phone, a laptop, and a phone in landscape.
- Paste the link into Slack or a text message and confirm the preview card appears. That is
  `share.png` at `https://storying.app/share.png`. If the preview is blank, open that URL
  directly to confirm the file deployed.
- Click every nav item, the creationtochrist.app tile, and the email button.

---

## Making changes from now on

Edit `build-site.mjs`, run `npm run build` to check it locally, commit, push. Live in about
a minute. Every deployment is kept with its own preview URL, and you can roll back to any
previous one from the **Deployments** tab, so a bad push is never permanent.

---

## The other nine domains

`7commands.app`, `storiesofhope.app` and the rest follow the same pattern: one Pages
project per site, each domain added to Cloudflare as its own zone, nameservers pointed from
Namecheap. All of them live under the one Cloudflare account.

---

## If something goes wrong

**Build fails on Cloudflare but works locally.** Check the build log for the Node version.
Set `NODE_VERSION` to `20` in the project's environment variables if needed.

**"This site can't be reached" right after attaching the domain.** The certificate has not
been issued yet. Check **Custom domains**; the status should read Active, not Pending.

**Error 522.** A DNS record was created by hand instead of through the Pages **Set up a
domain** flow. Delete it in the DNS tab and redo that step.

**Domain still shows the old parked page.** Cached DNS. Try mobile data or a private window.

**Email stopped working.** The MX records did not come across. Add them back in Cloudflare,
**DNS**, **Records**. Mail retries for days, so nothing is lost if you fix it soon.
