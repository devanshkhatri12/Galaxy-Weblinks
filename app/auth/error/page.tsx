/**
 * Auth Error Page
 * 
 * Displayed when authentication fails or an error occurs.
 * Provides helpful options to recover.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Authentication Error | Your App',
  description: 'An error occurred during authentication',
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground text-sm">
                We encountered an error during authentication. 
                This could happen if:
              </p>
              <ul className="text-sm text-muted-foreground mt-4 space-y-1 text-left list-disc list-inside">
                <li>The link has expired</li>
                <li>The link has already been used</li>
                <li>The link is invalid</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Try logging in</Button>
            </Link>
            <Link href="/auth/forgot-password" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                Request new reset link
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full">
                Go to homepage
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
