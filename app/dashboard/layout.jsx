import Header from '@/components/Header'
import React from 'react'

const layout = ({children}) => {
  return (
//    <SessionProvider>
       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         <Header />
         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           {children}
         </main>
       </div>
    //  </SessionProvider>
  )
}

export default layout