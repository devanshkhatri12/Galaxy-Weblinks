/**
 * About Page
 * 
 * Information about the company/application.
 * Includes mission, values, and team information.
 */

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Target, Heart, Lightbulb, Users } from 'lucide-react'

export const metadata = {
  title: 'About Us | Your App',
  description: 'Learn more about our mission, values, and the team behind the product.',
}

// Company values
const values = [
  {
    icon: Target,
    title: 'Mission Driven',
    description: 'We are focused on delivering value and making a positive impact for our users.',
  },
  {
    icon: Heart,
    title: 'User First',
    description: 'Every decision we make starts with how it will benefit our users.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We constantly push boundaries to deliver cutting-edge solutions.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We believe in building together and supporting each other.',
  },
]

export default async function AboutPage() {
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
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                About Us
              </h1>
              <p className="mt-6 text-lg text-muted-foreground text-pretty">
                We are passionate about creating tools that help people and businesses 
                succeed in the digital age.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Our Story</h2>
              <div className="prose prose-lg text-muted-foreground">
                <p>
                  Founded with a vision to simplify complex processes, we started our journey 
                  with a simple goal: to create software that people actually enjoy using.
                </p>
                <p className="mt-4">
                  Over the years, we have grown from a small team of enthusiasts into a 
                  company that serves thousands of users worldwide. But our core values 
                  remain the same - putting users first, embracing innovation, and building 
                  a supportive community.
                </p>
                <p className="mt-4">
                  Today, we continue to push the boundaries of what is possible, constantly 
                  improving our platform to meet the evolving needs of our users.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Our Values</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              {values.map((value) => (
                <Card key={value.title} className="border-0 shadow-md text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3 max-w-3xl mx-auto text-center">
              <div>
                <div className="text-4xl font-bold text-primary">10K+</div>
                <div className="mt-2 text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">99.9%</div>
                <div className="mt-2 text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">24/7</div>
                <div className="mt-2 text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
