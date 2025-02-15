import React from 'react'
import { Card, CardTitle, CardHeader, CardContent } from './ui/card'

const Features = () => {
  return (
    <>  
        <div className='mx-4 md:mx-10 my-2'>
            <p className='font-extrabold text-3xl md:text-4xl m-3 text-center my-5'>Features</p>
            <div className='flex flex-col md:flex-row gap-6'>
                <Card className="w-full md:flex-1">
                    <CardHeader>
                        <CardTitle className='text-2xl'>
                            Crime Classification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className='text-base'>- Based on AI model CLIP (Contrastive Language-Image Pretraining)</p>
                        <p className='text-base'>- Analyzes crime scene images</p>
                        <p className='text-base'>- Categorizes crime</p>    
                    </CardContent>
                </Card>
                <Card className="w-full md:flex-1">
                    <CardHeader>
                        <CardTitle className='text-2xl'>
                            Evidence Extraction
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className='text-base'>- Employs a Vision Transformer (ViT) model</p>
                        <p className='text-base'>- Detect critical details in crime scene images</p>
                        <p className='text-base'>- Can identify small yet crucial evidence</p>    
                    </CardContent>
                </Card>
                <Card className="w-full md:flex-1">
                    <CardHeader>
                        <CardTitle className='text-2xl'>
                            Analytics
                        </CardTitle>
                    </CardHeader>  
                    <CardContent className="space-y-2">
                        <p className='text-base'>- Provides Crime Pattern Trends</p>
                        <p className='text-base'>- Detects Evidence Frequency</p>
                        <p className='text-base'>- Cross-Case Correlations</p>    
                    </CardContent>   
                </Card>
            </div>
        </div>
    </>
  )
}

export default Features