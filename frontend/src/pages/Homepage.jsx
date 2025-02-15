import React from 'react'
import  Navbar  from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import LineSeparator from '@/components/LineSeparator'
import Features from '../components/Features'

const Homepage = () => {
  return (
    <>
        <Navbar/>
        <HeroSection/>
        <LineSeparator/>
        <Features/>
        <LineSeparator/>
    </>
  )
}

export default Homepage
