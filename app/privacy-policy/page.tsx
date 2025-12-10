import { HeroHeader } from "@/components/header"
import { auth } from "@/lib/auth/auth"

export default async function PrivacyPolicyPage() {
  const session = await auth()
  
  return (
    <>
      <HeroHeader isLoggedIn={!!session?.user} />
      <div>Privacy Policy</div>
    </>
  )
}