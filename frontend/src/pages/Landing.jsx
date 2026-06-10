import Header from '../components/Header'
import Hero from '../components/Hero'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="flex min-h-svh flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
      </main>
      <Footer />
    </div>
  )
}
