import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const data = {
    "names" : [{
       "name" : "D Divyansh",
       "photo" : "/images/search.png",
       "description" : "Lorem ipsum dolor sit amet consectetur adipisicing elit. ",
       "github" : "https://github.com/Divyansh1586",
       "linkedin" : "https://www.linkedin.com/in/divyansh-d-4a7489332/",  
    },
    {
        "name" : "Rishika J",
        "photo" : "/images/search.png",
        "description" : "Lorem ipsum dolor sit amet consectetur adipisicing elit. ",
        "github" : "https://github.com/RishikaJala",
        "linkedin" : "https://www.linkedin.com/in/rishika-jala-796930324/",  
     },
     {
        "name" : "A Bhavagna",
        "photo" : "/images/search.png",
        "description" : "Lorem ipsum dolor sit amet consectetur adipisicing elit. ",
        "github" : "https://github.com/bhavagna06",
        "linkedin" : "https://www.linkedin.com/",  
     },
     {
        "name" : "RVS Anirudh",
        "photo" : "/images/search.png",
        "description" : "Lorem ipsum dolor sit amet consectetur adipisicing elit. ",
        "github" : "https://github.com/Anirudh-KMIT",
        "linkedin" : "https://www.linkedin.com/",  
     },
     {
        "name" : "Shreya N",
        "photo" : "/images/search.png",
        "description" : "Lorem ipsum dolor sit amet consectetur adipisicing elit. ",
        "github" : "https://github.com/ShreyaNamdeo",
        "linkedin" : "https://www.linkedin.com/in/shreya-namdeo-9bb0b2319/",  
     },
     {
        "name" : "Rishit Y",
        "photo" : "/images/search.png",
        "description" : "Lorem ipsum dolor sit amet consectetur adipisicing elit. ",
        "github" : "https://github.com/RishitYengandula",
        "linkedin" : "https://www.linkedin.com/in/rishit-yengandula/",  
     },
    ]
}

const Contributors = () => {
   return (
     <div className="mx-4 mb-8 sm:mx-10">
       <p className="font-extrabold text-3xl md:text-4xl m-3 text-center my-5">Contributors</p>
 
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
         {data.names.map((id) => (
           <Card
             key={id.name}
             className="flex flex-col justify-between items-center text-center shadow-md hover:shadow-lg transition-shadow"
           >
             <CardHeader className="flex flex-col items-center space-y-3">
               <Avatar className="w-12 h-12">
                 <AvatarImage src="/images/pfp.svg" />
                 <AvatarFallback>^-^</AvatarFallback>
               </Avatar>
               <CardTitle className="text-lg font-semibold">{id.name}</CardTitle>
             </CardHeader>
 
             <CardContent>
               <p className="text-sm text-gray-600">{id.description}</p>
             </CardContent>
 
             <CardFooter className="flex justify-center space-x-4 mt-2">
               {/* GitHub */}
               <a href={id.github} target="_blank" rel="noopener noreferrer">
                 <img src="/images/github.svg" alt="GitHub" className="w-6 h-6 hover:opacity-80 transition-opacity" />
               </a>
 
               {/* LinkedIn */}
               <a href={id.linkedin} target="_blank" rel="noopener noreferrer">
                 <img src="/images/linkedin.svg" alt="LinkedIn" className="w-6 h-6 hover:opacity-80 transition-opacity" />
               </a>
             </CardFooter>
           </Card>
         ))}
       </div>
     </div>
   );
 };
 
 export default Contributors;
 