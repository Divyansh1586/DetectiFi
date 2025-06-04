import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const contributorsData = [
    {
       name : "D Divyansh",
       photo : "/images/pfp.svg",
       description : "Frontend enthusiast, passionate about creating seamless user experiences.",
       github : "https://github.com/Divyansh1586",
       linkedin : "https://www.linkedin.com/in/divyansh-d-4a7489332/",  
    },
    {
        name : "Rishika J",
        photo : "/images/pfp.svg",
        description : "Full-stack developer with a keen eye for detail and performance.",
        github : "https://github.com/RishikaJala",
        linkedin : "https://www.linkedin.com/in/rishika-jala-796930324/",  
     },
     {
        name : "A Bhavagna",
        photo : "/images/pfp.svg",
        description : "Backend specialist, focused on robust and scalable solutions.",
        github : "https://github.com/bhavagna06",
        linkedin : "https://www.linkedin.com/",
     },
     {
        name : "RVS Anirudh",
        photo : "/images/pfp.svg",
        description : "AI/ML engineer, driving innovation in intelligent systems.",
        github : "https://github.com/Anirudh-KMIT",
        linkedin : "https://www.linkedin.com/",
     },
     {
        name : "Shreya N",
        photo : "/images/pfp.svg",
        description : "UI/UX designer, crafting beautiful and intuitive interfaces.",
        github : "https://github.com/ShreyaNamdeo",
        linkedin : "https://www.linkedin.com/in/shreya-namdeo-9bb0b2319/",  
     },
     {
        name : "Rishit Y",
        photo : "/images/pfp.svg",
        description : "DevOps champion, ensuring smooth deployments and infrastructure.",
        github : "https://github.com/RishitYengandula",
        linkedin : "https://www.linkedin.com/in/rishit-yengandula/",  
     },
];

const Contributors = () => {
   return (
     <div className="container mx-auto px-4 md:px-10 py-10 md:py-16">
       <h2 className="font-extrabold text-3xl md:text-4xl m-3 text-center mb-10 md:mb-12 text-gray-900 dark:text-dark-text transition-colors duration-300 animate-fade-in-up">Meet the Team</h2>
 
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8">
         {contributorsData.map((contributor, index) => (
           <Card
             key={contributor.name}
             className="flex flex-col justify-between items-center text-center bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
             style={{ animationDelay: `${index * 100}ms` }}
           >
             <CardHeader className="flex flex-col items-center space-y-3 pt-6">
               <Avatar className="w-20 h-20 border-2 border-gray-300 dark:border-dark-primary shadow-md">
                 <AvatarImage src={contributor.photo || "/images/pfp.svg"} alt={contributor.name} />
                 <AvatarFallback className="text-lg bg-gray-200 dark:bg-gray-700 dark:text-dark-text">{contributor.name.substring(0,2).toUpperCase()}</AvatarFallback>
               </Avatar>
               <CardTitle className="text-xl font-semibold text-gray-900 dark:text-dark-text pt-2">{contributor.name}</CardTitle>
             </CardHeader>
 
             <CardContent className="px-4 pb-4">
               <p className="text-sm text-gray-600 dark:text-dark-text-secondary min-h-[60px]">{contributor.description}</p>
             </CardContent>
 
             <CardFooter className="flex justify-center space-x-4 py-4 w-full border-t border-gray-200 dark:border-dark-border mt-auto transition-colors duration-300">
               <a href={contributor.github} target="_blank" rel="noopener noreferrer" aria-label={`${contributor.name}'s GitHub profile`}>
                 <img src="/images/github.svg" alt="GitHub" className="w-6 h-6 hover:opacity-75 transition-opacity filter dark:invert" />
               </a>
               <a href={contributor.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${contributor.name}'s LinkedIn profile`}>
                 <img src="/images/linkedin.svg" alt="LinkedIn" className="w-6 h-6 hover:opacity-75 transition-opacity filter dark:invert" />
               </a>
             </CardFooter>
           </Card>
         ))}
       </div>
     </div>
   );
 };
 
 export default Contributors;
 