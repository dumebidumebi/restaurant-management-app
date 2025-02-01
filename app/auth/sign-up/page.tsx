import { SignUp, useUser } from '@clerk/nextjs'

export default function Page() {
  const { user } = useUser()

  if (!user) {
    return <SignUp />
  }

  return <div>Welcome!</div>
}