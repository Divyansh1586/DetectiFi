import React from 'react'
import  Navbar  from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import LineSeparator from '@/components/LineSeparator'
import Features from '../components/Features'
import Contributors from '@/components/Contributors'
import Footer from '@/components/Footer'

const Homepage = () => {
  return (
    <>
        <Navbar/>
        <HeroSection/>
        <LineSeparator/>
        <Features/>
        <LineSeparator/>
        <Contributors/>
        <LineSeparator/>
        <Footer/>
    </>
  )
}

export default Homepage
