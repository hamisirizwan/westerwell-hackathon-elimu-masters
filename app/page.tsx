import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import { PopularCourses } from "@/components/popular-courses";
import { auth } from "@/lib/auth/auth";

export default async function Home() {
  const session = await auth();
  
  return (
     <>
     <HeroHeader isLoggedIn={!!session?.user} />
     <HeroSection />
     <PopularCourses />
     </>
  );
}
