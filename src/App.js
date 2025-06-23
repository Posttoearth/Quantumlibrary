import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 antialiased">
      {/* Header Section */}
      <header className="py-6 shadow-md bg-white/80 backdrop-blur-sm sticky top-0 z-50 rounded-b-lg">
        <nav className="container mx-auto px-6 flex justify-between items-center">
          {/* Updated company name with href="/" */}
          <a href="/" className="text-3xl font-extrabold text-indigo-700 hover:text-indigo-900 transition duration-300 ease-in-out">
            Abdul Hill
          </a>
          <ul className="flex space-x-8">
            <li><a href="#projects" className="text-lg font-medium text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out">Projects</a></li>
            <li><a href="#services" className="text-lg font-medium text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out">Services</a></li>
            <li><a href="#pricing" className="text-lg font-medium text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out">Pricing</a></li>
            <li><a href="#contact" className="text-lg font-medium text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[calc(100vh-80px)] py-16 px-6 text-center overflow-hidden">
        {/* Abstract background design elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 opacity-30 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/4 -translate-y-1/4 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 opacity-30 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/4 translate-y-1/4 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/4 left-1/2 w-48 h-48 bg-indigo-200 opacity-30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

        {/* Existing background image placeholder - kept for subtle texture */}
        <div className="absolute inset-0 bg-hero-pattern opacity-5" style={{ backgroundImage: "url('https://placehold.co/1920x1080/E0E7FF/6366F1?text=Abstract+Background')" }}></div>

        <div className="relative z-10 max-w-4xl mx-auto bg-white/70 p-10 rounded-3xl shadow-xl backdrop-blur-sm border border-indigo-200">
          <h1 className="text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Your Vision, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Our Code.</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-10">
            Crafting Exceptional Websites That Drive Your Business Forward.
          </p>
          <a
            href="#contact"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
          >
            Get a Free Consultation
          </a>
        </div>
      </section>

      {/* Past Projects Section */}
      <section id="projects" className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-16">
            Our Recent Work
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {/* Project Bubble 1: HVAC Design */}
            <a
              href="https://hlbowman.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center min-w-[200px] h-32 px-8 bg-white rounded-full shadow-lg border border-indigo-200
                         hover:shadow-xl hover:bg-indigo-50 transform hover:-translate-y-2 transition duration-300 ease-in-out"
            >
              <span className="text-2xl font-bold text-indigo-700 group-hover:text-indigo-900">
                HVAC Design
              </span>
              <span className="text-lg font-normal text-gray-600 group-hover:text-gray-800 mt-1">
                for H.L. Bowman, Inc.
              </span>
            </a>

            {/* Project Bubble 2: Auto Repair */}
            <a
              href="https://kindermansautorepair.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center min-w-[200px] h-32 px-8 bg-white rounded-full shadow-lg border border-indigo-200
                         hover:shadow-xl hover:bg-indigo-50 transform hover:-translate-y-2 transition duration-300 ease-in-out"
            >
              <span className="text-2xl font-bold text-indigo-700 group-hover:text-indigo-900">
                Auto Repair
              </span>
              <span className="text-lg font-normal text-gray-600 group-hover:text-gray-800 mt-1">
                for Kinderman's Auto Repair
              </span>
            </a>

            {/* Project Bubble 3: Construction */}
            <a
              href="https://jpconstructionsvc.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center min-w-[200px] h-32 px-8 bg-white rounded-full shadow-lg border border-indigo-200
                         hover:shadow-xl hover:bg-indigo-50 transform hover:-translate-y-2 transition duration-300 ease-in-out"
            >
              <span className="text-2xl font-bold text-indigo-700 group-hover:text-indigo-900">
                Construction
              </span>
              <span className="text-lg font-normal text-gray-600 group-hover:text-gray-800 mt-1">
                for JP Construction Svc
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-16">
            Our Expertise
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Service Card 1 */}
            <div className="flex flex-col items-center text-center p-8 bg-blue-50 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transform hover:-translate-y-2 transition duration-300 ease-in-out">
              <div className="text-indigo-600 mb-6">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V9h2v8zm4 0h-2V9h2v8zm-2-9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Custom Web Design</h3>
              <p className="text-lg text-gray-600">
                Bespoke designs tailored to your brand identity, ensuring a unique and impactful online presence.
              </p>
            </div>

            {/* Service Card 2 */}
            <div className="flex flex-col items-center text-center p-8 bg-blue-50 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transform hover:-translate-y-2 transition duration-300 ease-in-out">
              <div className="text-indigo-600 mb-6">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Responsive Development</h3>
              <p className="text-lg text-gray-600">
                Websites that look and perform flawlessly on any device – desktop, tablet, or mobile.
              </p>
            </div>

            {/* Service Card 3 */}
            <div className="flex flex-col items-center text-center p-8 bg-blue-50 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transform hover:-translate-y-2 transition duration-300 ease-in-out">
              <div className="text-indigo-600 mb-6">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 9h2V7h-2v2zm0 4h2v-2h-2v2zm0 4h2v-2h-2v2zm-2 2h6v-2H9v2zm8-18H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">E-commerce Solutions</h3>
              <p className="text-lg text-gray-600">
                Powerful and secure online stores designed to maximize your sales and customer experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-16">
            Affordable Excellence
          </h2>
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-indigo-200">
            <h3 className="text-4xl font-bold text-indigo-700 mb-6">Basic Website Package</h3>
            <p className="text-6xl font-extrabold text-gray-900 mb-8">
              $<span className="text-indigo-600">300</span>
            </p>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">
              Our basic package includes a professional, responsive, and SEO-friendly website, perfect for establishing your online presence. This is a great starting point for small businesses and individuals.
            </p>
            <p className="text-2xl font-semibold text-gray-800 mb-6">
              For more advanced projects with custom features, e-commerce, or extensive content,
              <br className="hidden sm:inline" /> please <a href="#contact" className="text-indigo-600 hover:underline">contact us</a> for a personalized quote.
            </p>
            <a
              href="#contact"
              className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-16">
            Get In Touch
          </h2>
          <div className="max-w-xl mx-auto p-10 bg-blue-50 rounded-3xl shadow-lg border border-blue-100">
            <p className="text-2xl text-gray-700 mb-8">
              Ready to build your dream website? Contact us today!
            </p>
            <div className="space-y-6 mb-10">
              <div className="flex items-center justify-center text-xl text-gray-800">
                <svg className="w-8 h-8 text-indigo-600 mr-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
                </svg>
                <a href="mailto:sofwareai36@gmail.com" className="text-indigo-700 font-medium hover:underline">
                  sofwareai36@gmail.com
                </a>
              </div>
              <div className="flex items-center justify-center text-xl text-gray-800">
                <svg className="w-8 h-8 text-indigo-600 mr-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1v3.5c0 .35-.09.7-.24 1.02l-2.2 2.2z"></path>
                </svg>
                <a href="tel:570504727" className="text-indigo-700 font-medium hover:underline">
                  570-504-727
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-8 px-6 bg-gray-900 text-white text-center rounded-t-lg">
        <div className="container mx-auto">
          <p className="text-lg">&copy; {new Date().getFullYear()} Abdul Hill. All rights reserved.</p>
          <p className="text-md mt-2">
            Crafting the future of web.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

export default App;

