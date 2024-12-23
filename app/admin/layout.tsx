import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ClientSideAdminLayout from './ClientSideAdminLayout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  // The middleware will handle the admin role check
  // If we get here, the user is already verified as an admin

  return <ClientSideAdminLayout>{children}</ClientSideAdminLayout>
}

