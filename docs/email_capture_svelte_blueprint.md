# 📧 Email Capture Modal - Svelte Component Blueprint

## 🎯 **Design Overview**

**Purpose**: Conversion-optimized email capture gate that appears after scan completion  
**Style**: Glassmorphism modal with website preview and results teaser  
**Goal**: Maximize email capture rate (target: 60%+) through personalization and urgency  

---

## 📐 **Layout Structure**

```
📱 MOBILE/DESKTOP RESPONSIVE MODAL:
┌─────────────────────────────────┐
│ [Blur Overlay - Full Screen]    │
│  ┌───────────────────────────┐   │
│  │ [Glassmorphism Modal]     │   │
│  │                           │   │
│  │ 🎯 Scan Complete Icon     │   │
│  │                           │   │
│  │ 📷 Website Preview Card   │   │
│  │                           │   │
│  │ 📊 Results Preview Teaser │   │
│  │                           │   │
│  │ 📧 Email Form            │   │
│  │                           │   │
│  │ ✅ Trust Indicators       │   │
│  │                           │   │
│  └───────────────────────────┘   │
└─────────────────────────────────┘
```

---

## 🧩 **Svelte Component Architecture**

### **1. Main Container: `EmailCaptureModal.svelte`**

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ScanCompleteIcon from './ScanCompleteIcon.svelte';
  import WebsitePreview from './WebsitePreview.svelte';
  import ResultsTeaser from './ResultsTeaser.svelte';
  import EmailForm from './EmailForm.svelte';
  import TrustIndicators from './TrustIndicators.svelte';
  import PrivacyNote from './PrivacyNote.svelte';

  // Props
  export let websiteUrl: string = '';
  export let websiteScreenshot: string = '';
  export let scanResults: ScanResults;
  export let isVisible: boolean = false;

  // Events
  const dispatch = createEventDispatcher();

  function handleEmailSubmit(email: string) {
    dispatch('emailSubmit', { email, scanResults });
  }

  function handleClose() {
    dispatch('close');
  }

  // Types
  interface ScanResults {
    score: number;
    status: 'good' | 'warning' | 'critical';
    criticalFindings: Finding[];
  }

  interface Finding {
    icon: string;
    text: string;
    severity: 'urgent' | 'warning' | 'info';
  }
</script>

{#if isVisible}
  <div class="overlay" on:click={handleClose}>
    <div class="modal" on:click|stopPropagation>
      <ScanCompleteIcon />
      
      <div class="modal-header">
        <WebsitePreview {websiteUrl} {websiteScreenshot} />
        <div class="modal-title-section">
          <h2 class="modal-title">Scan Resultaten Klaar!</h2>
          <p class="modal-subtitle">
            Ontdek wat AI-zoekmachines van <strong>jouw website</strong> vinden
          </p>
        </div>
      </div>

      <ResultsTeaser {scanResults} />
      <EmailForm on:submit={handleEmailSubmit} />
      <TrustIndicators />
      <PrivacyNote />
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.3s ease-out;
  }

  .modal {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    max-width: 500px;
    width: 100%;
    padding: 3rem 2.5rem;
    text-align: center;
    position: relative;
    animation: slideUp 0.4s ease-out 0.1s both;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
```

### **2. Success Icon: `ScanCompleteIcon.svelte`**

```svelte
<script>
  import { onMount } from 'svelte';
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

<div class="scan-complete-icon" class:mounted>
  <div class="scan-pulse"></div>
  <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
</div>

<style>
  .scan-complete-icon {
    width: 80px;
    height: 80px;
    background: var(--primary-gradient);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    position: relative;
  }

  .scan-complete-icon.mounted {
    animation: pulse 2s infinite;
  }

  .scan-pulse {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 3px solid var(--cyber-accent);
    border-radius: 50%;
    opacity: 0.3;
    animation: ripple 3s infinite;
  }

  .checkmark {
    width: 36px;
    height: 36px;
    color: white;
    z-index: 1;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes ripple {
    0% { transform: scale(0.8); opacity: 0.3; }
    100% { transform: scale(1.2); opacity: 0; }
  }
</style>
```

### **3. Website Preview: `WebsitePreview.svelte`**

```svelte
<script lang="ts">
  export let websiteUrl: string;
  export let websiteScreenshot: string;
  
  // Fallback screenshot if none provided
  const defaultScreenshot = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIE1vY2sgd2Vic2l0ZSBzY3JlZW5zaG90IC0tPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAiIGZpbGw9IiMyRTlCREEiLz4KICA8dGV4dCB4PSIyMCIgeT0iMjgiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5qb3V3YmVkcmlqZi5ubDwvdGV4dD4KICA8L3N2Zz4K";
</script>

<div class="website-preview">
  <div class="website-screenshot">
    <img 
      src={websiteScreenshot || defaultScreenshot} 
      alt="Website Screenshot" 
      class="screenshot-img"
    />
    <div class="scan-overlay">
      <div class="scan-indicator">
        <div class="scan-pulse"></div>
        <svg class="scan-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
    </div>
  </div>
  
  <div class="website-info">
    <div class="website-url">{websiteUrl}</div>
    <div class="scan-status-text">✅ AI-analyse voltooid</div>
  </div>
</div>

<style>
  .website-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    border: 1px solid rgba(46, 155, 218, 0.1);
  }

  .website-screenshot {
    position: relative;
    width: 120px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
  }

  .screenshot-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .scan-overlay {
    position: absolute;
    top: 0;
    right: 0;
    width: 24px;
    height: 24px;
    background: var(--success-green);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    transform: translate(50%, -50%);
  }

  .scan-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--success-green);
    opacity: 0.3;
    animation: pulse-ring 2s infinite;
  }

  .scan-icon {
    width: 12px;
    height: 12px;
    color: white;
    z-index: 1;
  }

  .website-info {
    flex: 1;
    text-align: left;
  }

  .website-url {
    font-family: var(--font-header);
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary-blue);
    margin-bottom: 0.25rem;
  }

  .scan-status-text {
    font-size: 0.875rem;
    color: var(--success-green);
    font-weight: 500;
  }

  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.3; }
    100% { transform: scale(2); opacity: 0; }
  }
</style>
```

### **4. Results Teaser: `ResultsTeaser.svelte`**

```svelte
<script lang="ts">
  interface Finding {
    icon: string;
    text: string;
    severity: 'urgent' | 'warning' | 'info';
  }

  interface ScanResults {
    score: number;
    status: 'good' | 'warning' | 'critical';
    criticalFindings: Finding[];
  }

  export let scanResults: ScanResults;
  
  const { score, status, criticalFindings } = scanResults;
  
  // Add blur item for FOMO
  const displayFindings = [
    ...criticalFindings.slice(0, 2),
    { icon: '📱', text: '+ 3 andere verbeterpunten', severity: 'info', blur: true }
  ];
</script>

<div class="results-preview">
  <div class="preview-header">
    <div class="preview-title">Jouw AI-Gereedheid Score</div>
    <div class="preview-subtitle">Ontdek wat AI-zoekmachines van je website vinden</div>
  </div>
  
  <div class="score-preview">
    <div class="score-circle-blur">
      <div class="score-value-blur">{score}</div>
      <div class="score-label">van 100</div>
    </div>
    <div class="score-status">
      <div class="status-badge status-{status}">
        {status === 'good' ? 'Goed' : status === 'warning' ? 'Matig' : 'Slecht'}
      </div>
      <div class="status-text">Maar verbetering mogelijk</div>
    </div>
  </div>

  {#if criticalFindings.length > 0}
    <div class="critical-findings">
      <div class="finding-title">🚨 Kritieke bevindingen gevonden:</div>
      <div class="findings-grid">
        {#each displayFindings as finding}
          <div class="finding-item finding-{finding.severity}" class:finding-blur={finding.blur}>
            <div class="finding-icon">{finding.icon}</div>
            <div class="finding-text">{finding.text}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="unlock-banner">
    <div class="unlock-text">
      <strong>Email vereist</strong> voor volledige resultaten en actiepunten
    </div>
    <div class="unlock-arrow">→</div>
  </div>
</div>

<style>
  .results-preview {
    background: linear-gradient(135deg, 
      rgba(46, 155, 218, 0.05), 
      rgba(0, 245, 255, 0.05));
    border: 1px solid rgba(46, 155, 218, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .preview-title {
    font-family: var(--font-header);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--primary-blue);
    margin-bottom: 0.25rem;
  }

  .score-circle-blur {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: conic-gradient(
      var(--success-green) 0deg 280deg,
      var(--border-gray) 280deg 360deg
    );
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    filter: blur(0.5px);
    position: relative;
  }

  .score-circle-blur::before {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: white;
  }

  .score-value-blur {
    position: relative;
    z-index: 1;
    font-family: var(--font-header);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--dark);
    filter: blur(1px);
  }

  .finding-blur {
    filter: blur(0.5px);
    opacity: 0.7;
  }

  .unlock-arrow {
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }
</style>
```

### **5. Email Form: `EmailForm.svelte`**

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let email = '';
  let isSubmitting = false;
  let errors: Record<string, string> = {};
  
  function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  async function handleSubmit() {
    errors = {};
    
    if (!email) {
      errors.email = 'Email is verplicht';
      return;
    }
    
    if (!validateEmail(email)) {
      errors.email = 'Voer een geldig email adres in';
      return;
    }
    
    isSubmitting = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatch('submit', email);
    } catch (error) {
      errors.general = 'Er ging iets mis. Probeer het opnieuw.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form class="email-form" on:submit|preventDefault={handleSubmit}>
  <div class="form-group">
    <label for="email" class="form-label">Email adres</label>
    <input 
      type="email" 
      id="email" 
      bind:value={email}
      class="email-input"
      class:error={errors.email}
      placeholder="jouw.email@bedrijf.nl"
      required
      autocomplete="email"
      disabled={isSubmitting}
    />
    {#if errors.email}
      <div class="error-message">{errors.email}</div>
    {/if}
  </div>
  
  <button type="submit" class="cta-button" disabled={isSubmitting}>
    {#if isSubmitting}
      <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Verwerken...
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
      Bekijk Mijn Resultaten
    {/if}
  </button>
  
  {#if errors.general}
    <div class="error-message general-error">{errors.general}</div>
  {/if}
</form>

<style>
  .email-form {
    margin-bottom: 2rem;
  }

  .email-input {
    width: 100%;
    height: 3.5rem;
    padding: 0 1.25rem;
    border: 2px solid var(--border-gray);
    border-radius: 12px;
    font-size: 1rem;
    font-family: inherit;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .email-input:focus {
    outline: none;
    border-color: var(--primary-blue);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 3px rgba(46, 155, 218, 0.1);
  }

  .email-input.error {
    border-color: var(--accent-red);
  }

  .cta-button {
    width: 100%;
    height: 3.5rem;
    background: var(--primary-gradient);
    color: white;
    border: none;
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .cta-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px 0 rgba(46, 155, 218, 0.5);
  }

  .cta-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error-message {
    color: var(--accent-red);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
```

### **6. Trust Indicators: `TrustIndicators.svelte`**

```svelte
<script>
  const trustItems = [
    {
      icon: 'M9 12l2 2 4-4',
      text: 'Geen spam - alleen je rapport'
    },
    {
      icon: 'M12 6v6l4 2',
      text: 'Direct in je inbox - binnen 30 seconden'
    },
    {
      icon: 'M3 11h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2V11z',
      text: 'GDPR-compliant & veilig'
    }
  ];
</script>

<div class="trust-indicators">
  {#each trustItems as item}
    <div class="trust-item">
      <svg class="trust-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d={item.icon}></path>
      </svg>
      <span>{item.text}</span>
    </div>
  {/each}
</div>

<style>
  .trust-indicators {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .trust-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-gray);
  }

  .trust-icon {
    width: 16px;
    height: 16px;
    color: var(--success-green);
    flex-shrink: 0;
  }
</style>
```

---

## 🎨 **CSS Custom Properties (Global)**

```css
/* Add to app.css or global styles */
:root {
  /* Existing AIO-Scanner colors */
  --primary-blue: #2E9BDA;
  --primary-gradient: linear-gradient(135deg, #2E9BDA, #4FACFE);
  --secondary-yellow: #F5B041;
  --accent-red: #E74C3C;
  --success-green: #10b981;
  --cyber-accent: #00F5FF;
  --dark: #1a1a1a;
  --dark-secondary: #0f172a;
  --text-gray: #64748b;
  --border-gray: #e2e8f0;
  --bg-light: #f8fafc;
  --background-secondary: #f1f5f9;

  /* Typography */
  --font-header: 'Orbitron', system-ui, sans-serif;
  --font-body: 'Exo 2', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}
```

---

## 📱 **Usage Example**

```svelte
<!-- In your main scan page -->
<script>
  import EmailCaptureModal from '$lib/components/EmailCaptureModal.svelte';
  
  let showEmailModal = false;
  let scanResults = {
    score: 78,
    status: 'good',
    criticalFindings: [
      { icon: '⚠️', text: 'Schema markup ontbreekt', severity: 'urgent' },
      { icon: '🔍', text: 'Content structuur verbeteren', severity: 'warning' }
    ]
  };
  
  function handleEmailSubmit(event) {
    const { email, scanResults } = event.detail;
    // Send to API, redirect to results, etc.
    console.log('Email captured:', email);
    showEmailModal = false;
  }
</script>

<EmailCaptureModal
  bind:isVisible={showEmailModal}
  websiteUrl="jouwbedrijf.nl"
  websiteScreenshot="/path/to/screenshot.png"
  {scanResults}
  on:emailSubmit={handleEmailSubmit}
  on:close={() => showEmailModal = false}
/>
```

---

## 🚀 **Implementation Priority**

### **Phase 1: MVP (Core Conversion)**
1. ✅ `EmailCaptureModal.svelte` - Main container
2. ✅ `WebsitePreview.svelte` - Personalization  
3. ✅ `EmailForm.svelte` - Critical conversion point

### **Phase 2: Optimization**
4. ✅ `ResultsTeaser.svelte` - Urgency creation
5. ✅ `ScanCompleteIcon.svelte` - Success reinforcement
6. ✅ `TrustIndicators.svelte` - Trust building

### **Phase 3: Polish**
7. 🔄 Responsive optimizations
8. 🔄 Advanced animations
9. 🔄 A/B testing variants

---

## 🎯 **Success Metrics**

- **Email Capture Rate**: Target 60%+
- **Form Completion Time**: < 30 seconds
- **Mobile Conversion**: 50%+ of desktop rate
- **Trust Score**: High perceived security/privacy

**This blueprint provides everything needed to implement the conversion-optimized email capture modal in SvelteKit!** 🚀