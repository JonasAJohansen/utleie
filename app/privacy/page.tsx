import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personvernpolicy | Utleie',
  description: 'Les om hvordan vi behandler dine personopplysninger på Utleie-plattformen',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Personvernpolicy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Innledning</h2>
              <p className="text-gray-700 mb-4">
                Utleie tar ditt personvern på alvor. Denne personvernpolicyen forklarer hvordan vi samler inn, 
                bruker og beskytter dine personopplysninger når du bruker vår plattform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Hvilke opplysninger vi samler</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">Informasjon du gir oss</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Navn, e-postadresse og telefonnummer</li>
                <li>Profilinformasjon og bilder</li>
                <li>Betalingsinformasjon (behandles av sikre tredjeparts betalingstjenester)</li>
                <li>Produktbeskrivelser og bilder du laster opp</li>
                <li>Kommunikasjon med andre brukere</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Informasjon vi samler automatisk</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>IP-adresse og enhetsinformasjon</li>
                <li>Nettleserstype og versjon</li>
                <li>Bruksmønstre og navigasjon på plattformen</li>
                <li>Lokasjonsinformasjon (med ditt samtykke)</li>
                <li>Cookies og lignende teknologier</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Hvordan vi bruker informasjonen</h2>
              <p className="text-gray-700 mb-4">
                Vi bruker dine personopplysninger til å:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Levere og forbedre våre tjenester</li>
                <li>Behandle transaksjoner og betalinger</li>
                <li>Kommunisere med deg om bookinger og kontoaktivitet</li>
                <li>Gi kundesupport</li>
                <li>Forhindre svindel og misbruk</li>
                <li>Sende deg relevante oppdateringer og markedsføring (med samtykke)</li>
                <li>Overholde juridiske forpliktelser</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Deling av informasjon</h2>
              <p className="text-gray-700 mb-4">
                Vi deler dine personopplysninger i følgende tilfeller:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Med andre brukere:</strong> Nødvendig kontaktinformasjon for å gjennomføre leietransaksjoner</li>
                <li><strong>Med tjenesteleverandører:</strong> Betaling, hosting, analyse og andre nødvendige tjenester</li>
                <li><strong>Ved juridisk krav:</strong> Når det kreves av lov eller myndigheter</li>
                <li><strong>Ved virksomhetsoverdragelse:</strong> I forbindelse med salg eller sammenslåing av selskapet</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Vi selger aldri dine personopplysninger til tredjeparter for markedsføringsformål.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Datasikkerhet</h2>
              <p className="text-gray-700 mb-4">
                Vi implementerer tekniske og organisatoriske sikkerhetstiltak for å beskytte dine personopplysninger:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Kryptering av data under overføring og lagring</li>
                <li>Sikker autentisering og tilgangskontroll</li>
                <li>Regelmessige sikkerhetsvurderinger</li>
                <li>Begrenset tilgang til personopplysninger basert på behov</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
              <p className="text-gray-700 mb-4">
                Vi bruker cookies og lignende teknologier for å:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Holde deg innlogget</li>
                <li>Huske dine preferanser</li>
                <li>Analysere bruk av plattformen</li>
                <li>Forbedre brukeropplevelsen</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Du kan administrere cookie-innstillinger gjennom nettleseren din.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Dine rettigheter</h2>
              <p className="text-gray-700 mb-4">
                I henhold til GDPR har du følgende rettigheter:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Tilgangsrett:</strong> Be om kopi av dine personopplysninger</li>
                <li><strong>Retting:</strong> Be om retting av unøyaktige opplysninger</li>
                <li><strong>Sletting:</strong> Be om sletting av dine personopplysninger</li>
                <li><strong>Begrensning:</strong> Be om begrensning av behandlingen</li>
                <li><strong>Dataportabilitet:</strong> Få dine opplysninger i et strukturert format</li>
                <li><strong>Innsigelse:</strong> Protestere mot behandling av dine opplysninger</li>
                <li><strong>Tilbaketrekking:</strong> Trekke tilbake samtykke når som helst</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Dataoppbevaring</h2>
              <p className="text-gray-700 mb-4">
                Vi oppbevarer dine personopplysninger så lenge det er nødvendig for å:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Levere våre tjenester</li>
                <li>Overholde juridiske forpliktelser</li>
                <li>Løse tvister</li>
                <li>Håndheve våre avtaler</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Når du sletter kontoen din, vil vi anonymisere eller slette dine personopplysninger, 
                med unntak av informasjon vi er pålagt å oppbevare av juridiske årsaker.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Internasjonale overføringer</h2>
              <p className="text-gray-700 mb-4">
                Dine personopplysninger kan behandles i land utenfor EØS. Vi sikrer at slike overføringer 
                skjer i samsvar med gjeldende lovgivning og med passende beskyttelse.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Mindreårige</h2>
              <p className="text-gray-700 mb-4">
                Våre tjenester er ikke rettet mot personer under 18 år. Vi samler ikke bevisst 
                personopplysninger fra mindreårige uten foreldresamtykke.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Endringer i personvernpolicyen</h2>
              <p className="text-gray-700 mb-4">
                Vi kan oppdatere denne personvernpolicyen fra tid til annen. Vi vil varsle deg om 
                vesentlige endringer via e-post eller gjennom plattformen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Kontakt oss</h2>
              <p className="text-gray-700 mb-4">
                Hvis du har spørsmål om denne personvernpolicyen eller ønsker å utøve dine rettigheter, 
                kan du kontakte oss på:
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Personvernansvarlig:</strong><br />
                E-post: privacy@utleie.no<br />
                Telefon: +47 123 45 678<br />
                Adresse: [Adresse til selskapet]
              </p>
              <p className="text-gray-700">
                Du har også rett til å klage til Datatilsynet hvis du mener vi behandler 
                dine personopplysninger i strid med loven.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 