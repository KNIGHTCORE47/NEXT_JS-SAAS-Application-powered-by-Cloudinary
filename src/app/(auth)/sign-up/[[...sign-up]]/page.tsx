"use client"

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className='min-h-screen bg-base-100 flex items-center justify-center'>
      <SignUp />
    </div>
  )
}