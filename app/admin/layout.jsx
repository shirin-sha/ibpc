import Header from '@/components/Header'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function AdminLayout({ children }) {
  // Fetch session once on server - zero client-side delay
  const session = await getServerSession(authOptions);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header session={session} />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  )
}

