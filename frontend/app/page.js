import Hero from '@/components/sections/Hero'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import WhyUs from '@/components/sections/WhyUs'

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="relative h-10 sm:h-16 bg-black z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-brand"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 100%)' }}
        />
      </div>
      <section id="featured-products">
        <FeaturedProducts />
      </section>
      <WhyUs />
    </main>
  )
}