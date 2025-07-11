graph TD
    %% ===== STARTPUNT & ORCHESTRATIE =====
    subgraph START ["🚀 STARTPUNT & ORCHESTRATIE"]
        A[👤 Gebruiker] --> B{Kies Scantype}
        B -->|Site-Wide Crawl| C[📡 POST /api/scan/crawl]
        B -->|Single-Page Scan| D[📡 POST /api/scan]

        C --> E[🔄 CrawlManager Service]
        E --> F[📋 URL Discovery & Queue]
        F -->|Per URL| G[⚙️ SinglePageAnalyzer]
        
        D --> H[🎯 ScanOrchestrator]
        H --> I[🏭 TierStrategyFactory]
        I --> G
    end

    %% ===== DATA ACQUISITIE ENGINE =====
    subgraph DATA ["🔍 DATA ACQUISITIE ENGINE (Fase 1)"]
        G --> J[📦 SharedContentService]
        J --> K[🌐 ContentFetcher.execute]
        K --> L{Strategy?}
        L -->|Basic| M[⚡ fetchWithCheerio]
        L -->|Starter+| N[🎭 fetchWithPlaywright]
        M --> O[📄 HTML + Screenshot]
        N -->|networkidle0| O
        O --> P[💾 SharedContent Object]
    end

    %% ===== SLIMME ANALYSE MODULES =====
    subgraph MODULES ["🧠 SLIMME ANALYSE MODULES (Fase 1)"]
        P --> Q[🔀 Parallel Module Execution]
        Q --> R1[⚙️ TechnicalSEO]
        Q --> R2[📋 SchemaMarkup] 
        Q --> R3[💬 AIContent]
        Q --> R4[🎯 AICitation]
        Q --> R5[📅 Freshness]
        Q --> R6[📱 Social]
        
        R3 --> S1[analyzeFAQ<br/>analyzeConversational]
        R4 --> S2[analyzeAuthorBio<br/>analyzeExpertise]
        S1 --> T[📊 Finding + evidence/suggestion]
        S2 --> T
        R1 --> U[📊 Basic Finding]
        R2 --> U
        R5 --> U
        R6 --> U
    end

    %% ===== AI VERRIJKING =====
    subgraph AI ["🤖 AI VERRIJKING (Fase 3)"]
        T --> V{Business Tier?}
        V -->|Ja| W[🧠 LLMEnhancementService]
        W --> X[⭐ VertexAI Prompts]
        X --> Y[getToneAnalysis<br/>getEEATStrength]
        Y --> Z[➕ AI-suggestie toevoegen]
        V -->|Nee| AA[📋 Standaard behouden]
        Z --> BB[✨ Verrijkte Findings]
        AA --> BB
    end

    %% ===== RESULTAATVERWERKING =====
    subgraph RESULTS ["📊 RESULTAATVERWERKING & OPSLAG"]
        BB --> CC{Type?}
        U --> CC
        CC -->|Crawl| DD[💾 Opslag in crawl_pages]
        DD --> F
        CC -->|Single| EE[📤 Return naar Frontend]
        E -->|Voltooid| FF[📈 Site-Wide Dashboard]
    end

    %% ===== FRONTEND & PDF =====
    subgraph FRONTEND ["🎨 FRONTEND & PDF RAPPORTAGE (Fase 1)"]
        EE --> GG[📱 SmartFindingCard.svelte]
        GG --> HH[👁️ Toon evidence + suggestion]
        HH --> II{PDF Request?}
        II -->|Starter+| JJ[📝 AIReportGenerator]
        JJ --> KK[🤖 VertexAI Narrative]
        KK --> LL[📄 PDF Generator]
    end

    %% Styling voor betere contrast en leesbaarheid
    classDef startStyle fill:#1a1a2e,stroke:#16213e,stroke-width:3px,color:#ffffff
    classDef dataStyle fill:#0f3460,stroke:#16537e,stroke-width:3px,color:#ffffff
    classDef moduleStyle fill:#e74c3c,stroke:#c0392b,stroke-width:3px,color:#ffffff
    classDef aiStyle fill:#8e44ad,stroke:#6c3483,stroke-width:3px,color:#ffffff
    classDef resultStyle fill:#27ae60,stroke:#1e8449,stroke-width:3px,color:#ffffff
    classDef frontStyle fill:#f39c12,stroke:#d68910,stroke-width:3px,color:#ffffff

    %% Apply styles to subgraphs
    class START startStyle
    class DATA dataStyle
    class MODULES moduleStyle
    class AI aiStyle
    class RESULTS resultStyle
    class FRONTEND frontStyle