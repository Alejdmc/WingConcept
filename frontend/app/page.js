import Hero from '@/components/sections/Hero'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import WhyUs from '@/components/sections/WhyUs'

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="h-6 bg-white" />
      <section id="featured-products">
        <FeaturedProducts />
      </section>
      <WhyUs />
    </main>
  )
}