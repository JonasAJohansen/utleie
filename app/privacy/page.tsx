import { Metadata } from 'next'
import { Shield, Eye, Lock, Users, FileText, CheckCircle, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { AnimatedSection } from '@/app/components/AnimatedSection'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Personvernpolicy | Utleie',
  description: 'Les om hvordan vi behandler dine personopplysninger på Utleie-plattformen',
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  delay?: number
}

function PolicySection({ icon, title, children, delay = 0 }: SectionProps) {
  return (
    <AnimatedSection
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="p-8 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </AnimatedSection>
  )
}

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-emerald-600 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700" />
        <div className="relative max-w-6xl mx-auto px-4 py-24">
          <AnimatedSection
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <Shield className="h-6 w-6" />
              <span className="font-medium">GDPR Compliant</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Personvernpolicy
            </h1>
            
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto mb-8">
              Vi respekterer ditt privatliv og beskytter dine personopplysninger med høyeste sikkerhetsstandarder
            </p>
            
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 text-sm">
              Sist oppdatert: {lastUpdated}
            </Badge>
          </AnimatedSection>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-10">
        <AnimatedSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="p-8 bg-white shadow-xl border-0">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sikker lagring</h3>
                <p className="text-gray-600">All data krypteres og lagres sikkert</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Full transparens</h3>
                <p className="text-gray-600">Du har full kontroll over dine data</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">GDPR-kompatibel</h3>
                <p className="text-gray-600">Følger alle europeiske personvernregler</p>
              </div>
            </div>
          </Card>
        </AnimatedSection>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-8">
        
        <PolicySection 
          icon={<FileText className="h-6 w-6" />} 
          title="Innledning"
          delay={0.1}
        >
          <p className="text-gray-700 text-lg leading-relaxed">
            Utleie tar ditt personvern på alvor. Denne personvernpolicyen forklarer hvordan vi samler inn, 
            bruker og beskytter dine personopplysninger når du bruker vår plattform. Vi følger strenge 
            sikkerhetsstandarder og gir deg full kontroll over dine data.
          </p>
        </PolicySection>

        <PolicySection 
          icon={<Users className="h-6 w-6" />} 
          title="Hvilke opplysninger vi samler"
          delay={0.2}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Informasjon du gir oss
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Navn, e-postadresse og telefonnummer",
                  "Profilinformasjon og bilder",
                  "Betalingsinformasjon (sikker behandling)",
                  "Produktbeskrivelser og bilder",
                  "Kommunikasjon med andre brukere"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Informasjon vi samler automatisk
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "IP-adresse og enhetsinformasjon",
                  "Nettleserstype og versjon",
                  "Bruksmønstre og navigasjon",
                  "Lokasjonsinformasjon (med samtykke)",
                  "Cookies og lignende teknologier"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PolicySection>

        <PolicySection 
          icon={<Shield className="h-6 w-6" />} 
          title="Hvordan vi bruker informasjonen"
          delay={0.3}
        >
          <p className="text-gray-700 mb-6 text-lg">
            Vi bruker dine personopplysninger utelukkende for å levere bedre tjenester:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Levere og forbedre våre tjenester",
              "Behandle transaksjoner og betalinger",
              "Kommunisere om bookinger og aktivitet",
              "Gi kundesupport",
              "Forhindre svindel og misbruk",
              "Sende relevante oppdateringer",
              "Overholde juridiske forpliktelser"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-emerald-300 transition-colors">
                <ArrowRight className="h-5 w-5 text-emerald-500" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </PolicySection>

        <PolicySection 
          icon={<Lock className="h-6 w-6" />} 
          title="Datasikkerhet"
          delay={0.4}
        >
          <div className="space-y-6">
            <p className="text-gray-700 text-lg">
              Vi implementerer tekniske og organisatoriske sikkerhetstiltak av høyeste standard:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-3">Teknisk sikkerhet</h4>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li>• Kryptering av data (AES-256)</li>
                  <li>• Sikker autentisering (OAuth)</li>
                  <li>• HTTPS for all kommunikasjon</li>
                </ul>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">Organisatorisk sikkerhet</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Begrenset tilgang basert på behov</li>
                  <li>• Regelmessige sikkerhetsvurderinger</li>
                  <li>• Opplæring av ansatte</li>
                </ul>
              </Card>
            </div>
          </div>
        </PolicySection>

        <PolicySection 
          icon={<CheckCircle className="h-6 w-6" />} 
          title="Dine rettigheter"
          delay={0.5}
        >
          <p className="text-gray-700 mb-6 text-lg">
            I henhold til GDPR har du omfattende rettigheter over dine personopplysninger:
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Tilgangsrett", desc: "Be om kopi av dine data" },
              { title: "Retting", desc: "Rett opp feil informasjon" },
              { title: "Sletting", desc: "Be om sletting av data" },
              { title: "Begrensning", desc: "Begrens behandlingen" },
              { title: "Dataportabilitet", desc: "Få data i strukturert format" },
              { title: "Innsigelse", desc: "Protester mot behandling" }
            ].map((right, index) => (
              <Card key={index} className="p-4 border-gray-200 bg-gray-50 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">{right.title}</h4>
                <p className="text-sm text-gray-700">{right.desc}</p>
              </Card>
            ))}
          </div>
        </PolicySection>

        {/* Contact Section */}
        <AnimatedSection
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-8 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Har du spørsmål?</h2>
              <p className="text-emerald-100 text-lg">
                Vi er her for å hjelpe deg med alle personvernrelaterte spørsmål
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6" />
                </div>
                <p className="font-medium">E-post</p>
                <p className="text-emerald-100">privacy@utleie.no</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6" />
                </div>
                <p className="font-medium">Telefon</p>
                <p className="text-emerald-100">+47 123 45 678</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6" />
                </div>
                <p className="font-medium">Personvernansvarlig</p>
                <p className="text-emerald-100">Tilgjengelig 9-17</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button variant="secondary" size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                Kontakt oss
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </AnimatedSection>

        {/* Additional Sections - Condensed */}
        <div className="grid md:grid-cols-2 gap-8">
          <PolicySection 
            icon={<FileText className="h-5 w-5" />} 
            title="Dataoppbevaring"
            delay={0.7}
          >
            <p className="text-gray-700">
              Vi oppbevarer data kun så lenge det er nødvendig for å levere tjenester, 
              overholde juridiske forpliktelser og løse eventuelle tvister. Ved sletting 
              av konto anonymiseres eller slettes personopplysninger.
            </p>
          </PolicySection>

          <PolicySection 
            icon={<Shield className="h-5 w-5" />} 
            title="Mindreårige"
            delay={0.8}
          >
            <p className="text-gray-700">
              Våre tjenester er ikke rettet mot personer under 18 år. Vi samler ikke 
              bevisst personopplysninger fra mindreårige uten foreldresamtykke og 
              følger strenge retningslinjer for beskyttelse av barn online.
            </p>
          </PolicySection>
        </div>

        {/* Compliance Footer */}
        <AnimatedSection
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Card className="p-6 bg-gray-50 border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Du har også rett til å klage til <strong>Datatilsynet</strong> hvis du mener vi behandler 
                dine personopplysninger i strid med loven.
              </p>
              <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
                <span>• GDPR Compliant</span>
                <span>• Sikker behandling</span>
                <span>• Full transparens</span>
              </div>
            </div>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  )
}