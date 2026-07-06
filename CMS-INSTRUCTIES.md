# Wildcore CMS — installatie-instructies

Dit document legt uit hoe je het CMS live zet, zodat de klant kan inloggen op
`/admin/` en zelf teksten en foto's kan wijzigen — en die wijzigingen direct
gepubliceerd worden op de website.

## Hoe het werkt

- De site zelf blijft een gewone statische website op GitHub Pages, precies zoals nu.
- Alle bewerkbare teksten staan in drie bestanden in de hoofdmap van de repo:
  `content-nl.json`, `content-en.json`, `content-es.json`.
- `/admin/index.html` is het inlogscherm + bewerkscherm. Het haalt deze drie
  bestanden op, toont ze als een formulier, en stuurt de wijzigingen naar een
  kleine backend (een "Cloudflare Worker").
- Die Worker controleert de inloggegevens, en committet de aangepaste bestanden
  (en eventueel vervangen foto's) rechtstreeks naar de GitHub-repo via de
  GitHub API. GitHub Pages bouwt de site daarna automatisch opnieuw — dat duurt
  meestal 30 à 90 seconden.

Er is geen aparte database en geen maandelijkse kosten: Cloudflare Workers is
gratis voor dit soort gebruik (ruim binnen de gratis limiet).

## Wat de klant wél en niet kan wijzigen

**Wel:** alle teksten op de vijf secties (hero, waarom Wildcore, kenmerken,
programma, villa, gastheer, prijzen, contactgegevens) in alle drie de talen,
plus alle 12 foto's + het logo (door een nieuwe foto te uploaden op dezelfde
plek).

**Niet, met opzet:**
- De volledige juridische algemene voorwaarden en de FAQ-tekst in de
  "Praktisch"-sectie — dit is bewust vast gehouden, zodat er nooit per ongeluk
  een juridische fout in sluipt.
- De menu-items en footer-tekst (vaste sitenavigatie).
- De cijfers in de statistiekenbalk (43 km / 1500 hm / 3 dagen) — alleen de
  bijschriften eronder zijn aanpasbaar. Dit voorkomt dat de tekst en de
  geanimeerde telling uit elkaar gaan lopen.

Wil de klant hier iets in laten wijzigen, dan kan dat gewoon via jou als
ontwikkelaar — dat blijft een kwestie van de HTML-bestanden aanpassen.

## Stap 1 — Zorg dat alles op GitHub staat

Voordat de Worker iets kan bijwerken, moeten alle nieuwe bestanden van deze
sessie eerst naar GitHub gepusht zijn (anders bestaan ze daar nog niet en kan
de Worker ze niet vinden). Open GitHub Desktop, controleer dat je deze
wijzigingen ziet, en commit + push ze:

- `content-nl.json`, `content-en.json`, `content-es.json` (nieuw)
- `index.html`, `en/index.html`, `es/index.html` (aangepast — data-key's + loader)
- `admin/index.html` (nieuw)
- `cms-worker/worker.js` (nieuw, alleen ter referentie — dit bestand wordt zelf
  niet gehost op GitHub Pages, je plakt de inhoud straks in Cloudflare)

## Stap 2 — Maak een GitHub Personal Access Token

De Worker heeft een eigen sleutel nodig om namens jou naar de repo te mogen
schrijven.

1. Ga naar GitHub → klik rechtsboven op je profielfoto → **Settings**.
2. Ga naar **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
3. Geef hem een naam, bijvoorbeeld `wildcore-cms`.
4. Bij **Repository access**: kies "Only select repositories" en selecteer
   `Wildcore-concept1`.
5. Bij **Permissions** → **Repository permissions**: zet **Contents** op
   **Read and write**.
6. Klik **Generate token** en **kopieer de token direct** (je ziet hem daarna
   nooit meer terug). Bewaar hem tijdelijk ergens veilig, je hebt hem zo nodig.

## Stap 3 — Maak de Cloudflare Worker aan

1. Ga naar [dash.cloudflare.com](https://dash.cloudflare.com) en maak een
   gratis account (of log in).
2. Ga in het menu naar **Workers & Pages** → **Create** → **Create Worker**.
3. Geef de Worker een naam, bijvoorbeeld `wildcore-cms`. Klik **Deploy** (er
   staat eerst nog voorbeeldcode in, dat maakt niet uit).
4. Klik daarna op **Edit code** (soms "Quick edit" genoemd).
5. Verwijder alle bestaande code in de editor en plak de volledige inhoud van
   `cms-worker/worker.js` (uit deze repo) erin.
6. Klik **Save and deploy** (of **Deploy**).
7. Kopieer de URL die Cloudflare je geeft, iets als
   `https://wildcore-cms.jouwnaam.workers.dev` — die heb je zo nodig.

## Stap 4 — Zet de geheime instellingen (secrets)

Nog in het Worker-scherm: ga naar **Settings** → **Variables and Secrets**
(soms onder "Settings" → "Variables"). Voeg de volgende toe — bij elk van deze
kies je **Encrypt** / **Secret** als dat wordt aangeboden, zodat niemand ze
achteraf kan aflezen:

| Naam              | Waarde                                                        |
|-------------------|----------------------------------------------------------------|
| `ADMIN_USERNAME`  | `19252004`                                                     |
| `ADMIN_PASSWORD`  | `kain25`                                                       |
| `SESSION_SECRET`  | een lange willekeurige tekst, bijv. `xk3!9fQ2vLp8-mZ7RtY0`      |
| `GITHUB_TOKEN`    | de token die je in Stap 2 hebt gekopieerd                      |
| `GITHUB_OWNER`    | jouw GitHub-gebruikersnaam                                     |
| `GITHUB_REPO`     | `Wildcore-concept1`                                            |

`GITHUB_BRANCH` hoef je niet in te stellen — dan gebruikt de Worker
automatisch de standaardbranch van de repo (meestal `main`).

Sla op / deploy opnieuw als daarom gevraagd wordt.

## Stap 5 — Koppel het inlogscherm aan de Worker

1. Open `admin/index.html` in de repo.
2. Zoek de regel:
   ```js
   const WORKER_URL = "https://REPLACE-WITH-YOUR-WORKER-URL.workers.dev";
   ```
3. Vervang de URL door de Worker-URL uit Stap 3, bijvoorbeeld:
   ```js
   const WORKER_URL = "https://wildcore-cms.jouwnaam.workers.dev";
   ```
4. Commit en push deze wijziging.

## Stap 6 — Testen

1. Wacht tot GitHub Pages klaar is met bouwen (bekijk de "Actions"-tab van de
   repo op GitHub, of wacht gewoon een minuut).
2. Ga naar `https://www.wildcoreretreats.com/admin/` (of jouw GitHub Pages-URL
   + `/admin/`).
3. Log in met gebruikersnaam `19252004` en wachtwoord `kain25`.
4. Wijzig een tekst, bijvoorbeeld de hero-titel, en klik **Publiceren**.
5. Wacht ongeveer een minuut en ververs de live site — de wijziging moet
   zichtbaar zijn.
6. Probeer ook een foto te vervangen, om te controleren dat dat werkt.

## Problemen oplossen

- **"De CMS-backend is nog niet gekoppeld"** — je hebt Stap 5 nog niet gedaan,
  of de wijziging is nog niet gepusht/live.
- **"Onjuiste gebruikersnaam of wachtwoord"** — controleer dat `ADMIN_USERNAME`
  en `ADMIN_PASSWORD` in de Worker-instellingen exact `19252004` en `kain25`
  zijn (geen spaties).
- **"De Worker is nog niet volledig geconfigureerd"** — een van de secrets in
  Stap 4 ontbreekt nog.
- **"GitHub gaf fout 401/403"** — de token is verlopen, ingetrokken, of mist
  schrijfrechten. Maak een nieuwe token aan (Stap 2) en werk `GITHUB_TOKEN` bij.
- **"GitHub gaf fout 404"** — controleer `GITHUB_OWNER` en `GITHUB_REPO` op
  typefouten.
- **Wijziging lijkt niet live te staan** — GitHub Pages heeft soms tot enkele
  minuten nodig; check de "Actions"-tab van de repo op GitHub om te zien of de
  build nog bezig is.

## Beveiliging — goed om te weten

- Dit is een eenvoudig, doelgericht systeem: één vaste gebruikersnaam/wachtwoord
  voor de klant, geen aparte gebruikersaccounts.
- Een sessie (na inloggen) is 4 uur geldig; daarna moet opnieuw ingelogd
  worden.
- Deel de GitHub-token en de Worker-secrets nooit met de klant — die zijn
  alleen voor jou als ontwikkelaar om het systeem in te stellen.
- Wil je op enig moment de toegang volledig intrekken: verwijder de
  `GITHUB_TOKEN` uit de Worker-instellingen, of trek de token in bij GitHub
  zelf in.
