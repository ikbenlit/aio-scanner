# Brainstorm & Blauwdruk: AIO Scan Resultaten Dashboard

**Datum:** 17 Juli 2024
**Status:** Definitieve Blauwdruk

## 1. Probleemanalyse & Doelstelling

De huidige weergave van de scanresultaten is verwarrend en niet actiegericht genoeg. Gebruikers worstelen met:
- **Onduidelijke Terminologie:** Wat betekenen scores op een schaal van 100? Wat is "Vindbaarheid" of "Conversiepotentieel"?
- **Gebrek aan Context:** Bevindingen zijn niet concreet genoeg (bv. "9 elementen gevonden" - welke elementen?).
- **Dubbele Informatie:** Meerdere "Quick Wins" secties zonder duidelijke hiërarchie.
- **Verwarrende Visualisaties:** De prioriteitenmatrix is niet intuïtief.

**Hoofddoel:** Een nieuw dashboard ontwerpen dat zowel voor een beginnende ondernemer als voor een technische SEO-expert helder, inzichtelijk en actiegericht is. De pagina moet aanvoelen als een **persoonlijke adviseur** die de data vertaalt naar een concreet, geprioriteerd verbeterplan.

## 2. De Persona's

Twee persona's dienen als de toetssteen voor alle ontwerpkeuzes:

### Persona 1: Marlies Mulder (Eigenaar "Mulder Mokka")
- **Niveau:** Laag-technisch.
- **Doel:** Eenvoudige, concrete actiepunten die ze zelf in WordPress kan uitvoeren om haar online zichtbaarheid in AI te vergroten.
- **Behoefte:** Een helder overzicht, duidelijke taal, "Quick Wins", en een motiverend gevoel van voortgang.

### Persona 2: Sven de Jong (SEO & Content Lead "CloudCraft")
- **Niveau:** Hoog-technisch.
- **Doel:** Diepgaande, data-gedreven inzichten om de website "LLM-ready" te maken en resultaten te rapporteren aan het management.
- **Behoefte:** Gedetailleerde metrics, robuuste filter- en sorteeropties (Impact vs. Effort), en exportmogelijkheden naar Jira/Notion.

## 3. De Definitieve Blauwdruk: Het Gelaagde Dashboard met "Spotlight-Focus"

Na een iteratief proces (van statisch dashboard naar een context-gedreven model) is dit het finale concept. Het model bestaat uit drie niveaus van informatiediepte.

### Niveau 1: De Permanente Header (Het Ankerpunt)

Dit blok staat altijd bovenaan de pagina en biedt het algemene overzicht.
- **Totaalscore:** Een grote, visuele progressiecirkel.
- **Visuele Context:** Een screenshot van de gescande webpagina.
- **Beschrijving:** Een korte, feitelijke beschrijving van de website.
- **Managementsamenvatting:** Een door AI gegenereerde, 1-3 zinnen tellende samenvatting van de algehele status.
- **Scope & Waarde:** Een compacte checklist met de titel "Wat we geanalyseerd hebben", die de uitgevoerde modules toont (Technische SEO, AI Content, etc.) om vertrouwen en waarde te communiceren.

### Niveau 2: Het Interactieve Dashboard (De Controlekamer)

Direct onder de header, dit is het dynamische hart van de interface.
- **Controlepaneel:** Vier prominente categoriekaarten (`Vindbaarheid`, `Vertrouwen & Autoriteit`, `Conversiepotentieel`, `Actualiteit`). Deze kaarten tonen een totaalscore (0-100) en een kleurcode (rood/oranje/groen) en functioneren als de **hoofdfilters** voor de content eronder.
- **Content Grid:** Een vast grid van kaarten waarvan de inhoud dynamisch verandert op basis van de geselecteerde categorie in het Controlepaneel.
    - **Kaart A: AI-Analyse & Highlights:** Toont een specifieke AI-samenvatting en de belangrijkste bevindingen voor de geselecteerde categorie.
    - **Kaart B: Top Actiepunten:** Toont de Top 3 actiepunten, specifiek voor de geselecteerde categorie.
    - **Kaart C: Visuele Data:** Toont een relevante grafiek (staaf, donut) die data voor de geselecteerde categorie visualiseert.

### Niveau 3: De Spotlight-Focus (De Lees- & Werkmodus)

Dit niveau wordt geactiveerd wanneer de gebruiker dieper in de details wil duiken.
- **Activering:** Elke kaart in het Content Grid (Niveau 2) heeft een "vergroot" of "focus" icoon (↗️).
- **Functionaliteit:** Bij een klik wordt het achterliggende dashboard gedimd en verschijnt een **grote, beeldvullende modal/pop-up** met de volledige details van de aangeklikte kaart. Deze detailweergave is gestructureerd voor maximale duidelijkheid:
    - **Heldere Structuur:** Gebruikt expliciete, vraaggestuurde koppen:
        - **"Waarom is dit belangrijk?"**: Een uitleg in duidelijke taal, gericht op het bedrijfseffect (klanten, ranking, vertrouwen).
        - **"Hoe los je dit op?"**: Concrete, stapsgewijze instructies.
    - **Visuele Voorbeelden:** Waar relevant wordt een **"Voor/Na"-blok** getoond, dat de huidige code/tekst vergelijkt met de aanbevolen situatie. Dit kan aangevuld worden met een **Google SERP preview**.
    - **Complete Data (voor experts):** Bevat de volledige, filterbare tabel met alle bevindingen (voor Sven), inclusief technische `evidence` en `export`-knoppen.
- **Terugkeren:** Een duidelijke sluitknop (`X`) brengt de gebruiker terug naar het interactieve dashboard.

## 4. Hoe dit model de problemen oplost

- **Duidelijkheid voor Marlies:** Ze kan op Niveau 1 en 2 blijven voor een helder, gefilterd overzicht en concrete, behapbare actiepunten.
- **Diepgang voor Sven:** Hij gebruikt Niveau 2 om zijn analyse te focussen en duikt via Niveau 3 direct in de volledige data, klaar voor technische analyse en export.
- **Geen Dubbele Content:** Informatie heeft een logische plek; de details zitten in de Spotlight-view.
- **Context is Koning:** De gebruiker weet altijd waar hij naar kijkt, dankzij de permanente header en het actieve filter in het controlepaneel.
- **Intuïtieve Prioritering:** De verwarrende matrix wordt vervangen door een duidelijke "Impact vs. Effort" aanduiding binnen de gedetailleerde weergave.
- **Verklarende Elementen:** Een `?`-icoon bij elke categorie legt in eenvoudige taal uit wat het betekent en waarom het belangrijk is.

Dit model vormt de basis voor de verdere ontwikkeling van het nieuwe resultaten-dashboard.

## 5. Interaction Design & Responsiviteit

Om de interface intuïtief en effectief te maken op alle apparaten, hanteren we de volgende ontwerpprincipes.

### Garanderen van Klikbaarheid (Affordance)

Het moet voor alle gebruikers direct duidelijk zijn welke elementen interactief zijn. Dit bereiken we met een drielaagse aanpak voor de categoriekaarten (Controlepaneel):

1.  **Hover-Status (Directe feedback):**
    - De muiscursor verandert in een 'handje' (`pointer`).
    - De kaart krijgt een subtiele visuele verandering (lichte schaalvergroting, diepere schaduw) om een 'opgetild' effect te geven.
2.  **Actieve Status (Contextuele hint):**
    - De geselecteerde categoriekaart heeft een significant afwijkende stijl (bv. een gekleurde rand of vollere achtergrond) die de actieve staat aangeeft.
3.  **Statisch Ontwerp (Permanente hint):**
    - De kaarten worden ontworpen met een lichte schaduw om ze te onderscheiden van de achtergrond, wat suggereert dat ze manipuleerbare elementen zijn.

### Animatie Filosofie

Animaties dienen de gebruikerservaring en moeten de interface sneller en duidelijker laten aanvoelen, niet vertragen.
- **Doelgericht:** Elke animatie heeft een functie (feedback, context, soepele overgang) en is nooit puur decoratief.
- **Snel & Subtiel:** Animatieduur moet kort zijn (ca. 150-200ms) om een 'snappy' en responsief gevoel te garanderen dat de workflow niet onderbreekt.

### Adaptief Interactiemodel (Desktop vs. Mobiel)

De actie om details te bekijken ("Spotlight-Focus") wordt verschillend geïmplementeerd op basis van de schermgrootte voor een optimale ervaring.

- **Trigger:** Een universeel en herkenbaar 'maximize'-icoon (`↗`) wordt gebruikt op elke content-kaart om de detailweergave te activeren.

- **Desktop (Grote Schermen) - "Spotlight-Focus":**
    - **Actie:** Bij een klik wordt het achterliggende dashboard gedimd en verschijnt er een grote, gecentreerde modal/pop-up.
    - **Reden:** Behoud van context. De gebruiker ziet dat hij nog steeds 'binnen' het hoofddashboard werkt.

- **Mobiel (Kleine Schermen) - "Drill-Down View":**
    - **Actie:** Bij een tik schuift een **volledig nieuw scherm** van rechts naar binnen, dat de gehele viewport vult. Een duidelijke `< Terug`-knop is aanwezig om terug te keren.
    - **Reden:** Optimaal gebruik van de beperkte schermruimte. Dit zorgt voor een rustige, gefocuste en goed leesbare weergave, conform standaard mobiele UX-patronen.

## 6. Look & Feel: Visuele Principes

De look and feel wordt niet bepaald door een enkele kleurkeuze, maar door de gedisciplineerde toepassing van fundamentele ontwerpprincipes. Het doel is een uitstraling die **Professioneel, Inzichtelijk en Bemoedigend** is.

### 1. Principe: Hoog Contrast & Duidelijkheid

De primaire focus ligt op de leesbaarheid en het direct laten opvallen van de belangrijkste data (scores, statussen, grafieken).

- **Methode:** Een rustige, neutrale achtergrond gebruiken en accentkleuren reserveren voor interactieve elementen en datavisualisaties. De semantische kleuren (groen voor succes, oranje voor matig, rood voor kritiek) moeten altijd een hoog contrast hebben met hun achtergrond.

- **Mogelijke Thema's:** De keuze voor een thema is een strategische/branding-keuze, niet primair een functionele.
    - **Smaak A: "Clean & Focused" (Licht Thema):**
        - **Achtergrond:** Zeer lichtgrijs (`#F7FAFC`) voor een open en luchtige uitstraling.
        - **Kaarten:** Spierwit (`#FFFFFF`) met een subtiele, zachte schaduw om hiërarchie te creëren.
        - **Tekst:** Donkergrijs (geen puur zwart) voor optimale leesbaarheid.
        - **Voordeel:** Standaard voor veel SaaS-applicaties, voelt benaderbaar en helder.
    - **Smaak B: "Data-Focused" (Donker Thema):**
        - **Achtergrond:** Diep, donkergrijs of -blauw (`#1A202C`).
        - **Kaarten:** Iets lichtere tint donkergrijs (`#2D3748`).
        - **Tekst:** Lichtgrijs.
        - **Voordeel:** Voelt premium, laat datavisualisaties eruit springen en is rustiger voor de ogen bij langdurig gebruik.

### 2. Principe: Typografische Hiërarchie

Een consistente typografische schaal is essentieel voor een professionele en makkelijk scanbare interface.

- **Lettertype:** Een modern, strak, sans-serif lettertype (bv. `Inter`, `system-ui`) voor maximale leesbaarheid op schermen.
- **Gewicht & Grootte:** Consequent gebruik van verschillende groottes en diktes om een duidelijke visuele rangorde aan te brengen tussen titels, subtitels, paragrafen en grote datapunten (zoals scores).

### 3. Principe: Consistente Ruimte, Vorm & Iconografie

De algehele compositie bepaalt hoe georganiseerd en "ademend" de interface aanvoelt.

- **Whitespace (Witruimte):** Royaal en consistent toepassen van marges en witruimte om een rustige, overzichtelijke lay-out te garanderen en de gebruiker te helpen focussen.
- **Vorm:** Subtiel afgeronde hoeken op kaarten en knoppen voor een moderne, zachtere en meer benaderbare uitstraling.
- **Iconografie:** Gebruik van één enkele, consistente set van lichtgewicht lijn-iconen (outline-stijl) om de interface te ondersteunen zonder visuele ruis toe te voegen.

## 7. Ontwikkeling & Kwaliteitsborging

### 7.1 Toegankelijkheid (Accessibility)

Toegankelijkheid is een kernvereiste. Alle interactieve elementen moeten volledig toetsenbord-navigeerbaar zijn en correct worden aangekondigd door screenreaders.
- Alle interactieve elementen krijgen een duidelijke `:focus-visible` outline.
- Knoppen en interactieve kaarten krijgen de juiste `role` en `aria`-attributen (bv. `aria-pressed` voor een opgeloste status).
- Overlays/modals kunnen worden gesloten met de `Esc`-toets.

### 7.2 Documentatie & Feedback

Om het product continu te verbeteren, is het waardevol om een beknopt logboek van gebruikersfeedback bij te houden, vergelijkbaar met het `UX-results_improvement.md` document. Dit helpt om ontwerpbeslissingen te traceren en toekomstige iteraties te informeren.
