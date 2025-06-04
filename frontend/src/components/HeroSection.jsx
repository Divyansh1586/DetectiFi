import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-white dark:bg-dark-background py-8 md:py-16 transition-colors duration-300">
      <div className="grid max-w-screen-xl px-4 mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12 items-center">
        <div className="mr-auto place-self-center lg:col-span-7 text-center lg:text-left animate-fade-in-up">
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl text-gray-900 dark:text-dark-text mx-auto lg:mx-0 transition-colors duration-300">
            Tooling for Modern Detectives
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 dark:text-dark-text-secondary lg:mb-8 md:text-lg lg:text-xl mx-auto lg:mx-0 transition-colors duration-300">
            From uncovering hidden evidence to cracking the crime code, DetectiFi accelerates investigations while safeguarding your privacy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-center text-white bg-red-600 hover:bg-red-700  dark:bg-dark-primary dark:text-dark-background rounded-lg focus:ring-4 focus:ring-red-300 dark:focus:ring-teal-800 transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Get Started
            </a>
          </div>
        </div>
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex animate-slide-in-left animation-delay-200">
          {/* Consider a more thematic image or an abstract one */}
          <img
            src="/images/HeroP2.png" // Ensure this image works well or use a different one for dark mode if needed
            alt="Crime Investigation Illustration"
            className="rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;