# Wildcore Retreats — SEO herstel

## Wat er mis was (de oorzaak)

Je site staat live op **wildcore-retreats.nl**.
Maar élk SEO-signaal in je code wees naar **www.wildcoreretreats.com** — een domein dat
niet bestaat (geen DNS, nergens geregistreerd).

Concreet stond er op elke pagina:

```html
<link rel="canonical" href="https://www.wildcoreretreats.com/">
```

Een canonical zegt tegen Google: *"deze pagina is een kopie, het origineel staat daar."*
Google bezocht wildcore-retreats.nl, las dit, en concludeerde: niet indexeren, het
origineel staat op .com. Vervolgens probeerde Google die .com te bezoeken → bestaat niet.

**Resultaat: je site werd uit de index gehouden.** Daarom vind je hem niet, ook niet als
je letterlijk "wildcore" intypt. Dit stond op 105 plekken verspreid over je bestanden
(canonicals, hreflang, og:url, sitemap, robots.txt en alle schema.org-data).

---

## Wat ik heb aangepast

**Alle zichtbare teksten zijn 100% ongewijzigd** — geverifieerd met een tekst-diff:
23.768 tekens NL, 22.152 EN, 24.052 ES, allemaal identiek aan het origineel.

| # | Aanpassing | Bestanden |
|---|---|---|
| 1 | Alle 105 verwijzingen `www.wildcoreretreats.com` → `https://wildcore-retreats.nl` | index.html, en/, es/, sitemap.xml, robots.txt |
| 2 | Merknaam vooraan in de `<title>` — "Wildcore Retreats \| Trailrun- & hikeweekend Sierra Calderona" | alle 3 |
| 3 | `alternateName` toegevoegd aan schema: "Wildcore", "Wildcore Retreats Spanje", "Wildcore Trailrun Retreats" — hierdoor herkent Google ook losse zoektermen als jouw merk | alle 3 |
| 4 | Organization-type uitgebreid naar `Organization` + `TravelAgency` + `SportsActivityLocation` — geeft Google een veel duidelijker beeld van wát je bent | alle 3 |
| 5 | `contactPoint`, `geo`, `priceRange`, `slogan`, `knowsLanguage` toegevoegd aan schema | alle 3 |
| 6 | `BreadcrumbList` toegevoegd op /en/ en /es/ | en/, es/ |
| 7 | Dubbele `<meta name="keywords">` verwijderd (stond 2x per pagina) | alle 3 |
| 8 | Taalwissel-links naar `/`, `/en/`, `/es/` i.p.v. `index.html` — voorkomt dubbele URL's voor dezelfde pagina | alle 3 |
| 9 | `hreflang` op de taalwissel-links | alle 3 |
| 10 | robots.txt: juiste sitemap-URL, `/admin/` en `/cms-worker/` geblokkeerd | robots.txt |
| 11 | sitemap.xml: lastmod → 2026-08-20, changefreq → weekly | sitemap.xml |

---

## Wat JIJ nu moet doen (dit is het belangrijkste deel)

De code is gerepareerd, maar Google weet dat nog niet. Deze stappen zijn essentieel —
zonder stap 1 en 2 gebeurt er niks.

### 1. Upload de bestanden naar GitHub
Push de gewijzigde bestanden naar je repo (`kainmckancylareine.github.io`).
Wacht daarna 1–2 minuten tot GitHub Pages klaar is met deployen.

### 2. Google Search Console instellen — **verplicht**
Ga naar https://search.google.com/search-console

1. **Property toevoegen** → kies "Domein" → vul in: `wildcore-retreats.nl`
2. Verifieer via een **TXT-record** in je DNS (bij je domeinprovider)
3. Ga naar **Sitemaps** → voeg toe: `sitemap.xml` → Verzenden
4. Ga naar **URL-inspectie** → plak `https://wildcore-retreats.nl/` → klik **"Indexering aanvragen"**
5. Herhaal stap 4 voor `https://wildcore-retreats.nl/en/` en `https://wildcore-retreats.nl/es/`

> Zonder deze stap kan het maanden duren voordat Google je site opnieuw bekijkt.
> Mét deze stap: meestal **2 tot 10 dagen** voordat je op "wildcore retreats" verschijnt.

### 3. Bing Webmaster Tools (5 minuten, gratis extra bereik)
https://www.bing.com/webmasters — je kunt daar direct importeren vanuit Search Console.

### 4. Google Bedrijfsprofiel aanmaken
https://business.google.com — categorie "Reisbureau" of "Wandelgebied".
Dit is het **sterkste** signaal voor merknaam-zoekopdrachten. Google koppelt het profiel
aan je website en je krijgt kans op een knowledge panel rechts in beeld bij "wildcore retreats".

### 5. Social profielen aanmaken en aan mij doorgeven
Instagram, Facebook, eventueel Strava. Zodra je die hebt, laat het weten — dan zet ik ze
in de `sameAs` van je schema-data. Dat is na het bedrijfsprofiel het sterkste merksignaal
dat er is: het vertelt Google "deze website en dit Instagram-account zijn dezelfde entiteit".

### 6. Eerste externe links regelen
Google heeft minstens een paar verwijzingen van buitenaf nodig om je merk serieus te nemen:
- Trailrun-/hardloopforums en Facebook-groepen (NL + BE)
- Retreat-directories: BookRetreats, TripAdvisor, Wandelzoekpagina
- Instagram-bio, e-mailhandtekening, Strava-clubpagina

---

## Waarom je nu wél gevonden gaat worden op "wildcore"

Op een merknaam ranken is normaal gesproken makkelijk — er is geen concurrentie op het
woord "Wildcore Retreats". De enige reden dat het niet lukte, was dat je site technisch
uit de index werd gehouden door de foute canonical.

Dat is nu weg. Zodra Google de site opnieuw crawlt (stap 2) hoor je op #1 te staan voor:
- wildcore
- wildcore retreats
- wildcore retreats spanje
- wildcore trailrun

Voor de bredere termen ("trailrun weekend spanje", "hike retreat valencia") duurt het
langer — daar heb je de externe links uit stap 6 voor nodig.

---

## Controleren of het werkt

Na het uploaden:

```
site:wildcore-retreats.nl
```

Typ dit in Google. Zolang er 0 resultaten zijn, is de site nog niet geïndexeerd — geduld
hebben en zorgen dat stap 2 gedaan is. Verschijnen je 3 pagina's? Dan is het gelukt.

Je schema-data kun je testen op https://search.google.com/test/rich-results
(plak daar `https://wildcore-retreats.nl/` in) — ik heb de JSON-LD al lokaal gevalideerd,
alle 5 blokken zijn geldig.
