import React from 'react'
import { Card, CardTitle, CardHeader, CardContent } from './ui/card'

const FeatureCard = ({ title, iconSrc, iconAlt, children }) => (
  <Card className="w-full md:flex-1 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up">
    <CardHeader className="flex flex-row items-center gap-3 pb-3">
      {iconSrc && <img src={iconSrc} alt={iconAlt} className="w-7 h-7 filter dark:invert" />}
      <CardTitle className='text-2xl font-semibold text-gray-900 dark:text-dark-text'>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 pt-0">
      {children}
    </CardContent>
  </Card>
);

const Features = () => {
  const featuresData = [
    {
      title: "Crime Classification",
      iconSrc: "/images/classification.png",
      iconAlt: "Crime Classification Icon",
      content: [
        "Leverages advanced AI (CLIP model) to analyze crime scene imagery.",
        "Accurately categorizes types of crimes based on visual cues.",
        "Provides rapid initial assessment for investigators."
      ]
    },
    {
      title: "Evidence Extraction",
      iconSrc: "/images/extraction.png",
      iconAlt: "Evidence Extraction Icon",
      content: [
        "Utilizes state-of-the-art YOLOv8 for precise object detection.",
        "Pinpoints critical visual evidence like weapons, fingerprints, or trace items.",
        "Highlights even minute details crucial for case resolution."
      ]
    },
    {
      title: "Insightful Analytics",
      iconSrc: "/images/analysis.png",
      iconAlt: "Analytics Icon",
      content: [
        "Uncovers crime patterns and emerging trends over time.",
        "Tracks frequency of specific evidence types across cases.",
        "Identifies potential cross-case correlations and links."
      ]
    }
  ];

  return (
    <div className='container mx-auto px-4 md:px-10 py-10 md:py-16'>
      <h2 className='font-extrabold text-3xl md:text-4xl mb-10 md:mb-12 text-center text-gray-900 dark:text-dark-text transition-colors duration-300 animate-fade-in-up'>Core Capabilities</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
        {featuresData.map((feature, index) => (
          <FeatureCard 
            key={index} 
            title={feature.title} 
            iconSrc={feature.iconSrc} 
            iconAlt={feature.iconAlt}
          >
            {feature.content.map((point, pIndex) => (
              <p key={pIndex} className='text-base text-gray-700 dark:text-dark-text-secondary transition-colors duration-300'>
                <span className="text-dark-primary font-semibold mr-2">•</span>{point}
              </p>
            ))}
          </FeatureCard>
        ))}
      </div>
    </div>
  )
}

export default Features
