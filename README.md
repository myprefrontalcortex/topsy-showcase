# TOP5Y Terrarium Sentinel — Public Showcase

Read-only live presentation dashboard for **TOP5Y** (*Rhacodactylus auriculatus*, Gargoyle Gecko), built with React, TypeScript, Vite, Chart.js, and Vanilla CSS.

All control relays, private device credentials, LAN/Tailscale endpoints, Telegram alerts, and hardware configuration controls are completely omitted by design. The site renders strictly sanitized public telemetry, environmental charts, growth biometrics, YouTube Live video, thermal infrared imagery, and habitat snapshots.

## Features
- **Live Telemetry Cards:** Enclosure temperature & humidity with 15-minute trend arrows, daily min/max, 7-day averages, ambient room sensor comparison, regional weather (`Tokyo, Japan`), and Raspberry Pi 5 diagnostics.
- **Interactive Charts (Chart.js + Zoom):**
  - **Live (`1H` – `7D`):** Terrarium & room climate curves, 15-sample moving averages, misting sprays, fan pulses, wheel/pinch zoom & pan.
  - **Daily History (`30D` – `90D`):** Long-term daily mean, median, and max climate trends.
  - **AC History:** Daily cooling cycle counts, median duration, total hours vs outdoor max temperature.
  - **Biometrics & Health Log:** Dual-axis SVL (cm) + Weight (g) growth timeline with feeding, shedding, and terrarium cleaning markers.
- **Live Camera & Thermal Feeds:** YouTube Live embed with optional Snapshot mode toggle, `256×192` UVC Infrared thermal heatmap, and conditional privacy-cropped MimiCam snapshot.
- **Care & Automation Badges:** Read-only header status chips for deep clean countdown, feeding, skin shedding forecast window, Mimi-chan care schedule, plus autonomous misting/fan/AC status pills and recent motion timestamps.

## Local Development
```bash
npm install
npm run dev
```

To verify TypeScript strict compilation and production build:
```bash
npm run typecheck
npm run build
```

See [DEPLOY.md](./DEPLOY.md) for zero-cost publishing options using GitHub Pages or Cloudflare Pages.
