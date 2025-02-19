import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const data = {
  "questions": [
    {
      "question": "What is SceneSolver, and how does it assist law enforcement?",
      "answer": `SceneSolver assists law enforcement by:  
      \n1) AI-powered Analysis – Uses AI to analyze crime scenes efficiently.  
      \n2) Speed & Accuracy – Reduces forensic investigation time and human errors.  
      \n3) Automated Crime Scene Processing – Quickly identifies key evidence.  
      \n4) Improved Investigations – Provides structured insights for decision-making.`
    },
    {
      "question": "What AI models does SceneSolver use for crime classification and evidence extraction?",
      "answer": `SceneSolver uses two AI models: 
      \n1) CLIP (Contrastive Language-Image Pretraining) for crime classification, which analyzes crime scene images to categorize crimes (e.g., robbery, burglary). 
      \n2) Vision Transformer (ViT) for evidence extraction, which detects critical details in crime scene images, such as small yet crucial evidence like shards of glass in a hit-and-run case.`
    },
    {
      "question": "How does SceneSolver process crime scene data?",
      "answer": `SceneSolver processes crime scene data in the following steps:  
      \n1) Image Upload – Investigators upload crime scene images via a dashboard.  
      \n2) AI Processing – The system analyzes large amounts of evidence quickly.  
      \n3) Crime Summarization – Generates instant reports with key evidence.  
      \n4) Lead Generation – Helps identify suspects or patterns for further investigation.`
    },
    {
      "question": "What are the key benefits of using SceneSolver in crime investigations?",
      "answer": `The key benefits of SceneSolver include: 
      \n1) Faster Investigations – It significantly reduces case-solving time. 
      \n2) Increased Accuracy – It is trained on real crime data (UCF Crime Dataset) for reliability. 
      \n3) Enhanced Decision-Making – It provides investigators with organized crime summaries and actionable insights.`
    },
    {
      "question": "What are some potential uses of SceneSolver beyond law enforcement?",
      "answer": `SceneSolver has potential applications in: 
      \n1) Emergency Response – Identifying survivors in disaster zones. 
      \n2) Crime Prevention – Analyzing patterns to prevent crimes. 
      \n3) Healthcare – Assisting in medical diagnostics. 
      \n4) Traffic Monitoring – Detecting accidents or violations. 
      \n5) Financial Fraud Detection – Identifying fraudulent activities.`
    }
  ]
}

const Acco = () => {
  return (
    <div className='m-10'>
      <p className="font-extrabold text-3xl md:text-4xl m-3 text-center my-5">Questions</p>
      {/* Wrap all items inside a single Accordion */}
      <Accordion type='single' collapsible>
        {data.questions.map((item, index) => (
          <AccordionItem key={index} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent className="whitespace-pre-line mt-0 mb-1 text-sm leading-none">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div> 
  )
}

export default Acco
