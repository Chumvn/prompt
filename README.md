# CHUM Prompt

**Structured prompt generator for AI workflows** — generate copy-ready prompts for:

- 🌐 **WEB** — GitHub Pages + optional Google Apps Script backend
- 🎨 **IMAGE** — AI image generation prompts
- ⚙️ **CMD/TOOL** — Windows BAT / PowerShell script prompts

---

## 🚀 Deploy on GitHub Pages

1. Push this folder to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Your app is live at `https://<username>.github.io/<repo>/`

---

## 🎨 Customize Theme

Edit `assets/style.css` → modify the CSS custom properties under `[data-theme="dark"]` and `[data-theme="light"]`:

- `--bg` — Background color
- `--accent` — Primary accent color
- `--radius` — Border radius for cards
- `--font` — Font family

---

## 📋 How to Use

1. Select a mode tab: **WEB**, **IMAGE**, or **CMD**
2. Fill in the form fields
3. Click **⚡ Generate Prompt**
4. Review the output in the preview area
5. Click **📋 Copy** to copy to clipboard
6. Paste into any AI (ChatGPT, Claude, Gemini, etc.)

---

## 📱 PWA Icons

To make the app installable on mobile devices, replace the placeholder icons:

### Required icons:
| File | Size | Purpose |
|------|------|---------|
| `icons/icon-192.png` | 192×192 px | Android install icon |
| `icons/icon-512.png` | 512×512 px | Splash screen |

### iOS Add to Home Screen:
- Safari → Share → "Add to Home Screen"
- The `apple-touch-icon` meta tag uses `icon-192.png`
- For best results, use a square PNG with no transparency

### Generate icons quickly:
1. Create a 512×512 PNG logo
2. Resize to 192×192 for the smaller version
3. Place both in the `icons/` folder

---

## 📂 File Structure

```
├── index.html          # Main app page
├── assets/
│   ├── style.css       # Neumorphism design system
│   └── app.js          # Prompt engine + UI logic
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline cache)
├── icons/
│   ├── icon-192.png    # App icon 192px
│   └── icon-512.png    # App icon 512px
└── README.md           # This file
```

---

## License

Free to use and modify.
