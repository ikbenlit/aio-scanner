# AIO Scanner – Overzicht Tier-model  
*Prijs per losse scan & overeenkomstige diepgang*  

---

## 🎯 Filosofie  
1. **Één betaling = één scan.** Geen credits, geen seats.  
2. **Meer betalen = meer modules, méér AI-diepte & uitgebreid(er) rapport.**  
3. **Upgrade-pad is lineair:** Basic ➜ Starter ➜ Business ➜ Enterprise.  

---

| Tier | Prijs | Modules | AI-rapport | PDF | In de UI |
|------|-------|---------|-----------|-----|----------|
| **Basic**<br>“AI Quick Check” | **€ 0** | 2 modules:<br>• TechnicalSEOModule<br>• SchemaMarkupModule | – | ❌ | • Hero-score<br>• **max 3 Quick Wins** (≥ 1 AI-gerelateerd)<br>• Positieve punten<br>• Upgrade-banner naar Starter |
| **Starter**<br>“Action Report” | **€ 19,95** | Basic + 2 modules:<br>• AIContentModule<br>• AICitationModule | **Beknopt** (executive summary) | ✔️ Samenvattend (AIO-branding) | • Volledige Business-actions-lijst (≈ 15)<br>• PDF-downloadknop |
| **Business**<br>“Growth Report” | **€ 49,95** | Starter + 2 modules:<br>• FreshnessModule<br>• CrossWebFootprintModule | **Uitgebreid** (AI-Narrative & roadmap) | ✔️ Volledig (klantlogo + grafieken) | • Alle Business-actions (25-30)<br>• AI-Narrative sectie<br>• Kosten/tijd via `costTracking` |
| **Enterprise**<br>“Tailored Insights” | **€ 149,95** | Business + Enterprise-features:<br>• Multi-page crawl<br>• Site-wide patronen<br>• Industry-benchmark<br>• KPI-dashboard | **Strategisch** (deep AI + benchmark) | ✔️ White-label + strategisch plan | • ModuleGrid met “Diepe analyse” badges<br>• Banner: “Contact CSM” |

---

## 📦 Module-toewijzing per Tier  
```text
Tier → Modules
┌────────────┬──────────────────────────────────────────────────────────────┐
│ Basic      │ TechnicalSEO, SchemaMarkup                                  │
│ Starter    │ + AIContent, AICitation                                     │
│ Business   │ + Freshness, CrossWebFootprint                              │
│ Enterprise │ + MultiPageAnalysis, SiteWidePatterns, IndustryBenchmark…   │
└────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Upgrade-haakjes (“Gentle Conversion”)

* **Basic ➜ Starter**  
  Banner onder Quick Wins: “We vonden nog 12 extra AI-aanbevelingen – upgrade voor volledig rapport (€ 19,95).”

* **Starter ➜ Business**  
  Grijze AI-Narrative-kaart met lock-icoon + tooltip: “Beschikbaar in Growth Report (€ 49,95).”

* **Business ➜ Enterprise**  
  Sidebar met checklist “Onbeperkte pagina-analyse, white-label PDF, benchmark KPI’s” + knop “Plan demo”.

---

## ✅ Waarom dit werkt
* Sluit naadloos aan op bestaande **ScanOrchestrator**-logica (`modules.slice()` & AI-services).  
* Prijzen komen exact overeen met `getTierPrice()` in de code.  
* Geen fictieve features toegevoegd; alle genoemde functies bestaan reeds in de code-basis.
