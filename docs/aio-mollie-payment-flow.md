# GEO Scanner - Complete Payment Flow (SvelteKit)

## 🎯 **Complete Payment Flow - MVP (Simpel Credit Model)**

### **Route 1: Direct Koper (Landing Page)**
```
🌐 Landing Page → 📦 Package Selection → ✅ Checkout Confirmation → 💳 Mollie → 🎉 Success → 📱 Dashboard
   ("Koop Nu" CTA)    (/upgrade)           (/checkout/starter)      (External)   (/success)   (/dashboard)
```

### **Route 2: Converter (Na Gratis Scan)**
```
📊 Results Page → 📦 Package Selection → ✅ Checkout Confirmation → 💳 Mollie → 🎉 Success → 📱 Dashboard
   ("Upgrade" CTA)    (/upgrade)           (/checkout/starter)      (External)   (/success)   (/dashboard)
```

### **Route 3: Credit Bijkopen (0 Credits)**
```
📱 Dashboard → 📦 Package Selection → ✅ Checkout Confirmation → 💳 Mollie → 🎉 Success → 📱 Dashboard
   ("Credits op")     (/upgrade)           (/checkout/starter)      (External)   (/success)   (bijgewerkt)
```

### **Landing Page CTA Setup**
- **Primary CTA**: "🆓 Gratis Scan Starten" (groot, prominent)
- **Secondary CTA**: "💳 Direct Kopen" (kleiner, header/pricing sectie)

## **MVP Credit Model (Simpel)**

### **Twee Packages - Alleen Credit Verschil:**
- **Starter Pack**: €19,95 = 2 credits
- **Professional Pack**: €49,95 = 5 credits

### **Geen Feature Differences (MVP)**
- ✅ Alle gebruikers krijgen dezelfde scan features
- ✅ Alleen verschil = aantal credits
- ✅ Bijkopen = gewoon nieuwe package kopen
- 🔄 **Later**: AI-gidsen, Pro modules, feature gating

### **Credit Logic:**
```
Huidige credits + Gekochte credits = Nieuwe totaal
Voorbeeld: 0 + 2 = 2 credits
Voorbeeld: 1 + 5 = 6 credits totaal
```

## **MVP Implementation Priority:**
1. **Routes 1 & 2**: Eerste aankoop (90% focus)
2. **Route 3**: Credit bijkopen (10% focus)
3. **Feature gating**: Later (post-MVP)

## 📄 **Pagina Beschrijvingen**

### **1. Results Page** (`/results/{scanId}`)
**Functie**: Toon scan resultaten + strategische upgrade prompts  
**Layout**: 
- Grote score cirkel + radar chart
- Quick wins (eerste 3 gratis, rest blurred)
- Module accordions (sommige locked voor Pro)
- **CTA's**: "Download PDF - €19,95" en "Unlock AI Features - €49,95"

**Upgrade Triggers**:
- Premium content achter blur/lock
- "Wil je meer scans?" na gebruik gratis credit
- Social proof: "500+ bedrijven gebruiken GEO Scanner"

---

### **2. Package Selection** (`/upgrade`)
**Functie**: Vergelijk Starter vs Professional packages  
**Layout**:
- Hero: "Kies je pakket" + trust indicators
- **Side-by-side cards**:
  - Starter (€19,95): PDF, geschiedenis, basis tips - **"Populair" badge**
  - Professional (€49,95): AI-gidsen, code snippets, benchmarking
- Feature comparison tabel
- FAQ sectie: "Kan ik later upgraden?" etc.

**Conversie optimalisatie**:
- Starter als "aanbevolen" positioneren  
- Professional features duidelijk beter laten lijken
- Testimonials van tevreden klanten

---

### **3. Checkout Confirmation** (`/checkout/{packageId}`)
**Functie**: Laatste check voor naar Mollie  
**Layout**:
- Gekozen pakket samenvatting
- Prijs breakdown: "Starter Pack €19,95 incl. BTW"
- **Email veld**: "Voor je account en factuur"
- Acceptatie checkboxes (voorwaarden, marketing opt-in)
- Grote "Ga naar Betaling" knop

**Trust building**:
- SSL badges, Nederlandse betaalmethoden preview
- "Geld terug garantie binnen 7 dagen"
- "Direct toegang na betaling"

---

### **4. Mollie Checkout** (External)
**Functie**: Mollie hosted payment page  
**Methoden**: iDEAL, creditcard, Bancontact, PayPal
**Return URL's**: 
- Success → `/checkout/return?payment_id={id}`
- Cancel → `/checkout/failed?reason=cancelled`

---

### **5. Return Handler** (`/checkout/return`)
**Functie**: Check payment status en redirect  
**Logic**:
```
if (payment.status === 'paid') → /checkout/success
if (payment.status === 'failed') → /checkout/failed  
if (payment.status === 'pending') → /checkout/pending
```
**UI**: Loading spinner + "Betaling controleren..."

---

### **6. Success Page** (`/checkout/success`)
**Functie**: Bevestig succesvolle betaling + onboarding  
**Layout**:
- **Hero**: ✅ "Welkom bij GEO Scanner!" 
- Pakket bevestiging: "Je hebt 2 credits gekregen"
- **Next steps**:
  - "Scan een nieuwe website" knop
  - "Download je rapport" link
  - "Bekijk je dashboard" link

**Engagement**:
- Tips voor eerste gebruik
- "Deel je score op LinkedIn" social share
- Email bevestiging: "Check je inbox voor factuur"

---

### **7. Failed Page** (`/checkout/failed`)
**Functie**: Handle mislukte betalingen  
**Layout**:
- ❌ "Betaling niet voltooid"
- Reden: "Geannuleerd" vs "Technische fout"
- **Recovery options**:
  - "Probeer opnieuw" → terug naar checkout
  - "Andere betaalmethode" → terug naar Mollie
  - "Hulp nodig?" → contact form

---

### **8. Pending Page** (`/checkout/pending`)  
**Functie**: Voor langzame betalingen (bankoverschrijving)  
**Layout**:
- ⏳ "Betaling wordt verwerkt"
- "Dit kan tot 2 werkdagen duren"
- "Je krijgt email zodra betaling compleet is"
- Auto-refresh elke 30 seconden

---

### **9. Dashboard** (`/dashboard`)
**Functie**: Gebruiker onboarding na eerste betaling  
**Layout voor nieuwe user**:
- **Welcome banner**: "Welkom {naam}! Je hebt {credits} credits"
- **Quick start**: "Scan je eerste website"
- Credit saldo prominent
- **Empty state**: "Nog geen scans" met CTA

**Returning user**:
- Scan geschiedenis
- Credit gebruik overzicht  
- "Koop meer credits" als laag saldo

## 💳 **Credit Packages (Mollie Pricing)**

### **Package Configuration**
```typescript
// src/lib/config/packages.ts
export const CREDIT_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    credits: 2,
    price: 19.95,
    currency: 'EUR',
    description: 'Perfect voor kleine bedrijven',
    features: [
      'Uitgebreide 8-module analyse',
      'PDF rapport generatie', 
      'Email bezorging',
      'Scan geschiedenis (30 dagen)',
      'Basis implementatie tips'
    ],
    popular: true
  },
  professional: {
    id: 'professional', 
    name: 'Professional Pack',
    credits: 5,
    price: 49.95,
    currency: 'EUR',
    description: 'Voor bureaus & consultants',
    features: [
      'Alle Starter features',
      'AI-aangedreven implementatiegidsen',
      'Ready-to-use code snippets',
      'Impact voorspellingen per fix',
      'Prioriteit ranking algoritme',
      'Concurrentie benchmarking',
      'Scan geschiedenis (90 dagen)'
    ]
  }
}
```

## 🛒 **SvelteKit Routes & Components**

### **1. Package Selection Page**
```
/pricing (Optional - can skip to direct upgrade)
/upgrade?package=starter (Direct from results page)
```

### **2. Checkout Flow**
```
POST /api/mollie/create-payment
  ↓
Mollie Checkout Page (External)
  ↓
Webhook: /api/mollie/webhook
  ↓  
Success: /checkout/success?payment_id=xxx
Failure: /checkout/failed?payment_id=xxx
```

## 🔧 **Backend Implementation**

### **1. Mollie Client Setup**
```typescript
// src/lib/server/mollie.ts
import { createMollieClient } from '@mollie/api-client';

const mollie = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY
});

export { mollie };
```

### **2. Create Payment Endpoint**
```typescript
// src/routes/api/mollie/create-payment/+server.ts
import { json } from '@sveltejs/kit';
import { mollie } from '$lib/server/mollie';
import { CREDIT_PACKAGES } from '$lib/config/packages';

export async function POST({ request, url }) {
  try {
    const { packageId, userEmail } = await request.json();
    
    const package = CREDIT_PACKAGES[packageId];
    if (!package) {
      return json({ error: 'Invalid package' }, { status: 400 });
    }

    const payment = await mollie.payments.create({
      amount: {
        currency: package.currency,
        value: package.price.toFixed(2)
      },
      description: `GEO Scanner ${package.name}`,
      redirectUrl: `${url.origin}/checkout/return?payment_id={id}`,
      webhookUrl: `${url.origin}/api/mollie/webhook`,
      metadata: {
        packageId,
        userEmail,
        credits: package.credits.toString()
      }
    });

    return json({ 
      paymentUrl: payment.getCheckoutUrl(),
      paymentId: payment.id 
    });

  } catch (error) {
    console.error('Payment creation failed:', error);
    return json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
```

### **3. Webhook Handler**
```typescript  
// src/routes/api/mollie/webhook/+server.ts
import { mollie } from '$lib/server/mollie';
import { supabase } from '$lib/server/supabase';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const paymentId = formData.get('id') as string;

    const payment = await mollie.payments.get(paymentId);
    
    if (payment.status === 'paid') {
      const { packageId, userEmail, credits } = payment.metadata;
      
      // Add credits to user account
      await supabase
        .from('users')
        .upsert({
          email: userEmail,
          credits_remaining: credits,
          plan_type: packageId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email',
          upsertType: 'merge'
        });

      // Log transaction
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (user) {
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'purchase',
            credits_change: parseInt(credits),
            mollie_payment_id: paymentId,
            description: `Purchased ${packageId} package`
          });
      }
    }

    return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return new Response('Error', { status: 500 });
  }
}
```

### **4. Payment Return Handler**
```typescript
// src/routes/checkout/return/+page.server.ts
import { mollie } from '$lib/server/mollie';
import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
  const paymentId = url.searchParams.get('payment_id');
  
  if (!paymentId) {
    throw redirect(302, '/checkout/failed');
  }

  try {
    const payment = await mollie.payments.get(paymentId);
    
    if (payment.status === 'paid') {
      throw redirect(302, `/checkout/success?payment_id=${paymentId}`);
    } else if (payment.status === 'failed' || payment.status === 'canceled') {
      throw redirect(302, `/checkout/failed?payment_id=${paymentId}`);
    } else {
      // Still pending
      return {
        status: 'pending',
        paymentId
      };
    }
  } catch (error) {
    console.error('Payment check failed:', error);
    throw redirect(302, '/checkout/failed');
  }
}
```

## 🎨 **Frontend Components**

### **1. Package Selection Component**
```svelte
<!-- src/lib/components/PackageSelection.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { CREDIT_PACKAGES } from '$lib/config/packages';
  
  const dispatch = createEventDispatcher();
  
  async function selectPackage(packageId: string) {
    dispatch('packageSelected', { packageId });
  }
</script>

<div class="packages-grid">
  {#each Object.entries(CREDIT_PACKAGES) as [id, pkg]}
    <div class="package-card" class:popular={pkg.popular}>
      {#if pkg.popular}
        <div class="popular-badge">Populair</div>
      {/if}
      
      <h3>{pkg.name}</h3>
      <div class="price">€{pkg.price}</div>
      <p>{pkg.description}</p>
      
      <ul class="features">
        {#each pkg.features as feature}
          <li>✓ {feature}</li>
        {/each}
      </ul>
      
      <button 
        class="select-btn"
        on:click={() => selectPackage(id)}
      >
        Kies {pkg.name}
      </button>
    </div>
  {/each}
</div>

<style>
  .packages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }

  .package-card {
    background: white;
    border: 2px solid var(--border-gray);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    transition: all 0.3s ease;
  }

  .package-card:hover {
    border-color: var(--primary-blue);
    transform: translateY(-4px);
  }

  .package-card.popular {
    border-color: var(--primary-blue);
    box-shadow: 0 8px 25px rgba(46, 155, 218, 0.15);
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary-blue);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .price {
    font-family: var(--font-header);
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-blue);
    margin: 1rem 0;
  }

  .features {
    list-style: none;
    margin: 1.5rem 0;
  }

  .features li {
    padding: 0.5rem 0;
    color: var(--text-gray);
  }

  .select-btn {
    width: 100%;
    background: var(--primary-gradient);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .select-btn:hover {
    transform: translateY(-2px);
  }
</style>
```

### **2. Checkout Trigger**
```svelte
<!-- src/lib/components/CheckoutButton.svelte -->
<script lang="ts">
  export let packageId: string;
  export let userEmail: string = '';
  
  let loading = false;
  
  async function startCheckout() {
    loading = true;
    
    try {
      const response = await fetch('/api/mollie/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, userEmail })
      });
      
      const { paymentUrl, error } = await response.json();
      
      if (error) {
        alert('Betaling kon niet worden gestart: ' + error);
        return;
      }
      
      // Redirect to Mollie
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      loading = false;
    }
  }
</script>

<button 
  class="checkout-btn"
  disabled={loading}
  on:click={startCheckout}
>
  {#if loading}
    <span class="loading">Bezig...</span>
  {:else}
    <span>Bestellen</span>
  {/if}
</button>
```

## 🎉 **Success & Failure Pages**

### **Success Page**
```svelte
<!-- src/routes/checkout/success/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  let paymentId = $page.url.searchParams.get('payment_id');
  
  onMount(() => {
    // Track conversion
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: paymentId,
        value: 19.95, // Dynamic based on package
        currency: 'EUR'
      });
    }
  });
</script>

<div class="success-container">
  <div class="success-icon">✅</div>
  <h1>Betaling Geslaagd!</h1>
  <p>Je credits zijn toegevoegd aan je account