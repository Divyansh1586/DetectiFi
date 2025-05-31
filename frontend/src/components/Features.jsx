import React from 'react'
import { Card, CardTitle, CardHeader, CardContent } from './ui/card'

const Features = () => {
  return (
    <>  
      <div className='mx-4 md:mx-10 my-2 mb-7'>
        <p className='font-extrabold text-3xl md:text-4xl m-3 text-center my-5 text-gray-900 text-black'>Features</p>

        <div className='flex flex-col md:flex-row gap-6'>
          {/* Crime Classification */}
          <Card className="w-full md:flex-1">
            <CardHeader className="flex gap-2">
              <div className="flex items-center space-x-3">
                <CardTitle className='text-2xl'>Crime Classification</CardTitle>
                <img src="/images/classification.png" alt="Crime Classification" className="w-8 h-8" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className='text-base text-gray-700 text-gray-700'>- Based on AI model CLIP (Contrastive Language-Image Pretraining)</p>
              <p className='text-base text-gray-700 text-gray-700'>- Analyzes crime scene images</p>
              <p className='text-base text-gray-700 text-gray-700'>- Categorizes crime</p>    
            </CardContent>
          </Card>

          {/* Evidence Extraction */}
          <Card className="w-full md:flex-1">
            <CardHeader className="flex gap-2">
              <div className="flex items-center space-x-3">
                <CardTitle className='text-2xl'>Evidence Extraction</CardTitle>
                <img src="/images/extraction.png" alt="Evidence Extraction" className="w-6 h-6" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className='text-base text-gray-700 text-gray-700'>- Utilizes YOLOv8 for object detection</p>
              <p className='text-base text-gray-700 text-gray-700'>- Detects and localizes critical visual evidence in crime scene images</p>
              <p className='text-base text-gray-700 text-gray-700'>- Identifies small yet crucial objects like weapons, injuries, or suspicious items</p>    
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="w-full md:flex-1">
            <CardHeader className="flex gap-2">
              <div className="flex items-center space-x-3">
                <CardTitle className='text-2xl'>Analytics</CardTitle>
                <img src="/images/analysis.png" alt="Analytics" className="w-6 h-6" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className='text-base text-gray-700 text-gray-700'>- Provides Crime Pattern Trends</p>
              <p className='text-base text-gray-700 text-gray-700'>- Detects Evidence Frequency</p>
              <p className='text-base text-gray-700 text-gray-700'>- Cross-Case Correlations</p>    
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Features
