'use client'

import dynamic from 'next/dynamic'

const ClientSideAdminLayout = dynamic(() => import('./ClientSideAdminLayout'), { ssr: false })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientSideAdminLayout>{children}</ClientSideAdminLayout>
}

