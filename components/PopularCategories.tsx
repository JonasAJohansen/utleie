import Link from "next/link"
import { Camera, Car, Drill, Gamepad, Guitar, Laptop, Mountain, Shirt, Tent, Tv } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    name: "Elektronikk",
    icon: Laptop,
    itemCount: "2,534",
    href: "/category/electronics",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    name: "Verktøy",
    icon: Drill,
    itemCount: "1,826",
    href: "/category/tools",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    name: "Kjøretøy",
    icon: Car,
    itemCount: "943",
    href: "/category/vehicles",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    name: "Kameraer",
    icon: Camera,
    itemCount: "1,292",
    href: "/category/cameras",
    color: "text-pink-500",
    bgColor: "bg-pink-50",
  },
  {
    name: "Spill",
    icon: Gamepad,
    itemCount: "2,114",
    href: "/category/gaming",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    name: "Musikk",
    icon: Guitar,
    itemCount: "876",
    href: "/category/music",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    name: "Camping",
    icon: Tent,
    itemCount: "1,543",
    href: "/category/camping",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  {
    name: "Sport",
    icon: Mountain,
    itemCount: "2,765",
    href: "/category/sports",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    name: "Klær",
    icon: Shirt,
    itemCount: "3,987",
    href: "/category/clothing",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
  {
    name: "Underholdning",
    icon: Tv,
    itemCount: "1,654",
    href: "/category/entertainment",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
  },
]

export function PopularCategories() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Populære kategorier</h2>
            <p className="text-muted-foreground">Finn det du trenger fra våre mest populære kategorier</p>
          </div>
          <Link href="/categories" className="text-[#4CD964] hover:underline font-medium">
            Se alle kategorier
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-lg ${category.bgColor} ${category.color} flex items-center justify-center mb-4`}
                  >
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.itemCount} gjenstander</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 