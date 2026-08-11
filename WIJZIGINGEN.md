# Wildcore Retreats — wijzigingslogboek

**Datum:** 11 augustus 2026
**Project:** `Wildcore-concept1`
**Talen:** alle wijzigingen zijn doorgevoerd in Nederlands, Engels én Spaans

**Aangepaste bestanden**

| Bestand | Rol |
|---|---|
| `index.html` | Nederlandse pagina (incl. fallbacktekst + schema.org-data) |
| `en/index.html` | Engelse pagina |
| `es/index.html` | Spaanse pagina |
| `content-nl.json` | CMS-teksten NL |
| `content-en.json` | CMS-teksten EN |
| `content-es.json` | CMS-teksten ES |

---

## 1. Tekstwijzigingen

### Waarom Wildcore — trailrun of hike

Vervangen: de keuze is niet meer per route, maar per weekend.

> Trailrun of hike? De keuze is aan jou. **Je kiest vooraf voor een trailrunweekend óf een hikeweekend. Zo beleef je het hele weekend met een groep die hetzelfde tempo en dezelfde activiteit deelt.** Of je nu graag hardloopt of liever wandelend van de natuur geniet, de beleving staat altijd centraal. We blijven als groep bij elkaar.

### Voor wie is dit weekend? — conditie-eis

Onderscheid gemaakt tussen trailrunners en hikers.

> We vragen **trailrunners** daarom om minimaal anderhalf uur rustig te kunnen hardlopen **en hikers om minimaal drie uur op heuvelachtig terrein te kunnen wandelen.**

Dezelfde zin is ook toegevoegd aan het FAQ-antwoord "Voor wie is dit weekend?" — en aan de verborgen schema.org-versie daarvan, zodat Google dezelfde tekst ziet.

### Een villa met zwembad

Alinea over de omgeving toegevoegd.

> … uitzicht op de bergen. **De wijk zelf ligt een half uurtje landinwaarts ten opzichte van Valencia en wordt omringd door sinaasappelboomgaarden met in het voorjaar de heerlijk geurende bloesem en later in het jaar de oranje sinaasappels.** De perfecte plek om na een dag op de trails helemaal tot rust te komen.

### Sport, rust & gezelligheid

> **Na de trails:** goed eten, goede gesprekken, en tijd om gezellig samen te zijn. **Uiteraard is dit vrijblijvend. Heb je eenmaal weer terug bij de villa juist behoefte aan wat tijd alleen, voel je dan vrij om wat voor jezelf te doen. Voor beide is alle ruimte.**

### In beeld

"een villa met uitzicht **over de vallei**" → "een villa met uitzicht **op de bergen**".

### Over je gastheer

"ik woon **een groot deel** van het jaar" → "ik woon **een deel** van het jaar".

---

## 2. Programma (vrijdag)

| Wat | Was | Is |
|---|---|---|
| Naam van de dag | Casinos Sunset Loop | **Casinos Discovery Loop** |
| Dagomschrijving | "Een zachte start … terwijl de zon ondergaat over de vallei" | "Een ontspannen start. We verkennen de paden rond Casinos en maken kennis met het terrein…" |
| Nieuw programmapunt | — | **13:00 Pick-up luchthaven Valencia** |
| Welkomstblok | "rustig kunt inchecken en je kamer kunt uitzoeken" | "waar je je rustig kunt installeren" |
| Welkomstblok | "geniet van een kop koffie" | "geniet van een **lichte lunch**" |
| Middagactiviteit | 18:00 Sunset Trail | **16:00 Discovery Trail** |
| Zondag, afsluiting | Afscheid | **Afscheid en luchthaventransfer** |

Het nieuwe punt van 13:00 legt uit dat je een vlucht kunt kiezen die rond 13:00 landt, dat eerder aankomen of een dag eerder komen mag, en dat de reis officieel start met de gezamenlijke transfer.

De programmapunten zijn opnieuw genummerd (`schedule.0` → `1`, enzovoort), zodat de CMS-keys blijven kloppen.

---

## 3. Prijzen — inbegrepen

| Was | Is |
|---|---|
| Ontbijt, lunch & **2** gezamenlijke diners | Ontbijt, lunch & gezamenlijke diners |
| Luchthaventransfer **v.a.** Valencia Airport | Luchthaventransfer **van en naar** Valencia Airport |

---

## 4. FAQ

### Wat is er inbegrepen?

> Verblijf in de villa, **2x ontbijt, 3x lunch en 2x diner, koffie, thee en water,** luchthavenvervoer **van en naar** Valencia Airport, transfers en begeleiding tijdens alle trails of hikes.

De schema.org-variant van dit antwoord liep achter (stond nog op "2 of 3 gezamenlijke diners") en is gelijkgetrokken.

### Verzekeringen — volledig herschreven

Opgesplitst in vier losse CMS-velden (`a`, `a2`, `a3`, `tip`):

1. Geldige basisreisverzekering is verplicht; zelf controleren of bergwandelingen en bergtochten gedekt zijn.
2. Bagage-, annulerings- en overige verzekeringen zijn niet verplicht.
3. Graag vóór aanvang een kopie van het polisblad.
4. **Tip** — bij twijfel contact opnemen met je verzekeraar.

De tip heeft een eigen opmaak gekregen: licht beige kader met een terracotta streep links.

### Annulering & wijzigingen

Nieuwe slottekst: geen restitutie bij voortijdige beëindiging, no-show **of het niet voldoen aan de verzekeringsplicht**; vervangende deelnemer tot **twee dagen** (was zeven dagen) vóór vertrek; annuleringsverzekering als optie in plaats van advies.

### Programma, annulering & wijzigingen

Kop hernoemd (was "Programma-wijzigingen") en uitgebreid naar vier alinea's (`a` t/m `a4`):

1. Aanpassingen door weer, bosbrandgevaar, regelgeving of veiligheid.
2. Volledige terugbetaling bij annulering door de organisatie; vervoer naar Valencia valt buiten de reissom — advies om een flexibel ticket te boeken.
3. Vluchtannuleringen en vertragingen vallen buiten de verantwoordelijkheid; bij vertraagde aankomst wordt alsnog een transfer geregeld.
4. Uiterlijk vier weken vóór vertrek duidelijkheid over doorgang; minimum van vier deelnemers.

---

## 5. Nieuwe sectie: Data

Nieuwe sectie **Data** tussen Prijzen en Praktisch, met een extra link in de navigatie.

**De vier weekenden**

| Type | Datum |
|---|---|
| Trailrun | 6, 7, 8 november 2026 |
| Hike | 11, 12, 13 december 2026 |
| Trailrun | 29, 30, 31 januari 2027 |
| Hike | 5, 6, 7 maart 2027 |

**Wat het doet**

- Vier kaarten met type, maand, datum, weekdagen en beschikbaarheidsstatus.
- Knop "Vraag deze datum aan" → scrollt naar het aanvraagformulier, zet "Gewenst weekend" al op die datum en plaatst de cursor in het naamveld.
- De dropdown in het formulier bevat nu de vier concrete data in plaats van "Trail (vr–zo) — €495 p.p.".
- **Automatisch verlopen:** zodra een weekend voorbij is, wordt de kaart grijs, verandert de status in "Afgelopen", wordt de knop uitgeschakeld en verdwijnt die optie uit de dropdown. Getest met een gesimuleerde datum van 1 december 2026.
- Responsive: vier kolommen op desktop, twee op tablet, één op mobiel.

**Onderhoud**

- Teksten, data en status staan als `dates`-blok in de content-JSON's en zijn via het CMS aanpasbaar (bijvoorbeeld "Plekken beschikbaar" → "Vol").
- De datumgrens voor "Afgelopen" staat als `data-date` in de HTML.
- Nieuwe editie toevoegen: kaart kopiëren en `data-edition`, `data-date` en de teksten aanpassen.

---

## 6. Algemene voorwaarden — volledig vervangen

Vervangen door de 14 artikelen uit `Algemene Voorwaarden Wildcore Retreats.pdf` (de oude versie had er 12).

| # | Artikel |
|---|---|
| 1 | Toepasselijkheid |
| 2 | Deelname |
| 3 | Boeking en betaling |
| 4 | Annulering door de deelnemer |
| 5 | Annulering door de organisator |
| 6 | Programmawijzigingen |
| 7 | Vluchten en vervoer *(nieuw)* |
| 8 | Risico en aansprakelijkheid |
| 9 | Verzekeringen |
| 10 | Gedrag en veiligheid |
| 11 | Beeldmateriaal |
| 12 | Persoonsgegevens |
| 13 | Overmacht |
| 14 | Toepasselijk recht en geschillen *(nieuw)* |

- Opsommingen staan nu als echte bullet lists (41 punten), elk als eigen CMS-veld.
- De nummering loopt gelijk aan de PDF.
- Hiermee zijn de laatste inconsistenties weg: overal twee dagen voor een vervangende deelnemer, verplichte reisverzekering, en het minimum van vier deelnemers.

---

## 7. Controle

- Alle drie de content-JSON's zijn na elke wijziging gevalideerd.
- De pagina is in een echte browser gerenderd (desktop 1280px en mobiel 390px) — geen JavaScript-fouten.
- Getest: klikken op een datumkaart selecteert de juiste optie in het formulier.
- Getest: verlopen datums worden correct grijs en uit de dropdown gehaald.
- Getest: alle 14 artikelen en 41 opsommingspunten renderen correct.

---

## 8. Nog open

- **Contactblok onderaan** zegt nog "Luchthavenvervoer inbegrepen v.a. Valencia Airport" — elders staat inmiddels "van en naar".
- **`wildcore-route.js`** bevat een interne opmerking `/* vrijdag — Casinos Sunset Loop */` (niet zichtbaar op de site).
- **Beschrijving van de Discovery Trail** verwijst nog naar de sfeer van de oude Sunset Trail ("alle tijd voor de eerste uitzichten").
- **Cache:** na het uploaden een harde herlaad doen (Cmd + Shift + R) om de nieuwe versie te zien.
