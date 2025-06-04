import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
    {
      id: "q1",
      question: "What is DetectiFi, and how does it assist law enforcement?",
      answer: `DetectiFi assists law enforcement by:  
      1. AI-Powered Analysis: Uses advanced AI to analyze crime scenes efficiently, identifying patterns and extracting key evidence from images and videos.
      2. Speed & Accuracy: Significantly reduces forensic investigation time and minimizes human errors in evidence processing.
      3. Automated Scene Processing: Quickly identifies and categorizes crucial evidence, streamlining the initial assessment phase.
      4. Improved Investigations: Provides structured insights and comprehensive summaries, aiding in informed decision-making and lead generation.`
    },
    {
      id: "q2",
      question: "What AI models does DetectiFi use for its analysis?",
      answer: `DetectiFi primarily utilizes: 
      1. CLIP (Contrastive Language-Image Pretraining): For robust crime classification by analyzing visual data from scenes to categorize types of crimes (e.g., robbery, arson).
      2. YOLO (You Only Look Once): For detailed evidence extraction and object detection within images and video frames, identifying items like weapons, specific objects, or unusual activities.`
    },
    {
      id: "q3",
      question: "How does DetectiFi handle data privacy and security?",
      answer: `Data privacy and security are paramount for DetectiFi. 
      1. Secure Uploads: All data is transmitted over encrypted connections.
      2. Access Controls: Role-based access ensures only authorized personnel can view sensitive information.
      3. Compliance Focused: Designed with considerations for data protection regulations relevant to law enforcement agencies. (Note: Specific compliance details depend on deployment and jurisdiction).`
    },
    {
      id: "q4",
      question: "Can DetectiFi integrate with existing law enforcement systems?",
      answer: `DetectiFi is designed with interoperability in mind. 
      1. API Endpoints: Provides APIs for potential integration with existing Case Management Systems (CMS) or evidence databases.
      2. Flexible Data Formats: Supports common image and video formats, and analysis results can be exported in standard formats for reporting and further use.`
    },
    {
      id: "q5",
      question: "What kind of support and training is available for DetectiFi users?",
      answer: `We offer comprehensive support for DetectiFi users: 
      1. Onboarding & Training: Detailed training sessions for new users to maximize the platform's potential.
      2. Documentation: Extensive user manuals and knowledge base.
      3. Technical Support: Dedicated support channels for troubleshooting and assistance.`
    }
  ];

const Acco = () => {
  return (
    <div className='container mx-auto px-4 md:px-10 py-10 md:py-16'>
      <h2 className="font-extrabold text-3xl md:text-4xl text-center mb-10 md:mb-12 text-gray-900 dark:text-dark-text transition-colors duration-300 animate-fade-in-up">Frequently Asked Questions</h2>
      <Accordion type='single' collapsible className="w-full max-w-3xl mx-auto space-y-3">
        {faqData.map((item, index) => (
          <AccordionItem 
            key={item.id} 
            value={item.id} 
            className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }} // Staggered animation
          >
            <AccordionTrigger className="px-6 py-4 text-left text-lg font-medium text-gray-900 dark:text-dark-text hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-surface transition-colors duration-300">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-0 text-base text-gray-700 dark:text-dark-text-secondary whitespace-pre-line leading-relaxed transition-colors duration-300">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div> 
  )
}

export default Acco
