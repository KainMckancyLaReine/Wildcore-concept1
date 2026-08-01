#!/bin/bash
# ---------------------------------------------------------------
# Spreekt het videoscript in met de Nederlandse stem van je Mac.
# Uitvoeren: open Terminal en plak deze regel:
#
#   bash ~/Documents/GitHub/Wildcore-concept1/video/maak-stem.sh
#
# De audiobestanden komen in video/audio/ te staan.
# ---------------------------------------------------------------

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/audio"
mkdir -p "$OUT"

# --- Nederlandse stem kiezen -----------------------------------
VOICE=""
for v in Xander Claire Ellen; do
  if say -v '?' | grep -q "^$v "; then VOICE="$v"; break; fi
done

if [ -z "$VOICE" ]; then
  echo ""
  echo "  Geen Nederlandse stem gevonden op deze Mac."
  echo ""
  echo "  Installeer er een:"
  echo "    Systeeminstellingen  ->  Toegankelijkheid  ->  Gesproken materiaal"
  echo "    ->  Systeemstem  ->  Beheer stemmen  ->  Nederlands  ->  Xander"
  echo ""
  echo "  Draai daarna dit bestand opnieuw."
  echo ""
  exit 1
fi

echo "Stem: $VOICE"
echo "Map:  $OUT"
echo ""

TEMPO=170   # woorden per minuut; hoger is sneller

zeg () {  # zeg <nummer> <tekst>
  printf "  %s  " "$1"
  say -v "$VOICE" -r $TEMPO -o "$OUT/$1.aiff" "$2"
  echo "klaar"
}

zeg 01 "Dit is de nieuwe website van Wildcore Retreats. In een paar minuten laat ik je zien wat er allemaal op staat, en hoe je alle teksten en foto's zelf kunt aanpassen."
zeg 02 "Bovenaan land je meteen in de Sierra Calderona. De titel, de ondertitel en de vier korte punten eronder zijn allemaal aanpasbaar. Rechtsboven staat de boekknop, die op elk scherm zichtbaar blijft."
zeg 03 "Daaronder staat waar dit weekend echt over gaat: niet presteren, maar beleven. En de belangrijkste keuze voor je gast: iedere route kan gelopen of gewandeld worden."
zeg 04 "Vijf blokken vertellen om beurten voor wie het weekend bedoeld is, waar je slaapt en wat je onderweg tegenkomt. Beeld en tekst wisselen van kant, zodat het rustig blijft lezen."
zeg 05 "Bij In beeld staat een raster met de mooiste foto's. Klik op een foto en hij opent groot in beeld. Met de pijltjes blader je door alle twaalf, en op je telefoon kun je swipen."
zeg 06 "Het programma bestaat uit drie dagen met elk hun eigen route, afstand en hoogtemeters."
zeg 07 "Wil een gast precies weten hoe een dag eruitziet, dan klikt hij op Bekijk dagprogramma. Het volledige tijdschema opent midden in beeld, van aankomst tot het diner."
zeg 08 "Daarna volgt de villa, met de voorzieningen op een rij. En jouw eigen verhaal, zodat gasten weten bij wie ze terechtkomen."
zeg 09 "Bij de prijzen staat één helder bedrag met alles wat inbegrepen is. Daaronder kiest je gast tussen Trail en Hike. Alleen daar zit het verschil."
zeg 10 "Onder Praktisch staan de veelgestelde vragen en de volledige algemene voorwaarden. Alles klapt open en dicht, zodat de pagina overzichtelijk blijft."
zeg 11 "Onderaan kan je gast een bericht achterlaten. Dat komt rechtstreeks binnen op info apestaartje wildcore streepje retreats punt en el."
zeg 12 "De hele site bestaat in het Nederlands, Engels en Spaans. Bezoekers wisselen met het vlaggetje rechtsboven."
zeg 13 "En omdat de meeste mensen op hun telefoon kijken, past alles zich netjes aan. De boekknop blijft altijd binnen handbereik."
zeg 14 "Dan het belangrijkste: je kunt alles zelf wijzigen. Zet achter je websiteadres schuine streep admin schuine streep, en je komt op het inlogscherm."
zeg 15 "Vul je gebruikersnaam en wachtwoord in. Je blijft vier uur ingelogd."
zeg 16 "Wat je nu ziet is de hele website als invulformulier. De blokken staan in dezelfde volgorde als op de site: bovenaan de hero, dan de kenmerken, het programma, de villa, de prijzen, en onderaan de voorwaarden en je contactgegevens."
zeg 17 "Een tekst aanpassen is niet meer dan in het vakje klikken en typen. Korte teksten staan in een smal veld, langere in een groter tekstvak."
zeg 18 "Bovenin wissel je van taal. Let op: de drie talen staan los van elkaar. Pas je iets aan in het Nederlands, dan verandert er niets in het Engels of Spaans. Je kunt ze wel alle drie in één keer bijwerken."
zeg 19 "Helemaal onderaan staan alle foto's. Klik op Bestand kiezen, selecteer je nieuwe foto, en hij verschijnt meteen op dezelfde plek. Je hoeft niets voor te bereiden, de foto wordt automatisch verkleind."
zeg 20 "Niets is live totdat je op Publiceren klikt. Wacht daarna ongeveer een minuut, ververs de website, en je ziet je wijziging staan."
zeg 21 "Eén ding om te onthouden: het bewerkscherm bewaart niets tussentijds. Sluit je het tabblad zonder te publiceren, dan is je werk weg. Werk je aan veel tekst? Publiceer dan gerust tussendoor."
zeg 22 "Dat is het. Alles wat je op de website leest, kun je zelf aanpassen. In de handleiding staat per onderdeel precies waar welke tekst zit. Veel plezier met de nieuwe site."

echo ""
echo "Alle 22 fragmenten staan in: $OUT"
echo "Laat het weten, dan monteer ik ze onder de beelden."
echo ""
