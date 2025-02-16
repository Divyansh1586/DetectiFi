import React,{ useRef } from 'react'
import  Navbar  from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import LineSeparator from '@/components/LineSeparator'
import Features from '../components/Features'
import Contributors from '@/components/Contributors'
import Footer from '@/components/Footer'

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
        <HeroSection/>
        <LineSeparator/>
        <div ref={featuresRef}>
          <Features />
        </div>
        <LineSeparator/>
        <div ref={contributorsRef}>
          <Contributors />
        </div>
        <LineSeparator/>
        <div ref = {footerRef}>
          <Footer/>
        </div>
    </>
  )
}

export default Homepage
