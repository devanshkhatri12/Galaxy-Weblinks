/**
 * Terms of Service Page
 * 
 * Legal terms and conditions for using the application.
 */

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Terms of Service | Your App',
  description: 'Read our terms of service and conditions for using our platform.',
}

export default async function TermsPage() {
  // Check if user is logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()
    
    userProfile = {
      email: user.email!,
      firstName: profile?.first_name || undefined,
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={userProfile} />
      
      <main className="flex-1 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2024</p>
            
            <div className="prose prose-gray max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using this service, you accept and agree to be bound by the terms 
                  and provisions of this agreement. If you do not agree to abide by these terms, 
                  please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily access the materials (information or software) 
                  on our website for personal, non-commercial transitory viewing only. This is the 
                  grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or other proprietary notations</li>
                  <li>Transfer the materials to another person</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you create an account with us, you must provide accurate, complete, and 
                  current information. Failure to do so constitutes a breach of the Terms. You are 
                  responsible for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Safeguarding the password that you use to access the service</li>
                  <li>Any activities or actions under your account</li>
                  <li>Notifying us immediately upon becoming aware of any breach of security</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Prohibited Activities</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may not access or use the service for any purpose other than that for which 
                  we make the service available. The service may not be used in connection with any 
                  commercial endeavors except those that are specifically endorsed or approved by us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The materials on our website are provided on an &apos;as is&apos; basis. We make no 
                  warranties, expressed or implied, and hereby disclaim and negate all other 
                  warranties including, without limitation, implied warranties or conditions of 
                  merchantability, fitness for a particular purpose, or non-infringement of 
                  intellectual property or other violation of rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Limitations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall we or our suppliers be liable for any damages (including, 
                  without limitation, damages for loss of data or profit, or due to business 
                  interruption) arising out of the use or inability to use the materials on our 
                  website, even if we or an authorized representative has been notified orally or 
                  in writing of the possibility of such damage.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Revisions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may revise these terms of service at any time without notice. By using this 
                  website you are agreeing to be bound by the then current version of these terms 
                  of service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Questions about the Terms of Service should be sent to us at{' '}
                  <a href="mailto:legal@yourapp.com" className="text-primary hover:underline">
                    legal@yourapp.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
