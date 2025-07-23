# Price Tag - Rental Marketplace

En moderne utleieplattform der folk kan leie ut og låne gjenstander i nærheten.

## Nye Funksjoner 🆕

### GIS Bot for Gratis Gjenstander
Vi har implementert en intelligent GIS-basert assistent som aktiveres når noen oppretter en annonse for gratis gjenstander (pris = 0 kr).

**Hvordan det fungerer:**
1. Når en bruker setter prisen til 0 kr i "Legg ut ny annonse", aktiveres GIS-assistenten automatisk
2. Assistenten analyserer området rundt brukeren og foreslår trygge, offentlige steder for utdeling
3. Forslag inkluderer bibliotek, parker, transportknutepunkter og andre offentlige plasser
4. Brukeren kan velge et foreslått sted eller velge sitt eget

**Funksjoner:**
- ✅ Automatisk aktivering ved gratis gjenstander (pris = 0)
- ✅ Intelligente stedsforslag basert på gjenstandstype
- ✅ Trygghetstips for møteplasser
- ✅ Mulighet for egendefinert sted
- ✅ Integrert med eksisterende lokalitetsvelger
- ✅ Filter for kun gratis gjenstander i søk

**Teknisk implementering:**
- Database: Lagt til `is_free` kolonne i `listings` tabellen
- Frontend: Ny `GISBot` komponent i `/components/gis/`
- API: Oppdatert listings endpoint for å håndtere gratis gjenstander
- Søk: Nytt filter for gratis gjenstander

### Tekniske Endringer

#### Database Migrering
```sql
-- Kjør migreringen for å legge til støtte for gratis gjenstander
node scripts/migrate-free-items.js
```

#### Nye Komponenter
- `components/gis/GISBot.tsx` - Hovedkomponent for GIS-assistenten
- `components/ui/price-display.tsx` - Forbedret prisvisning med gratis-merking

#### API Endringer
- `app/api/listings/route.ts` - Støtte for `is_free` feltet
- Søkefiltre oppdatert for gratis gjenstander

## Oppstart

1. Installer avhengigheter:
```bash
npm install
```

2. Kjør migrering for gratis gjenstander:
```bash
node scripts/migrate-free-items.js
```

3. Start utviklingsserver:
```bash
npm run dev
```

## Bruk

### For å lage en gratis annonse:
1. Gå til "Legg ut ny annonse"
2. Fyll ut gjenstandsinfo
3. Sett pris til **0 kr**
4. GIS-assistenten åpnes automatisk
5. Velg foreslått sted eller legg inn eget
6. Fullfør annonsen

### For å finne gratis gjenstander:
1. Gå til søkesiden
2. Aktiver "Kun gratis gjenstander" filteret
3. Bla gjennom tilgjengelige gratis gjenstander

## Miljøvariabler

Se `.env.example` for nødvendige miljøvariabler for Clerk autentisering og database.

## Teknologier

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Clerk (autentisering)
- Vercel Postgres
- Leaflet (kart)
- Radix UI

## Bidrag

Pull requests er velkomne! For større endringer, vennligst opprett en issue først.
