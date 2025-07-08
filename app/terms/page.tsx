import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vilkår for bruk | Utleie',
  description: 'Les våre vilkår for bruk av Utleie-plattformen',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Vilkår for bruk</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aksept av vilkår</h2>
              <p className="text-gray-700 mb-4">
                Ved å bruke Utleie-plattformen aksepterer du disse vilkårene i sin helhet. Hvis du ikke aksepterer vilkårene, 
                kan du ikke bruke tjenesten.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Tjenestebeskrivelse</h2>
              <p className="text-gray-700 mb-4">
                Utleie er en plattform som forbinder personer som ønsker å leie ut ting med personer som ønsker å leie. 
                Vi tilbyr ikke forsikring eller garantier for produktene som leies ut.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Brukerkontoer</h2>
              <p className="text-gray-700 mb-4">
                For å bruke plattformen må du opprette en brukerkonto. Du er ansvarlig for å holde kontoinformasjonen din 
                oppdatert og sikker. Du er ansvarlig for all aktivitet som skjer under din konto.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Utleiers ansvar</h2>
              <p className="text-gray-700 mb-4">
                Som utleier er du ansvarlig for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Å gi nøyaktige beskrivelser av dine produkter</li>
                <li>Å opprettholde produktene i god stand</li>
                <li>Å levere produkter til avtalt tid og sted</li>
                <li>Å respondere på forespørsler innen rimelig tid</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Leiers ansvar</h2>
              <p className="text-gray-700 mb-4">
                Som leier er du ansvarlig for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Å behandle leide produkter med omhu</li>
                <li>Å returnere produkter i samme stand som mottatt</li>
                <li>Å betale avtalt leiesum til avtalt tid</li>
                <li>Å erstatte skader eller tap som oppstår under leieperioden</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Betaling og avgifter</h2>
              <p className="text-gray-700 mb-4">
                Utleie tar en serviceavgift på 5% av leiesummen for hver transaksjon. Betaling skjer gjennom godkjente 
                betalingsløsninger på plattformen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Avbestilling</h2>
              <p className="text-gray-700 mb-4">
                Avbestillingsregler avhenger av den enkelte utleiers policy. Generelt gjelder følgende:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Avbestilling mer enn 24 timer før: Full refusjon</li>
                <li>Avbestilling mindre enn 24 timer før: 50% refusjon</li>
                <li>Avbestilling samme dag: Ingen refusjon</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Forbudt bruk</h2>
              <p className="text-gray-700 mb-4">
                Det er forbudt å bruke plattformen til:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Ulovlige aktiviteter</li>
                <li>Å leie ut farlige eller ulovlige gjenstander</li>
                <li>Svindel eller misvisende informasjon</li>
                <li>Å omgå plattformens betalingssystem</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Ansvarsbegrensning</h2>
              <p className="text-gray-700 mb-4">
                Utleie er ikke ansvarlig for skader, tap eller problemer som oppstår mellom brukere. Vi tilbyr plattformen 
                "som den er" uten garantier. Vårt ansvar er begrenset til den serviceavgiften vi har mottatt for den 
                aktuelle transaksjonen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Endringer av vilkår</h2>
              <p className="text-gray-700 mb-4">
                Vi forbeholder oss retten til å endre disse vilkårene når som helst. Endringer vil bli kommunisert via 
                e-post eller gjennom plattformen. Fortsatt bruk etter endringer betyr aksept av nye vilkår.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Gjeldende lov</h2>
              <p className="text-gray-700 mb-4">
                Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal løses ved norske domstoler.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Kontakt</h2>
              <p className="text-gray-700 mb-4">
                Hvis du har spørsmål om disse vilkårene, kan du kontakte oss på:
              </p>
              <p className="text-gray-700">
                E-post: support@utleie.no<br />
                Telefon: +47 123 45 678
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 