import { Metadata } from 'next'
import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Award, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Om oss | Price Tag',
  description: 'Lær mer om Price Tag - Norges ledende platform for leie av gjenstander.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
          Om Price Tag
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Vi gjør det enkelt, trygt og rimelig å leie gjenstander i Norge. 
          Vår misjon er å redusere avfall og spare deg for penger ved å gjøre deling av ressurser tilgjengelig for alle.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <Card className="p-8">
          <CardContent className="p-0">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-[#4CD964] mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Vår misjon</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Å gjøre leie av gjenstander så enkelt som å bestille en bok online. Vi tror på en mer bærekraftig fremtid 
              hvor gjenbruk og deling er normen, ikke unntaket.
            </p>
          </CardContent>
        </Card>

        <Card className="p-8">
          <CardContent className="p-0">
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 text-[#4CD964] mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Våre verdier</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Tillit, bærekraft og fellesskap står i sentrum av alt vi gjør. Vi bygger teknologi som bringer mennesker sammen 
              og skaper verdi for både eiere og leietakere.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="bg-[#F2FFF8] rounded-3xl p-12 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Price Tag i tall</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "500K+", label: "Vellykkede utleier" },
            { number: "100K+", label: "Aktive brukere" },
            { number: "50K+", label: "Gjenstander" },
            { number: "4.9", label: "Gjennomsnittlig vurdering" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-[#4CD964] mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Hvorfor velge Price Tag?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Award className="h-12 w-12" />,
              title: "Pålitelig og trygt",
              description: "Alle utleier er forsikret og vi har omfattende brukervurderinger for å sikre kvalitet."
            },
            {
              icon: <Users className="h-12 w-12" />,
              title: "Stort fellesskap",
              description: "Over 100 000 aktive brukere over hele Norge som deler og leier gjenstander daglig."
            },
            {
              icon: <Heart className="h-12 w-12" />,
              title: "Bærekraftig fremtid",
              description: "Ved å leie istedenfor å kjøpe bidrar du til en mer bærekraftig og miljøvennlig fremtid."
            }
          ].map((feature, index) => (
            <Card key={index} className="p-8 text-center">
              <CardContent className="p-0">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E7F9EF] text-[#4CD964] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="text-center bg-white rounded-3xl p-12 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Har du spørsmål?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Vi er her for å hjelpe deg. Ta kontakt med vårt kundestøtteteam.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="mailto:hei@pricetag.no" 
            className="inline-flex items-center justify-center px-8 py-3 bg-[#4CD964] text-white rounded-xl hover:bg-[#3DAF50] transition-colors"
          >
            Send e-post
          </a>
          <a 
            href="/help" 
            className="inline-flex items-center justify-center px-8 py-3 border border-[#4CD964] text-[#4CD964] rounded-xl hover:bg-[#4CD964]/10 transition-colors"
          >
            Hjelpesenter
          </a>
        </div>
      </div>
    </div>
  )
} 