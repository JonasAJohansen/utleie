import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Mail, FileText, Search, Shield, CreditCard, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hjelp og kundestøtte | Price Tag',
  description: 'Få hjelp med Price Tag - Finn svar på vanlige spørsmål eller kontakt vårt kundestøtteteam.',
}

export default function HelpPage() {
  const faqCategories = [
    {
      title: "Kom i gang",
      icon: <User className="h-6 w-6" />,
      questions: [
        { q: "Hvordan registrerer jeg meg?", a: "Du kan registrere deg ved å klikke på 'Registrer deg' øverst på siden. Du kan bruke e-post eller sosiale medier." },
        { q: "Hvordan søker jeg etter gjenstander?", a: "Bruk søkefeltet på forsiden eller bla gjennom kategoriene. Du kan filtrere på pris, lokasjon og tilgjengelighet." },
        { q: "Hvordan lager jeg en annonse?", a: "Klikk på 'Lei ut dine ting' og følg instruksjonene. Last opp bilder, skriv en beskrivelse og sett en pris." },
      ]
    },
    {
      title: "Leie av gjenstander",
      icon: <Search className="h-6 w-6" />,
      questions: [
        { q: "Hvordan sender jeg en leieforespørsel?", a: "Gå til gjenstandens side og klikk 'Send forespørsel'. Velg datoer og skriv en melding til eieren." },
        { q: "Hvor lenge tar det før jeg får svar?", a: "De fleste eiere svarer innen 24 timer. Du får en varsling når eieren svarer." },
        { q: "Kan jeg avbestille en forespørsel?", a: "Ja, du kan avbestille før eieren har godkjent forespørselen din." },
      ]
    },
    {
      title: "Betalinger og sikkerhet",
      icon: <CreditCard className="h-6 w-6" />,
      questions: [
        { q: "Hvordan fungerer betalingen?", a: "Vi bruker sikre betalingsmetoder. Betaling holdes i escrow til utleien er fullført." },
        { q: "Er utleiene forsikret?", a: "Ja, alle utleier er automatisk forsikret gjennom vår partner." },
        { q: "Hva skjer hvis noe går galt?", a: "Kontakt kundeservice umiddelbart. Vi har rutiner for å håndtere skader og konflikter." },
      ]
    },
    {
      title: "Utleie av gjenstander",
      icon: <Shield className="h-6 w-6" />,
      questions: [
        { q: "Hvordan setter jeg prisen?", a: "Se på lignende gjenstander for å få en idé om markedsprisen. Du kan alltid justere prisen senere." },
        { q: "Må jeg være hjemme ved henting?", a: "Det avhenger av deg og leietaker. Dere kan avtale møtested og tid som passer begge." },
        { q: "Hva hvis leietaker ikke leverer tilbake?", a: "Kontakt oss umiddelbart. Vi har systemer for å håndtere slike situasjoner." },
      ]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
          Hvordan kan vi hjelpe deg?
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Finn svar på vanlige spørsmål eller ta kontakt med vårt kundestøtteteam.
        </p>
        
        {/* Search Box */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Søk i hjelpeartikler..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4CD964] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E7F9EF] text-[#4CD964] mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Live chat</h3>
            <p className="text-gray-600 mb-4">Få hjelp med en gang fra vårt supportteam</p>
            <Button className="bg-[#4CD964] hover:bg-[#3DAF50]">Start chat</Button>
          </CardContent>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E7F9EF] text-[#4CD964] mb-4">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">E-post</h3>
            <p className="text-gray-600 mb-4">Send oss en melding, vi svarer innen 24 timer</p>
            <Button variant="outline" className="border-[#4CD964] text-[#4CD964]" asChild>
              <a href="mailto:hjelp@pricetag.no">Send e-post</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E7F9EF] text-[#4CD964] mb-4">
              <Phone className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Telefon</h3>
            <p className="text-gray-600 mb-4">Ring oss på hverdager 09:00-17:00</p>
            <Button variant="outline" className="border-[#4CD964] text-[#4CD964]" asChild>
              <a href="tel:+4712345678">Ring oss</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Vanlige spørsmål</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center text-xl">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#E7F9EF] text-[#4CD964] mr-3">
                    {category.icon}
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {category.questions.map((item, index) => (
                    <details key={index} className="group">
                      <summary className="flex justify-between items-center cursor-pointer py-2 text-gray-900 font-medium hover:text-[#4CD964]">
                        {item.q}
                        <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-2 text-gray-600 leading-relaxed">{item.a}</p>
                    </details>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-[#F2FFF8] rounded-3xl p-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Nyttige lenker</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: "Vilkår og betingelser", href: "/terms", icon: <FileText className="h-6 w-6" /> },
            { title: "Personvernpolicy", href: "/privacy", icon: <Shield className="h-6 w-6" /> },
            { title: "Hvordan det fungerer", href: "/how-it-works", icon: <User className="h-6 w-6" /> },
            { title: "Kontakt oss", href: "/contact", icon: <MessageCircle className="h-6 w-6" /> }
          ].map((link, index) => (
            <Link key={index} href={link.href} className="group">
              <Card className="p-6 text-center hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <CardContent className="p-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#E7F9EF] text-[#4CD964] mb-3 group-hover:bg-[#4CD964] group-hover:text-white transition-colors">
                    {link.icon}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-[#4CD964]">{link.title}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 