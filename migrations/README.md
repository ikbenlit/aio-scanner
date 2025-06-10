# Database Migraties - AIO Scanner

## Setup Instructies

### 1. Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com) en maak een account aan
2. Klik op "New Project"
3. Kies een naam: `aio-scanner`
4. Kies een database wachtwoord en onthoud het goed
5. Selecteer een regio (bij voorkeur Nederland/Europa)

### 2. Environment Variabelen

Maak een `.env` bestand in de project root met:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=your-project-url.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Je vindt deze waarden in je Supabase dashboard onder:
- **Project URL:** Settings → API → Project URL
- **Anon Key:** Settings → API → Project API keys → anon public
- **Service Role Key:** Settings → API → Project API keys → service_role

### 3. Migraties Uitvoeren

**Optie A: Via Supabase Dashboard (Aanbevolen voor ontwikkeling)**
1. Ga naar je Supabase project dashboard
2. Klik op "SQL Editor" in de sidebar  
3. Kopieer de inhoud van `001_create_users_and_scans.sql`
4. Plak in de SQL editor en klik "Run"

**Optie B: Via Supabase CLI**
```bash
# Installeer Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### 4. Verificatie

Na het uitvoeren van de migratie zou je de volgende tabellen moeten zien in je Supabase dashboard:
- `users` - Gebruikersaccounts
- `scans` - Website scan resultaten

### 5. Test de Connectie

Voer `npm run dev` uit en controleer of er geen fouten zijn met de database connectie.

## Migration Files

- `001_create_users_and_scans.sql` - **Phase 1:** Core users en scans tabellen
- `002_add_scan_modules.sql` - **Phase 2:** Real-time module tracking (nog aan te maken)
- `003_add_email_tracking.sql` - **Phase 3:** Email capture en enforcement (nog aan te maken)
- `004_add_payments.sql` - **Phase 4:** Mollie payments en credits (nog aan te maken)  
- `005_add_auth_fields.sql` - **Phase 5:** Supabase Auth integratie (nog aan te maken) 