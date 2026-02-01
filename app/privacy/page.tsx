/**
 * Privacy Policy Page
 * 
 * Information about how we collect, use, and protect user data.
 */

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Privacy Policy | Your App',
  description: 'Learn how we collect, use, and protect your personal information.',
}

export default async function PrivacyPage() {
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
            <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2024</p>
            
            <div className="prose prose-gray max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy will inform you about how we look after your personal data 
                  when you visit our website and tell you about your privacy rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may collect, use, store and transfer different kinds of personal data about 
                  you which we have grouped together as follows:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Identity Data:</strong> first name, last name, username</li>
                  <li><strong>Contact Data:</strong> email address</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, time zone</li>
                  <li><strong>Usage Data:</strong> information about how you use our website</li>
                  <li><strong>Profile Data:</strong> your preferences, feedback, and survey responses</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We will only use your personal data when the law allows us to. Most commonly, 
                  we will use your personal data in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>To register you as a new customer</li>
                  <li>To process and deliver your orders</li>
                  <li>To manage your relationship with us</li>
                  <li>To improve our website, products/services, and customer relationships</li>
                  <li>To recommend products or services that may interest you</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We have put in place appropriate security measures to prevent your personal 
                  data from being accidentally lost, used, or accessed in an unauthorized way. 
                  We limit access to your personal data to those employees, agents, contractors, 
                  and other third parties who have a business need to know.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We will only retain your personal data for as long as necessary to fulfill 
                  the purposes we collected it for, including for the purposes of satisfying 
                  any legal, accounting, or reporting requirements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Your Legal Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Under certain circumstances, you have rights under data protection laws in 
                  relation to your personal data, including the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Request access to your personal data</li>
                  <li>Request correction of your personal data</li>
                  <li>Request erasure of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing your personal data</li>
                  <li>Request transfer of your personal data</li>
                  <li>Right to withdraw consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website uses cookies to distinguish you from other users. This helps us 
                  provide you with a good experience when you browse our website and also allows 
                  us to improve our site. By continuing to browse the site, you are agreeing to 
                  our use of cookies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of 
                  any changes by posting the new privacy policy on this page and updating the 
                  &quot;last updated&quot; date at the top of this privacy policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this privacy policy or our privacy practices, 
                  please contact us at{' '}
                  <a href="mailto:privacy@yourapp.com" className="text-primary hover:underline">
                    privacy@yourapp.com
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
