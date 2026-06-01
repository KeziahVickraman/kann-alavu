# Kann Alavu — கண் அளவு

> *Measuring by eye. Preserving recipes the way they actually live.*

A warm, personal recipe keeper built to capture home cooking knowledge — especially the kind that lives in voice notes, TikTok saves, and instinct rather than precise measurements.

---

## What it does

- **Import from anywhere** — paste a TikTok or Instagram link, record a voice note, scan a photo, or type it out
- **Kann alavu fields** — every ingredient can hold both an exact amount *and* a visual description ("a lemon-sized ball of tamarind", "until the colour looks right")
- **Amma's notes** — a freeform memory block per recipe for the things that don't fit in steps
- **iOS/Android share sheet** — share directly from TikTok or Instagram and the recipe lands in your Imports tab for review
- **Imports tab** — a queue where saved links are processed, reviewed, and moved into your collection

---

## Stack

- **Frontend** — React Native (Expo)
- **Backend** — Firebase (auth, Firestore, storage)
- **AI extraction** — Claude API (recipe parsing, kann alavu translation, ingredient structuring)
- **Prototyped in** — Google AI Studio → exported to Antigravity 2.0

---

## Getting started

```bash
git clone https://github.com/your-username/kann-alavu.git
cd kann-alavu
npm install
npx expo start
```

---

## Project structure

```
kann-alavu/
├── screens/
│   ├── Browse.jsx        # Recipe grid with filters
│   ├── AddRecipe.jsx     # Import flow + kann alavu editor
│   └── RecipeDetail.jsx  # Full recipe with badges + notes
├── components/
│   ├── KannAlavuBadge    # Amber pill for eye measurements
│   ├── SourceBadge       # TikTok / Instagram / voice / manual
│   └── AmmaNotesBlock    # Freeform memory field
├── services/
│   ├── extractRecipe.js  # Claude API — URL → structured recipe
│   └── firebase.js       # Firestore read/write
└── share-extension/      # iOS share sheet + Android intent
```

---

## Roadmap

- [x] Core three screens (Browse, Add, Detail)
- [x] Kann alavu ingredient fields
- [ ] TikTok/Instagram URL extraction via Claude
- [ ] iOS share extension (TestFlight MVP)
- [ ] Voice note transcription + parsing
- [ ] Family sharing — Amma's Recipes collection
- [ ] Android share intent

---

## Philosophy

South Asian home cooking lives in embodied memory — *cook until it smells right from the next room*, *fry the mustard seeds until they pop twice, not once*. This app exists to preserve that knowledge alongside structured data, not replace it.

---

*Built with love, tamarind, and too many voice notes.*
