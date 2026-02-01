/**
 * Contact Page
 *
 * Allows users to send messages/inquiries.
 * Includes a contact form, contact information, and map.
 */

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ContactForm } from "@/components/contact-form";
import { ContactMap } from "@/components/contact-map";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Mail, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us | Your App",
  description: "Get in touch with our team. We are here to help.",
};

// Contact information
const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    content: "support@yourapp.com",
    description: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    title: "Office",
    content: "123 Business Street",
    description: "San Francisco, CA 94102",
  },
  {
    icon: Clock,
    title: "Business Hours",
    content: "Mon - Fri: 9am - 6pm",
    description: "Weekend: By appointment",
  },
];

export default async function ContactPage() {
  // Check if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .single();

    userProfile = {
      email: user.email!,
      firstName: profile?.first_name || undefined,
    };
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
                Contact Us
              </h1>
              <p className="mt-6 text-lg text-muted-foreground text-pretty">
                Have a question or feedback? We would love to hear from you.
                Send us a message and we will respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                <ContactForm userEmail={user?.email} />
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <Card key={info.title} className="border-0 shadow-md">
                      <CardContent className="flex items-start gap-4 pt-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <info.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{info.title}</h3>
                          <p className="text-foreground">{info.content}</p>
                          <p className="text-sm text-muted-foreground">
                            {info.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* FAQ Link */}
                <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">
                    Looking for quick answers?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check out our frequently asked questions or browse our
                    documentation for immediate assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
                Find Us On The Map
              </h2>
              <ContactMap
                title="Our Office Location"
                description="Visit us at our main office in San Francisco"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
