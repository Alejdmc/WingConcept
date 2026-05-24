import Hero from '@/components/sections/Hero'
import Catalog from '@/components/sections/Catalog' // Asumiendo que crearás este componente

export default function Home() {
  return (
    <main>
      <Hero />
      
      {/* El ID aquí conecta con el href="/#paramotors-section" del Navbar */}
      <section id="paramotors-section" >
        <Catalog />
      </section>
    </main>
  )
}