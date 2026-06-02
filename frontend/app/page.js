import Hero from '@/components/sections/Hero'
import FeaturedProducts from '@/components/sections/FeaturedProducts'

export default function Home() {
  return (
    <main>
      <Hero />
      
      {/* Barra blanca divisor */}
      <div className="h-6 bg-white" />
      
      <section id="featured-products">
        <FeaturedProducts />
      </section>
    </main>
  )
}