/**
 * Homepage
 * 
 * The main landing page of the application.
 * Shows hero section, features, and call-to-action.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import { 
  Shield, 
  Zap, 
  Users, 
  ArrowRight,
  CheckCircle
} from 'lucide-react'

// Feature list for the features section
const features = [
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Enterprise-grade security with encrypted data and secure authentication.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance ensures your experience is always smooth and responsive.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with role-based access and activity tracking.',
  },
]

// Benefits list for the CTA section
const benefits = [
  'Free to get started',
  'No credit card required',
  '24/7 customer support',
  'Cancel anytime',
]

export default async function HomePage() {
  // Check if user is logged in to show appropriate header
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile if logged in
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
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
                Build Something{' '}
                <span className="text-primary">Amazing</span>{' '}
                Today
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl text-pretty">
                A full-stack application starter with authentication, user management, 
                and everything you need to launch your next project quickly.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="text-base">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/sign-up">
                      <Button size="lg" className="text-base">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button size="lg" variant="outline" className="text-base bg-transparent">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                We have built all the essential features so you can focus on what matters most - your business.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of users who trust our platform for their daily operations.
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                {!user && (
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="text-base">
                      Create Free Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
