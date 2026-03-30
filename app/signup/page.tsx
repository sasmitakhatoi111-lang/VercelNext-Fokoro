import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new Fokoro account',
}

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
          <p className="text-muted-foreground mt-2">
            Join Fokoro to ask questions and share knowledge
          </p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
