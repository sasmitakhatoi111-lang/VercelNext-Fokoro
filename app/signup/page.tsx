import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/signup-form'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a new Fokoro account',
}

export default function SignupPage() {
  return (
    <div className="container max-w-md py-12 lg:py-20">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground mt-2">
          Join Fokoro to ask questions and share knowledge
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
