# Med Life Dental — Clinică Stomatologică Premium

## Project Overview

Website premium pentru o clinică stomatologică. Design dark editorial cu accente indigo, UI modern inspirat din produse SaaS. Static HTML, fără build step, fără npm, fără framework.

## Tech Stack

- **Framework**: Static HTML (fără build step, fără npm)
- **Styling**: `styles.css` partajat + `<style>` embeds per-pagină pentru overrides
- **JavaScript**: `script.js` partajat + `<script>` embeds per-pagină
- **Fonts**: `Inter` (300–700) via Google Fonts CDN
- **3D Widget**: `@splinetool/viewer` via unpkg CDN (chat robot)
- **Forms**: Netlify Forms (`data-netlify="true"`) — fără backend propriu
- **Hosting**: Netlify (recomandat)

## File Structure

```
/Users/gabyfrunze/Desktop/Med Life/
├── index.html              # Homepage: hero glob + tratamente + statistici + echipă + tehnologie
├── servicii.html           # Pagina Servicii
├── preturi.html            # Pagina Prețuri — widget interactiv SVG + 3D card tilt
├── contact.html            # Pagina Contact cu formular Netlify Forms
├── galerie.html            # Pagina Galerie
├── tratamente.html         # Pagina Tratamente
├── tehnologie.html         # Pagina Tehnologie
├── echipa.html             # Pagina Echipă
├── confidentialitate.html  # Politica de Confidențialitate + cookie reset
├── 404.html                # Pagină eroare personalizată (Netlify o servește automat)
├── styles.css              # CSS global partajat — NU edita per-pagină
├── script.js               # JS global partajat — page transitions, warp shader, chat, cookie banner
├── favicon.svg             # SVG favicon: dinte indigo (#5E6AD2) pe fond dark (#09090b)
├── robots.txt              # Permite indexare completă + pointer sitemap
├── sitemap.xml             # Toate 9 pagini cu priority și changefreq
└── CLAUDE.md               # Acest fișier
```

> **Important**: `script.js` și `styles.css` sunt încărcate pe TOATE paginile.
> Orice modificare acolo afectează întregul site.

## Design System

### Culori (CSS variables în `styles.css`)
| Token       | Hex / Valoare                  | Utilizare                        |
|-------------|-------------------------------|----------------------------------|
| `--bg`      | `#09090b`                     | Fundal principal                 |
| `--bg2`     | `#111113`                     | Suprafețe ușor ridicate          |
| `--bg3`     | `#18181b`                     | Cards, mock-uri                  |
| `--border`  | `rgba(255,255,255,0.08)`      | Linii separator                  |
| `--border2` | `rgba(255,255,255,0.12)`      | Hover borders                    |
| `--accent`  | `#5E6AD2`                     | Indigo — culoarea principală     |
| `--accent2` | `#6B7AE8`                     | Accent hover                     |
| `--text`    | `#ffffff`                     | Text primar                      |
| `--text2`   | `rgba(255,255,255,0.78)`      | Text secundar                    |
| `--text3`   | `rgba(255,255,255,0.52)`      | Text terțiar, labels             |
| `--green`   | `#3FCF8E`                     | Succes, statusuri pozitive       |
| `--orange`  | `#F97316`                     | Warning, badge-uri               |
| `--purple`  | `#8B5CF6`                     | Accent secundar                  |
| `--pink`    | `#EC4899`                     | Accent decorativ                 |

### Typography
- **Font**: `Inter` — singurul font al proiectului
- **Weights folosite**: 300, 400, 500, 600, 700
- **Headings mari**: `font-size: clamp(28px, 4vw, 44px)`, `letter-spacing: -0.03em`
- **Body text**: `font-size: 15px`, `line-height: 1.65`
- **Navigation links**: `font-size: 14px`, `font-weight: 500`

### Butoane
- `.btn-primary` — background `--accent`, text alb, `border-radius: 8px`
- `.btn-ghost` — border `--border2`, transparent, hover cu `--bg3`
- `.btn-hero-primary` — versiune mai mare pentru hero section
- `.btn-hero-ghost` — versiune ghost pentru hero section

### Border Radius
- Cards, mock-uri: `12px`
- Butoane: `8px`
- Badge-uri mici: `6px`
- Avatar-uri: `50%`

## Background Shader (`#mesh-bg`)

Fundalul animat este un **shader WebGL custom** scris direct în GLSL, în `script.js`.

- Canvas: `<canvas id="mesh-bg">` — `position:fixed; z-index:-1; 100vw×100vh`
- **Algoritm**: Domain warping (FBM pe FBM) + componenta checks distorsionată
- **Culori dark-indigo** (nu grayscale):
  - C0: `vec3(0.035, 0.035, 0.043)` ≈ `#09090b`
  - C1: `vec3(0.055, 0.060, 0.112)` ≈ `#0e0f1c`
  - C2: `vec3(0.080, 0.090, 0.178)` ≈ `#15172d`
  - C3: `vec3(0.118, 0.135, 0.262)` ≈ `#1e2243`
- **Viteză**: `u_time * 0.055` — animație lentă, subtilă
- **Vignette**: darkening la margini pentru focus central

> **Regulă importantă**: NU folosi CDN imports (`import()` din `script.js`) —
> nu funcționează când fișierele sunt deschise direct cu `file://` protocol.
> Tot codul trebuie să fie inline sau vanilla JS fără dependențe externe.

## Page Structure

### `index.html` — Homepage

**Nav**: Logo (SVG dinte + "Med Life Dental") | Servicii · Tratamente · Tehnologie · Echipă · Prețuri · Contact | Galerie (ghost) · Programare Online (primary)

**Hero**: Badge animat · H1 "Zâmbetul tau, arta noastra." · paragraf descriere · 2 CTA-uri · **glob COBE interactiv** (drag cu mouse, gyro pe mobil)

**Secțiuni în ordine**:
1. Tratamente (implantologie, smile design, ortodonție) + mock plan tratament
2. Feature cards 6 servicii principale
3. Quote pacient #1 — Andreea M.
4. Statistici (cifre clinică) + mock dashboard
5. Quote pacient #2 — Mihai D.
6. Echipă (6 medici în mock list)
7. Quote pacient #3 — Elena R.
8. Tehnologie (CBCT, scanner, CAD/CAM, laser, sterilizare, RVG)
9. Toate serviciile — grid 9 cards
10. CTA final — "Gata pentru zâmbetul perfect?"
11. Footer — 5 coloane + `.footer-bottom` cu link Confidențialitate
12. Chat widget AI

### `preturi.html` — Prețuri

- Widget interactiv SVG cu cursor tracking (grafic animat care urmărește mouse-ul)
- Cards de prețuri cu efect 3D tilt la hover (`transform: perspective + rotateX/Y`)
- Tabele prețuri pe categorii de tratamente

### `contact.html` — Contact

- Layout 2 coloane: info stânga, formular dreapta
- Info: Adresă · Program · Email · Telefon
- Form: Nume · Telefon · Email · Serviciu · Data · Ora · Mesaj · Submit
- **Netlify Forms**: `data-netlify="true"` + `<input type="hidden" name="form-name">` + `name` pe fiecare câmp
- **Submit**: `handleForm()` trimite cu `fetch('/', {method:'POST'})` — afișează `#formSuccess` la succes
- `referrerpolicy="no-referrer-when-downgrade"` pe iframe Google Maps (fără diacritice în valoare)

### `galerie.html` — Galerie

- Grid imagini cazuri tratate

### `confidentialitate.html` — Politica de Confidențialitate

- Politică GDPR completă: operator, date colectate, baze legale, drepturi utilizator
- Buton "Resetează preferințele cookie" — șterge `ml_cookie_consent` din localStorage și reîncarcă
- `<meta name="robots" content="noindex">` — nu se indexează în Google

### `404.html` — Pagină eroare

- Servită automat de Netlify când o pagină nu există
- Design consistent cu site-ul, CTA spre homepage și contact
- `<meta name="robots" content="noindex, nofollow">`

## Interactive Features (`script.js`)

### Page Transitions
- **Intrare**: `.hero` și `.page-hero` pornesc cu `opacity:0; translateY(28px)` din CSS, urcă lin la load
- **Ieșire**: click pe link intern → tot conținutul fade + translateY(28px) în 0.5s → navigate

### Warp Shader Background
- Shader GLSL WebGL pe `#mesh-bg` canvas (vedere mai sus)
- Rezoluție setată la `window.innerWidth × window.innerHeight`, resize listener activ

### Scroll Fade-In
- `IntersectionObserver` pe toate `section:not(.hero)`, `.sync-wrap`, `.feature-card`
- Threshold `0.1` — apare când 10% din element intră în viewport
- **`observer.unobserve(e.target)`** apelat după prima apariție — elementele nu mai sunt monitorizate continuu

### Chat Widget — Med Life AI
- Buton fix bottom-right cu animație pulse și notificare "1"
- Scene Spline 3D robot: `https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`
- Bot cu răspunsuri predefinite pentru: programări, implant, Invisalign, albire, urgențe, prețuri, asigurări, locație
- Input text + quick reply chips + răspunsuri simulate cu typing delay
- **XSS**: `addMsg()` folosește `bubble.textContent` pentru input utilizator și `bubble.innerHTML` doar pentru răspunsurile bot (stringuri fixe)

### Cookie Banner GDPR
- Apare la prima vizită pe orice pagină (când `localStorage.getItem('ml_cookie_consent')` e null)
- Slide-up animat din jos; două butoane: „Accept toate" / „Doar necesare"
- Preferința stocată în `localStorage` cu cheia `ml_cookie_consent` (valori: `'accepted'` sau `'declined'`)
- Link spre `confidentialitate.html`; resetare posibilă de pe acea pagină
- CSS în `styles.css`, logica în `script.js` (la finalul fișierului, IIFE separat)

## SEO & Indexare

### Meta tags (pe toate 8 paginile principale)
- `<meta name="description">` — descriere unică per pagină
- `<meta property="og:type/url/title/description/image">` — Open Graph pentru preview WhatsApp/social
- `og:image` referă `https://medlifedental.ro/og-image.jpg` — **fișier de creat** (1200×630px)

### Schema.org JSON-LD
| Pagină | Tip | Ce indexează Google |
|--------|-----|---------------------|
| `index.html` | `DentalClinic` | Orar, rating ★4.9, adresă, telefon, 6 servicii, fondator |
| `contact.html` | `DentalClinic` + `ContactPoint` | Telefon direct, urgențe 24/7 |
| `servicii.html` | `ItemList` + `MedicalProcedure` | 9 proceduri indexate individual |

### robots.txt + sitemap.xml
- `robots.txt`: `Allow: /` + pointer la sitemap
- `sitemap.xml`: 9 pagini cu `priority` și `changefreq`; după deploy trimite la **Google Search Console**

## Services & Content

### Tratamente principale
| Tratament | Detalii cheie |
|-----------|--------------|
| Implantologie | Straumann & Nobel Biocare, 98.7% succes, All-on-4/All-on-6 |
| Smile Design Digital | Software DSD + scanner 3D, simulare înainte de tratament |
| Ortodonție | Invisalign, alinere, aparate ceramice și metalice |
| Estetică Dentară | Fațete ceramice, coroane, albire laser — 2 ședințe |
| Endodonție | Canal cu rotative mecanice + apex locator |
| Parodontologie | Detartraj subgingival, chirurgie regenerativă |
| Chirurgie Laser | Laser Fotona — fără bisturiu, fără sutură |
| Protetică | CAD/CAM in-house, coroană în 24h |
| Profilaxie | Airflow, fluor, sigilare șanțuri (copii) |
| Sedare | IV sau protoxid de azot |

### Statistici clinică
- **20.000+** pacienți tratați în 15 ani
- **5.000+** implanturi plasate, rată succes **98.7%**
- **4.9 ★** rating din **2.400+** recenzii Google
- **12** medici specialiști
- **487** consultații / lună
- **30+** asigurători parteneri

### Echipă (în mock-ul din `index.html`)
- Dr. Radu Constantin — Implantolog Senior, Fondator, 15 ani exp.
- Dr. Ana Munteanu — Ortodontist, Invisalign Provider, 11 ani exp.
- Dr. Ionuț Popa — Chirurg Oral, specializare Viena, 9 ani exp.
- Dr. Laura Toma — Estetică Dentară, DSD Certified, 8 ani exp.
- Dr. Sofia Barbu — Stomatologie Pediatrică, 6 ani exp.

### Contact info
- Adresă: Str. Mihai Eminescu 42, Sector 2, București
- Linie urgențe: **0800 123 456** (24/7)
- Program: L-V 08:00–20:00, Sam 09:00–15:00
- Email: contact@medlifedental.ro

## Common Tasks

### Schimbare culoare accent
Editează `--accent` și `--accent2` în `:root` din `styles.css`. Shaderul de fundal are culorile hardcodate în GLSL (în `script.js`) — actualizează și acolo dacă vrei consistență totală.

### Adăugare secțiune nouă în homepage
1. Adaugă HTML în `index.html` după ultima secțiune, înainte de `.cta-section`
2. Folosește structura: `<section><div class="container">...</div></section>`
3. Scroll fade-in e automat (IntersectionObserver din `script.js` prinde orice `section`)

### Adăugare pagină nouă
1. Copiază `<head>`, nav, footer, chat widget și `<canvas id="mesh-bg">` dintr-o pagină existentă
2. Adaugă `<link rel="stylesheet" href="styles.css">` și `<script src="script.js" defer></script>`
3. Adaugă `class="page-hero"` pe primul element vizibil pentru page transition
4. Adaugă link-ul în nav-ul tuturor paginilor
5. Adaugă pagina în `sitemap.xml`

### Modificare text/preț în chat bot
Caută în `script.js` obiectul `BOT` — toate răspunsurile sunt acolo, grupate pe topic (programare, implant, invisalign, albire, urgenta, preturi, asigurari, locatie).

### Modificare shader fundal
În `script.js`, caută `/* ── WARP SHADER BACKGROUND ── */`. Modifică:
- `C0`–`C3`: culorile în format `vec3(R, G, B)` cu valori 0.0–1.0
- `float t = u_time * 0.055` — viteza animației (mai mare = mai rapid)
- `mix(f, chk, 0.28)` — ponderea componentei checks (0 = pur FBM, 1 = pur checks)

### Resetare preferințe cookie (pentru testare)
```js
localStorage.removeItem('ml_cookie_consent')
```
Sau folosește butonul din `confidentialitate.html`. Bannerul reapare la următorul reload.

### Actualizare Schema.org JSON-LD
JSON-LD e inline în `<head>` pe `index.html`, `contact.html`, `servicii.html`. Dacă schimbi orarul sau adresa, actualizează în toate cele 3 locuri.

## Pending / De completat

| Item | Detalii |
|------|---------|
| `og-image.jpg` | Creează un fișier 1200×630px și pune-l în folderul `Med Life/`. Folosit de toate paginile ca preview social. |
| Social media links | `href="#"` pe Facebook, Instagram, YouTube în `.footer-bottom-links` — înlocuiește cu URL-urile reale ale clinicii |
| Google Search Console | După deploy, trimite `https://medlifedental.ro/sitemap.xml` pentru indexare prioritară |
| Email contact form | `contact@medlifedental.ro` în `confidentialitate.html` — verifică că adresa e reală |

## Deployment

### Netlify — drag & drop (cel mai simplu)
1. Accesează [app.netlify.com](https://app.netlify.com)
2. Trage folderul `Med Life/` în interfață
3. URL generat automat (ex: `amazing-name-123.netlify.app`)
4. Netlify detectează automat `404.html` și formularul (`data-netlify="true"`)

### Netlify CLI
```bash
npm install -g netlify-cli
netlify login
cd "/Users/gabyfrunze/Desktop/Med Life"
netlify deploy          # preview
netlify deploy --prod   # producție
```

## Git Workflow

```bash
cd "/Users/gabyfrunze/Desktop/Med Life"
git add index.html servicii.html preturi.html contact.html galerie.html \
        tratamente.html tehnologie.html echipa.html \
        confidentialitate.html 404.html \
        styles.css script.js favicon.svg \
        robots.txt sitemap.xml CLAUDE.md
git commit -m "feat: SEO, GDPR, schema.org, cookie banner, 404"
git push origin main
```

## Notes & Gotchas

- **File protocol**: Când deschizi cu `file://`, `import()` CDN-uri externe nu funcționează. Tot codul trebuie să fie inline sau din fișiere locale.
- **`script.js` e global**: Orice breakage acolo afectează toate paginile. Testează după fiecare modificare.
- **Canvas `#mesh-bg`**: Trebuie să fie primul element din `<body>` pe fiecare pagină.
- **Hero opacity**: `.hero` și `.page-hero` pornesc cu `opacity:0` din `styles.css` — script.js le animează la load. Nu adăuga `opacity:1` manual în CSS.
- **Spline în chat**: `<spline-viewer>` e încărcat din `https://unpkg.com/@splinetool/viewer@1.9.79/build/spline-viewer.js` — necesită conexiune internet.
- **Border radius**: Menține maxim `12px` pentru cards. Butoanele au `8px`. Nu folosi `border-radius` mare (20px+) — strică estetica premium.
- **Responsive**: Nav colapsează la `768px`. Hero-ul din index are layout split (text stânga, glob dreapta) pe desktop, coloană pe mobil.
- **Cookie banner**: NU adăuga `#cookie-banner` manual în HTML — e generat dinamic de `script.js`. Dacă banner-ul nu apare, șterge `ml_cookie_consent` din localStorage.
- **Netlify Forms**: Funcționează DOAR pe domeniu Netlify (nu local cu `file://`). Testarea locală va da eroare 404 pe submit — e normal.
- **Schema.org `sameAs`**: URL-urile Facebook/Instagram din JSON-LD (`index.html`) sunt placeholder — actualizează când ai paginile reale.
- **`referrerpolicy` pe iframe Maps**: Valoarea trebuie să fie ASCII pur — nicio diacritică (bug fix aplicat anterior pe `contact.html`).
