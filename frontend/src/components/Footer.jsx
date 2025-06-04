import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
      <div className="mx-auto w-full max-w-screen-xl p-6 py-8 lg:py-12">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <a href="/" className="flex items-center">
              <img src="/images/logo.png" className="h-8 mr-3 filter dark:brightness-0 dark:invert" alt="DetectiFi Logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-gray-900 dark:text-dark-text transition-colors duration-300">DetectiFi</span>
            </a>
            <p className="mt-3 text-sm text-gray-500 dark:text-dark-text-secondary max-w-xs">
              Advanced AI-powered tools for modern crime investigation and analysis.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-10 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 dark:text-dark-primary uppercase">Tech Stack</h2>
              <ul className="text-gray-500 dark:text-dark-text-secondary font-medium space-y-3">
                <li><a href="#" className="hover:underline hover:text-dark-primary transition-colors">MERN</a></li>
                <li><a href="#" className="hover:underline hover:text-dark-primary transition-colors">Python (FastAPI)</a></li>
                <li><a href="#" className="hover:underline hover:text-dark-primary transition-colors">CLIP & YOLOv8</a></li>
                <li><a href="#" className="hover:underline hover:text-dark-primary transition-colors">Tailwind CSS</a></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 dark:text-dark-primary uppercase">Follow Us</h2>
              <ul className="text-gray-500 dark:text-dark-text-secondary font-medium space-y-3">
                <li><a href="https://github.com/Divyansh1586/DetectiFi" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-dark-primary transition-colors">Github</a></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 dark:text-dark-primary uppercase">Legal</h2>
              <ul className="text-gray-500 dark:text-dark-text-secondary font-medium space-y-3">
                <li><a href="#" className="hover:underline hover:text-dark-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline hover:text-dark-primary transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:underline hover:text-dark-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 dark:border-dark-border sm:mx-auto lg:my-8 transition-colors duration-300" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 dark:text-dark-text-secondary sm:text-center">
            © {new Date().getFullYear()} <a href="/" className="hover:underline hover:text-dark-primary transition-colors">DetectiFi™</a>. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0 space-x-5">
            <a href="#" className="text-gray-500 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-primary transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              <span className="sr-only">Facebook page</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
