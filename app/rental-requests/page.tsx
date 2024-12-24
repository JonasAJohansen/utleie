import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { RentalRequestsList } from "../../components/RentalRequestsList"
import React from "react"

export default async function RentalRequestsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Rental Requests</h1>
      <RentalRequestsList userId={userId} />
    </div>
  )
} 