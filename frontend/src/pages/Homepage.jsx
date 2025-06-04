import React,{ useRef } from 'react'
import  Navbar  from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import LineSeparator from '@/components/LineSeparator'
import Features from '../components/Features'
import Contributors from '@/components/Contributors'
import Footer from '@/components/Footer'
import Acco from '@/components/Acco'

 
const Homepage = () => {
  const featuresRef = useRef(null)
  const contributorsRef = useRef(null)
  const footerRef = useRef(null)

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <>
        <Navbar scrollToSection={scrollToSection} featuresRef={featuresRef} contributorsRef={contributorsRef} 
        footerRef={footerRef}/>
        <div className="pt-20 bg-white dark:bg-dark-background text-gray-800 dark:text-dark-text min-h-screen transition-colors duration-300">
          <HeroSection/>
          <LineSeparator/>
          <div ref={featuresRef} className="scroll-mt-20">
            <Features />
          </div>
          <LineSeparator/>
          <div ref={contributorsRef} className="scroll-mt-20">
            <Contributors />
          </div>
          <LineSeparator/>
          <Acco/>
          <LineSeparator/>
          <div ref={footerRef} className="scroll-mt-20">
            <Footer/>
          </div>
        </div>
    </>
  )
}

export default Homepage
