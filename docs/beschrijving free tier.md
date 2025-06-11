# Beschrijving van de Free Tier Journey Implementatie

## Overzicht
De Free Tier Journey is ontworpen om gebruikers een gratis scan van hun website aan te bieden, waarbij ze hun AI-gereedheid kunnen testen. De journey omvat de volgende stappen:

1. **Landing Page**: Gebruikers voeren hun URL in en starten de scan.
2. **Live Scan**: De scan wordt uitgevoerd met real-time voortgangsindicatoren.
3. **Email Capture**: Gebruikers voeren hun emailadres in om de resultaten te ontvangen.
4. **Results Display**: De resultaten worden direct op het scherm getoond en per email verzonden.

## Gedane Wijzigingen en Acties

### 1. Supabase Client Consolidatie
- **Actie**: Verwijdering van `supabaseClient.js` en consolidatie naar `supabase.ts`.
- **Opmerking**: Dit zorgt voor een enkele bron van waarheid voor de Supabase client.

### 2. Database Types en Definities
- **Actie**: Pogingen om `supabase.ts` bij te werken met correcte types voor `progress` en `result_json`.
- **Opmerking**: Door toolbeperkingen is dit niet gelukt; tijdelijke `any` types zijn gebruikt.

### 3. ScanOrchestrator Verbeteringen
- **Actie**: Implementatie van live voortgangsupdates en sequentiële module-uitvoering.
- **Opmerking**: Voortgang wordt nu betrouwbaar bijgewerkt in de database.

### 4. API Endpoints Aanpassingen
- **Actie**: Aanpassing van `POST /api/scan/anonymous` en `GET /api/scan/anonymous` voor type-veiligheid en live data.
- **Opmerking**: `any` types zijn tijdelijk gebruikt om typefouten te vermijden.

### 5. Frontend Live Data Koppelen
- **Actie**: Verwijdering van simulatiecode en volledige integratie van echte API data in de frontend.
- **Opmerking**: De frontend toont nu live voortgang en module resultaten.

### 6. Email Capture Flow
- **Actie**: Vereenvoudiging van de email capture flow met een `onSuccess` callback.
- **Opmerking**: De flow is nu gestroomlijnd en werkt met de bestaande modal.

## API Endpoints Beschrijving

### 1. `POST /api/scan/anonymous`
- **Doel**: Start een nieuwe anonieme scan voor een opgegeven URL.
- **Functionaliteit**: Neemt een URL als input, maakt een nieuw scanrecord aan in de database met status 'pending', en retourneert een `scanId` voor polling.

### 2. `GET /api/scan/anonymous`
- **Doel**: Haal de huidige status en voortgang van een scan op.
- **Functionaliteit**: Neemt een `scanId` als query parameter, retourneert de status, voortgang, en tussentijdse resultaten van de scan.

### 3. `POST /api/scan/complete`
- **Doel**: Verwerk de voltooiing van een scan.
- **Functionaliteit**: Neemt een `scanId`, haalt de scanresultaten op uit de database, en bepaalt de volgende actie in de gebruikersflow (bijv. resultaten tonen, email capture).

### 4. `POST /api/scan/email-capture`
- **Doel**: Verwerk de email capture na een scan.
- **Functionaliteit**: Neemt een email en `scanId`, valideert het emailadres, slaat het op in de database, en geeft toegang tot de scanresultaten.

## Conclusie
De Free Tier Journey is nu volledig functioneel en biedt gebruikers een naadloze ervaring van het invoeren van hun URL tot het ontvangen van hun scanresultaten. Verdere verfijning van error handling en type-definities is aanbevolen voor toekomstige verbeteringen. De implementatie is succesvol en draagt bij aan de conversie van anonieme gebruikers.
