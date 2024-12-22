import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ClientSideAdminLayout from './ClientSideAdminLayout'
import { clerkClient } from '@clerk/nextjs/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)

  if (!user?.publicMetadata?.role || user.publicMetadata.role !== 'admin') {
    redirect('/')
  }

  return <ClientSideAdminLayout>{children}</ClientSideAdminLayout>
}

