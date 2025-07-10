# Fase 3: De Verfijning - Hybride AI-Intelligentie (Business Tier)

**Voortbouwend op:** Fase 1 (Perfecte Single-Page Scanner) & Fase 2 (Site-Wide Crawler).
**Doel van deze fase:** De Business-tier verrijken met een diepere laag aan intelligentie. We gebruiken onze eigen AI om te beoordelen hoe een andere AI de site zou interpreteren, waardoor de kloof met de Starter-tier nog groter en waardevoller wordt.

---

## Architecturale Aanpak

*   We breiden de bestaande "Slimme Modules" uit. Voor bepaalde, genuanceerde analyses roepen deze modules de hulp in van onze bestaande `VertexAIClient`.
*   Dit is een **Hybride Model**: 80% van de analyse gebeurt door onze snelle, deterministische modules. De 20% die nuance en contextueel begrip vereist, wordt gedelegeerd aan de AI.
*   De `ScanOrchestrator` blijft onaangetast (SOC). De intelligentie wordt lokaal, binnen de relevante module, toegevoegd.

---

### **Backend Engineer Taken:**

1.  **Dependency Injection voor AI-Service**
    *   **Actie:** Zorg ervoor dat een instantie van de `VertexAIClient` beschikbaar is binnen de "Slimme Modules". Dit kan via de constructor van de modules worden geïnjecteerd wanneer ze worden geïnitialiseerd in de `ScanOrchestrator` of de `SinglePageAnalyzer`.

2.  **Ontwikkel Gerichte AI-Prompts in `VertexAIClient`**
    *   **Specificaties:** Dit is de kern van deze fase. Voeg nieuwe, specifieke methodes toe aan `VertexAIClient.ts` voor micro-analyses. Deze methodes moeten zeer gerichte prompts bevatten en een voorspelbaar, strak gedefinieerd JSON-object retourneren.
    *   **Voorbeeld 1: `getToneAnalysis(textSnippet: string)`**
        *   **Prompt:** "Analyseer dit tekstfragment op aanspreekvorm (formeel/informeel) en sentiment. Geef een score van 0-100 en een korte onderbouwing."
        *   **Output JSON:** `{ "toneScore": 85, "assessment": "Persoonlijk en positief" }`
    *   **Voorbeeld 2: `getEEATStrength(evidence: string)`**
        *   **Prompt:** "Evalueer de kracht van deze E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) claim: '{{evidence}}'. Geef een suggestie om de claim verifieerbaarder te maken voor een AI."
        *   **Output JSON:** `{ "suggestion": "Voeg een link toe naar het profiel van de auteur op een erkende publicatie." }`

3.  **Integreer Hybride AI-Calls in de Modules**
    *   **Specificaties:** Pas de relevante "Slimme Modules" aan om deze nieuwe AI-methodes aan te roepen.
    *   **Workflow in de module:**
        1.  De module identificeert met zijn eigen logica een kandidaat voor diepere analyse (bv. een paragraaf over de oprichter of een lijst met awards).
        2.  De module roept de specifieke `VertexAIClient`-methode aan met dit stukje `evidence`.
        3.  De `suggestion` die terugkomt van de AI wordt toegevoegd aan het `Finding`-object dat de module genereert.
    *   **Te verbeteren modules:** `AIContentModule` (voor tone-of-voice) en `AICitationModule` (voor E-E-A-T signalen) zijn de primaire kandidaten.

### **Frontend Engineer Taken:**

1.  **Visualiseer de AI-Gegenereerde Inzichten**
    *   **Specificaties:** De bestaande `SmartFindingCard.svelte` component kan waarschijnlijk worden hergebruikt. De AI-gegenereerde `suggestion` komt immers in hetzelfde veld terecht als de suggesties van de "Slimme Modules".
    *   **Verfijning:** Overweeg een subtiel visueel onderscheid. Voeg bijvoorbeeld een klein "AI" of "Sparkle" icoontje toe naast de suggestie in de `SmartFindingCard` als deze afkomstig is van de Hybride AI-analyse. Dit communiceert de extra waarde van de Business-tier direct in de UI.

### **UX Expert Taken:**

1.  **Communicatie van AI-features**
    *   **Uitdaging:** Hoe maken we de gebruiker duidelijk dat bepaalde inzichten door AI zijn verrijkt, zonder het complex te maken?
    *   **Actie:** Werk samen met de frontend engineer aan het ontwerp van het "AI-icoon" en de eventuele tooltip die verschijnt als je eroverheen hovert. De tekst zou kunnen zijn: "Deze suggestie is gegenereerd door onze AI-analyse voor een dieper inzicht."

2.  **Waarde Propositie Fijnsljpen**
    *   Help mee met de marketing- en UI-teksten om het verschil tussen de "AI-samenvatting" (Starter) en de "Directe AI-inzichten in de scan" (Business) helder te communiceren op de pricing-pagina en in de app.

---

### **Definition of Done voor Fase 3:**
*   De `AICitationModule` en `AIContentModule` gebruiken de `VertexAIClient` voor diepgaande analyse op specifieke punten.
*   De online en PDF-rapporten voor de Business-tier bevatten nu AI-gegenereerde suggesties, duidelijk herkenbaar voor de gebruiker.
*   De waardepropositie van de Business-tier is significant verhoogd door de toevoeging van deze directe, contextuele intelligentie.
*   Het volledige productportfolio voor Basic, Starter en Business is geïmplementeerd.
