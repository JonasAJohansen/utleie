import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function CategoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-4xl font-bold mb-4">Category or Subcategory Not Found</h1>
      <p className="text-xl mb-8">Sorry, we couldn&apos;t find the category or subcategory you&apos;re looking for.</p>
      <Button asChild>
        <Link href="/">
          Return to Home
        </Link>
      </Button>
    </div>
  )
}
