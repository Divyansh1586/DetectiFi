import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-white bg-gray-900">
      <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7 text-center">
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl text-black mx-auto">
            Tooling for detectives
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 text-gray-400 lg:mb-8 md:text-lg lg:text-xl text-gray-400 mx-auto">
            From uncovering hidden evidence to cracking the crime code, DetectiFi accelerates investigations while safeguarding your privacy.
          </p>
          <div className="flex justify-center">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 text-black border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:bg-gray-700 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-800 text-black dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
            >
              Get started
            </a>
          </div>
        </div>
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
          <img
            src="/images/HeroP2.png"
            alt="Image"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;