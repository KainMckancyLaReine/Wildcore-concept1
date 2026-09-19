import json, os, html, sys, importlib
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://wildcore-retreats.nl'
from pages_nl1 import PAGES as P1
from pages_nl2 import PAGES as P2
from pages_en import PAGES as P3
PAGES = P1 + P2 + P3
BY = {p['slug']: p for p in PAGES}

DATES = {
 'nl': [('Trailrun','6 – 8 november 2026','€495 p.p.','Introductieprijs'),
        ('Hike','11 – 13 december 2026','€595 p.p.',''),
        ('Trailrun','29 – 31 januari 2027','€595 p.p.',''),
        ('Hike','5 – 7 maart 2027','€595 p.p.','')],
 'en': [('Trail run','6 – 8 November 2026','€495 pp','Launch price'),
        ('Hike','11 – 13 December 2026','€595 pp',''),
        ('Trail run','29 – 31 January 2027','€595 pp',''),
        ('Hike','5 – 7 March 2027','€595 pp','')],
}
ROUTES = {
 'nl': [('Vrijdag','Casinos Discovery Loop','8 km','±180 hm','Rustige kennismaking met de paden rond Casinos, door dennenbos en over glooiende bergpaden.'),
        ('Zaterdag','Serra Calderona Grand Loop','20–23 km','±850 hm','Het hoogtepunt: een lange dag door de Sierra Calderona, langs uitzichtpunten, met lunch onderweg in de natuur.'),
        ('Zondag','Rebalsadors Recovery Loop','13–15 km','±500 hm','Rustiger afsluiter langs kloven en watervallen, daarna lunch op het terras en de transfer naar het vliegveld.')],
 'en': [('Friday','Casinos Discovery Loop','8 km','±180 m gain','An easy first loop on the trails around Casinos, through pine forest and rolling mountain paths.'),
        ('Saturday','Serra Calderona Grand Loop','20–23 km','±850 m gain','The big day: a long route through the Sierra Calderona past viewpoints, with lunch out in nature.'),
        ('Sunday','Rebalsadors Recovery Loop','13–15 km','±500 m gain','A gentler finish past gorges and waterfalls, then lunch on the terrace and the airport transfer.')],
}
T = {
 'nl': dict(home='Home', book='Boek nu', weekend='Het weekend', dates='Data & prijzen', datesH='Komende weekenden', faqH='Veelgestelde vragen', relH='Lees ook',
            ctaH='Klaar om de bergen in te gaan?', ctaP='Maximaal zes deelnemers per weekend. Stuur een bericht en je hoort snel van ons.', ctaB='Vraag jouw plek aan', ctaB2='Bekijk het volledige programma',
            routesH='De drie routes van het weekend', skip='Direct naar de inhoud', rights='Alle rechten voorbehouden.', terms='Algemene voorwaarden', explore='Ontdek', avail='Plekken beschikbaar', locale='nl_NL', langname='Nederlands'),
 'en': dict(home='Home', book='Book now', weekend='The weekend', dates='Dates & prices', datesH='Upcoming weekends', faqH='Frequently asked questions', relH='Read more',
            ctaH='Ready to head into the mountains?', ctaP='A maximum of six participants per weekend. Send us a message and we will get back to you soon.', ctaB='Request your spot', ctaB2='See the full programme',
            routesH='The three routes of the weekend', skip='Skip to content', rights='All rights reserved.', terms='Terms & conditions', explore='Explore', avail='Spots available', locale='en_US', langname='English'),
}
def home(lang): return '/' if lang=='nl' else '/en/'
def url(p): return f"{BASE}/{p['slug']}/"
def esc(s): return html.escape(s, quote=True)

def block(b, lang):
    k = b[0]
    if k=='h2': return f'<h2>{b[1]}</h2>'
    if k=='h3': return f'<h3>{b[1]}</h3>'
    if k=='p': return f'<p>{b[1]}</p>'
    if k=='ul': return '<ul>'+''.join(f'<li>{x}</li>' for x in b[1])+'</ul>'
    if k=='img': return f'<figure><img src="/images/{b[1]}" alt="{esc(b[2])}" loading="lazy" decoding="async" width="1200" height="800"><figcaption>{b[3]}</figcaption></figure>'
    if k=='routes':
        rows=''.join(f'<div class="g-route"><span class="g-day">{d}</span><h3>{n}</h3><p class="g-stats">{km} · {hm}</p><p>{t}</p></div>' for d,n,km,hm,t in ROUTES[lang])
        note = f'<p class="g-note">{b[1]}</p>' if len(b)>1 and b[1] else ''
        return f'<section class="g-routes" aria-label="{T[lang]["routesH"]}"><h2>{T[lang]["routesH"]}</h2><div class="g-route-grid">{rows}</div>{note}</section>'
    if k=='dates':
        f = b[1]
        items=[d for d in DATES[lang] if not f or d[0]==f]
        li=''.join(f'<li><span class="g-type">{t}</span><strong>{d}</strong><span>{pr}{" · "+tag if tag else ""}</span><a href="{home(lang)}#contact">{T[lang]["ctaB"]} →</a></li>' for t,d,pr,tag in items)
        return f'<section class="g-dates"><h2>{T[lang]["datesH"]}</h2><ul>{li}</ul></section>'
    if k=='facts':
        return '<div class="g-facts">'+''.join(f'<div><strong>{a}</strong><span>{c}</span></div>' for a,c in b[1])+'</div>'
    raise ValueError(k)

def strip_tags(s):
    import re; return re.sub(r'<[^>]+>','',s)

def render(p):
    lang=p['lang']; t=T[lang]; u=url(p); h=home(lang)
    crumbs=[(t['home'], BASE+h), (p['crumb'], u)]
    ld={"@context":"https://schema.org","@graph":[
        {"@type":"WebPage","@id":u+"#webpage","url":u,"name":p['title'],"description":p['desc'],"inLanguage":lang,
         "isPartOf":{"@id":BASE+"/#website"},"about":{"@id":BASE+"/#trip"},"publisher":{"@id":BASE+"/#organization"},
         "primaryImageOfPage":{"@type":"ImageObject","url":f"{BASE}/images/{p['hero']}"},"breadcrumb":{"@id":u+"#breadcrumb"}},
        {"@type":"BreadcrumbList","@id":u+"#breadcrumb","itemListElement":[{"@type":"ListItem","position":i+1,"name":n,"item":l} for i,(n,l) in enumerate(crumbs)]},
        {"@type":"FAQPage","@id":u+"#faq","inLanguage":lang,"mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":strip_tags(a)}} for q,a in p['faq']]}
    ]}
    body=''.join(block(b,lang) for b in p['body'])
    faq=''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q,a in p['faq'])
    rel=''.join(f'<a class="g-card" href="/{BY[s]["slug"]}/"><strong>{BY[s]["crumb"]}</strong><span>{BY[s]["teaser"]}</span></a>' for s in p['related'])
    same=[x for x in PAGES if x['lang']==lang]
    foot=''.join(f'<a href="/{x["slug"]}/">{x["crumb"]}</a>' for x in same)
    alt_links=''
    if p.get('alt'):
        for l,s in p['alt'].items(): alt_links+=f'<link rel="alternate" hreflang="{l}" href="{BASE}/{s}/">\n'
        alt_links+=f'<link rel="alternate" hreflang="{lang}" href="{u}">\n'
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(p['title'])}</title>
<meta name="description" content="{esc(p['desc'])}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#3f4a34">
<link rel="canonical" href="{u}">
{alt_links}<meta property="og:type" content="article">
<meta property="og:site_name" content="Wildcore Retreats">
<meta property="og:locale" content="{t['locale']}">
<meta property="og:title" content="{esc(p['title'])}">
<meta property="og:description" content="{esc(p['desc'])}">
<meta property="og:url" content="{u}">
<meta property="og:image" content="{BASE}/images/{p['hero']}">
<meta property="og:image:alt" content="{esc(p['hero_alt'])}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/images/logo.png" type="image/png">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&amp;family=Work+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/gids.css">
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=1)}
</script>
</head>
<body>
<a class="skip-link" href="#inhoud">{t['skip']}</a>
<header class="g-nav"><div class="g-nav-inner">
  <a href="{h}" class="g-brand"><img src="/images/logo-mark.png" alt="Wildcore Retreats logo" width="40" height="40"><span>WILDCORE</span></a>
  <nav class="g-links"><a href="{h}#programma">{t['weekend']}</a><a href="{h}#data">{t['dates']}</a></nav>
  <a class="g-book" href="{h}#contact">{t['book']}</a>
</div></header>
<main id="inhoud">
<section class="g-hero" style="background-image:linear-gradient(180deg,rgba(30,34,24,.35),rgba(30,34,24,.75)),url('/images/{p['hero']}')">
  <div class="g-wrap">
    <nav class="g-crumbs" aria-label="Breadcrumb"><a href="{h}">{t['home']}</a> <span>›</span> <span>{p['crumb']}</span></nav>
    <p class="g-eyebrow">{p['eyebrow']}</p>
    <h1>{p['h1']}</h1>
    <p class="g-lead">{p['lead']}</p>
    <div class="g-btns"><a class="g-btn g-btn-primary" href="{h}#data">{t['dates']}</a><a class="g-btn g-btn-ghost" href="{h}#programma">{t['ctaB2']}</a></div>
  </div>
</section>
<article class="g-wrap g-body">
{body}
</article>
<section class="g-wrap g-faq" id="faq"><h2>{t['faqH']}</h2>{faq}</section>
<section class="g-wrap g-related"><h2>{t['relH']}</h2><div class="g-cards">{rel}</div></section>
<section class="g-cta"><div class="g-wrap"><h2>{t['ctaH']}</h2><p>{t['ctaP']}</p><a class="g-btn g-btn-primary" href="{h}#contact">{t['ctaB']}</a></div></section>
</main>
<footer class="g-foot"><div class="g-wrap">
  <div class="g-foot-top"><a href="{h}" class="g-brand"><img src="/images/logo-mark.png" alt="" width="40" height="40"><span>WILDCORE RETREATS</span></a>
  <nav aria-label="{t['explore']}"><a href="{h}">{t['weekend']}</a>{foot}</nav></div>
  <div class="g-foot-bottom"><span>© 2026 Wildcore Retreats. {t['rights']}</span><span>KvK 42138562</span><a href="{h}#praktisch">{t['terms']}</a></div>
</div></footer>
</body>
</html>
'''

if __name__=='__main__':
    for p in PAGES:
        d=os.path.join(ROOT,p['slug']); os.makedirs(d,exist_ok=True)
        open(os.path.join(d,'index.html'),'w').write(render(p))
        words=len(strip_tags(' '.join(str(b[1]) for b in p['body'] if b[0] in('p','ul','h2'))+' '.join(q+a for q,a in p['faq'])).split())
        print('wrote',p['slug'],len(p['title']),'chars title,',len(p['desc']),'desc,',words,'words')
