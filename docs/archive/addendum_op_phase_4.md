# 📬 Addendum op Phase 4 – Routing, Toegang & UX

> 🎯 **Doel van dit document:** Dit document biedt aanvullende richtlijnen en technische concepten ter voorbereiding op Phase 4 van het AIO Scanner-project. Het bevat een statusoverzicht van cruciale routes, toegangsflows en UX-patronen. Waar nodig zijn voorbeelden en codefragmenten toegevoegd om de implementatie door een developer of AI-agent te vergemakkelijken.

---

## 📊 Statusoverzicht – Routes, Toegang en Frontendvoorbereiding

| Onderdeel                     | Beschrijving                          | Status      |
| ----------------------------- | ------------------------------------- | ----------- |
| `/scan/basic?url=...`         | Uitlegpagina met startknop            | Vereist     |
| `/pricing` pagina             | Nieuwe of herstelde tierweergave      | Vereist     |
| Pricing-tabel op landingpage  | Synchroniseren met `/pricing`         | Vereist     |
| Resultpagina fallback         | UX bij foutieve/ontbrekende token     | Vereist     |
| Tier-structuur & CTA’s        | Consistente benamingen en knoppen     | Vereist     |
| 404 / error routes            | UX fallback bij scan of routingfouten | Aanraden    |
| `/checkout/success`           | Redirect na betaling                  | Controleren |
| `/checkout/failed`            | Mislukte betaling                     | Toevoegen   |
| `/scan/[scanId]/loading`      | Progress-pagina met polling           | Verfijnen   |
| `/scan/[scanId]/error`        | Scan kon niet worden uitgevoerd       | Toevoegen   |
| `/scan-invalid`               | Ongeldig scanId/token                 | Toevoegen   |
| `/scan/[scanId]/claim`        | Hersteltoegang via e-mail             | Post-MVP    |
| `/scan/[scanId]/download`     | Veilige PDF-downloadroute             | Post-MVP    |
| Bevestigingsmail & resultmail | E-mails rond scanproces               | Aanraden    |
| Access-token validatie        | Token als toegangssleutel             | Post-MVP    |
| User dashboard                | Historie op basis van e-mail          | Post-MVP    |
| Admin interface               | Monitoring & inzicht backend          | Post-MVP    |
| FAQ / Over-ons / T&C          | AI-discovery en vertrouwen            | Post-MVP    |

---

## ✅ Voorafgaand aan Phase-4 – Fundering voor frontend enhancement

Deze onderdelen vormen de functionele en UX-basis waarop Phase 4 voortbouwt. Voeg waar mogelijk onderstaande design hints toe bij het opzetten van componentstructuur en pagina-opbouw: Onderstaande instructies zijn bedoeld voor developers of AI-agents die de bijbehorende routes en logica moeten implementeren:

- `/scan/basic?url=...` uitlegpagina met duidelijke instructies

- Correcte tierstructuur en duidelijke CTA-knoppen per tier (bv. "Start gratis scan", "Bekijk rapport", "Vraag offerte")

- Fallbackmechanisme op resultpagina's: als token ongeldig of ontbreekt, toon begeleidende boodschap

- Nieuwe `/pricing` pagina waarin de actuele features per tier duidelijk uitgelegd worden

- Update van de pricingtabel op de landingpagina zodat deze synchroon loopt met de pricingpagina

- UX-copy op resultpagina's die uitlegt waarom een scan privé is of hoe iemand opnieuw toegang kan aanvragen

- ``** uitlegpagina**:

  - Gebruik als fallback-route wanneer iemand via een gedeelde link of directe input binnenkomt.
  - Bevat uitleg over de gratis scan, een visuele weergave van de ingevoerde URL, en een duidelijke knop “Start scan”.

- **Tierstructuur + CTA’s**:

  - Zet alle tierdata in een centrale JSON of config:

  ```ts
  const tiers = {
    basic: { label: 'Gratis', cta: 'Start scan' },
    starter: { label: 'Starter', cta: 'Bekijk rapport' }
  }
  ```

  - Genereer CTA-knoppen op basis van tierdata.

- **Result fallback**:

  - Controleer token bij toegang tot resultpagina.

  ```ts
  if (!token || !validate(token)) {
    return showPrivateFallback()
  }
  ```

- **Nieuwe **``** pagina**:

  - Gebruik componenten met props zoals `<PricingTable :tiers="tiers" />` en toon actuele features per tier.

- **Landingpage pricingtabel**:

  - Hergebruik of importeer dezelfde tierdata als in `/pricing`, of link het via een CMS/config bestand.

- **UX-copy “scan is privé”**:

  - Toon duidelijke feedback met instructie, zoals:

  > "Deze scan is alleen beschikbaar voor de eigenaar. Voer je e-mailadres in om toegang op te vragen."

- **Design hints per pagina/component**:

  | Pagina / Route        | Componenten                          | Layoutsuggestie                         |
  | --------------------- | ------------------------------------ | --------------------------------------- |
  | `/scan/basic?url=...` | `ScanExplanation`, `ScanStartButton` | Centered box met info en call-to-action |
  | `/pricing`            | `PricingTable`, `TierCard`           | Grid of stack met visuele tier-boxen    |
  | Landingpage pricing   | `PricingTeaser`, `FeatureList`       | 2- of 3-koloms sectie onder hero        |
  | Result fallback       | `AccessWarning`, `ClaimScanForm`     | Card met waarschuwing en invoerveld     |
  | Token-vervalmelding   | `EmailHintBox`, `RetryAccessButton`  | Alert boven resultaat of redirect flow  |

💡 Deze elementen zijn essentieel voor consistentie, gebruikersvertrouwen en een stabiele visuele flow in Phase 4.

---

## 🔧 Na Phase-4 – Fijnafwerking & post-MVP elementen

Deze componenten zijn wenselijk voor een volwassen product, maar hoeven niet vóór Phase 4 te worden afgerond:

- Bevestigingsmail en resultmail flows met templates (HTML/text)
- 404, 403 en technische errorpagina’s voor routingfallback
- Inhoudelijke `/faq`, `/over-ons` en juridische pagina's zoals `terms` en `privacy`
- Validatie en afhandeling van access-tokens op de server:

```ts
// Voorbeeld van eenvoudige tokencheck
const result = await supabase.from('scan_tokens')
  .select('email')
  .eq('scan_id', scanId)
  .eq('token', receivedToken);
```

- E-mailbased dashboardpagina (`/dashboard`) met historisch overzicht (via Supabase `user_scan_history`)
- Beheeromgeving voor scanmonitoring (bijv. via role-based route met API-analyse)
- `/scan/[scanId]/download` als aparte route met tokenvalidatie en eventueel expiry headers
- Route `/scan/[scanId]/claim` waarin e-mailadres gevraagd wordt om opnieuw toegang te verkrijgen

---

## 🔐 Email-Based toegang – Beslisboom & UX-strategie

### 🧭 Beslisboom: toegang via e-mailtoken

```plaintext
🧑 Gebruiker vult URL + e-mailadres in
           │
           ▼
🚀 Scan start direct (geen bevestiging vooraf)
           │
           ▼
📩 Bevestigingsmail wordt direct verstuurd
    ✓ Toelichting scan
    ✓ Link met unieke access-token
           │
           ▼
⏳ Na afronding scan:
 - Resultaten opgeslagen
 - PDF gegenereerd (optioneel)
           │
           ▼
📥 Gebruiker wil resultaten bekijken?
    ├── Via e-maillink → ✅ Toegang (token klopt)
    └── Via handmatig getikte link → ❌ “Deze scan is privé”
```

### ✨ UX-strategie

#### 1. 🔁 Scanformulier (input)

- Velden: URL + e-mailadres
- Inline validatie (regex, suggestie zoals bij `gnail.com`)
- Simpele uitlegtekst onder het formulier (“Je ontvangt het resultaat per e-mail.”)

#### 2. 🕐 Tijdens scan (loading page)

- Message: “Je scan wordt uitgevoerd. Binnen enkele minuten ontvang je je resultaat per mail.”
- Poll eventueel op backend-status (optioneel)

#### 3. 📩 Resultatenpagina

- Alleen toegankelijk met een geldige token in de URL:

```ts
// Client-side voorbeeld:
if (!params.token) return redirect('/scan-invalid');
```

- Zonder token of bij mismatch:

> “Deze scan is privé. We hebben de resultaten gemaild naar **mi**\*\*@gmail.com\*\*. Geen mail ontvangen? [Vraag opnieuw toegang aan]”

---

> 📌 Dit canvas beschrijft alle essentiële routing- en toegangspunten voorafgaand aan Phase 4. Het stelt prioriteiten, benoemt afhankelijkheden en biedt een veilige, toegankelijke gebruikerservaring met concrete implementatievoorstellen voor devs en AI-agents.

