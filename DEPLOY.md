# Deployment Guide: TOP5Y Public Showcase

The public presentation dashboard is live at:
- **Public URL (Path A — GitHub Pages):** `https://myprefrontalcortex.github.io/topsy-showcase/`
- **Live Telemetry Feed (`data` branch):** `https://raw.githubusercontent.com/myprefrontalcortex/topsy-showcase/data`

---

## Path A Architecture (Active — $0/year)

1. **`main` branch:** Holds the React + TypeScript + Vite source code (`src/`, `public/`, `scripts/`).
2. **`gh-pages` branch:** Holds the built static site (`dist/` + `.nojekyll`) served via GitHub Pages.
3. **`data` branch (single-commit orphan):** Updated every 5 minutes by `enterprise:/home/admin/projects/topsy/publish_public_telemetry.py` (`topsy-public-publish.timer`), containing strictly sanitized telemetry JSONs and JPEGs.
4. **Client polling:** [public/config.json](./public/config.json) points `dataBaseUrl` to `https://raw.githubusercontent.com/myprefrontalcortex/topsy-showcase/data` (60s poll, 15m stale threshold to absorb Fastly CDN caching cleanly).

### Updating the UI Later
After editing React/CSS on `main`:
```bash
git push origin main
./scripts/deploy-gh-pages.sh
```
*(Or run `./scripts/deploy-gh-pages.sh` from a host with GitHub credentials configured; note that `docs/deploy-pages.yml.example` is also provided as an optional GitHub Actions workflow template if you add `workflow` scope to your PAT and move it back to `.github/workflows/deploy-pages.yml`.)*

---

## Upgrading to Path B Later (Cloudflare Pages + Worker/R2 + Custom Domain)

If you want sub-30s telemetry refresh without CDN lag or want a wholesale custom domain via Cloudflare Registrar (`.xyz` ~$2–3/yr, `.com` ~$9.77/yr):
1. Connect this repository (`main`) in **Cloudflare Dashboard → Workers & Pages → Create → Pages** (`npm run build`, output `dist`).
2. Deploy `cloudflare-worker/` (KV) or configure Cloudflare R2 (`rclone` remote on `enterprise`).
3. Update `public/config.json` `dataBaseUrl` and `enterprise:/home/admin/projects/topsy/public_publish_config.json` `mode` (`"worker"` or `"rclone"`).
