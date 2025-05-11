import Image from 'next/image';
import Link from 'next/link';
import { FaVideo, FaChalkboardTeacher, FaRocket } from 'react-icons/fa';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between text-black">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-blue-900 to-black py-20">
        <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Transform Text into<br />
              <span className="text-blue-400">Mathematical Animations</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Simply describe the mathematical concepts you want to visualize, and our AI will generate 
              professional-quality animations using the manim library.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/dashboard" 
                className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-3 px-8 rounded-lg text-center transition-all"
              >
                Get Started
              </Link>
              <Link 
                href="/examples" 
                className="bg-transparent border border-blue-500 text-blue-400 font-bold py-3 px-8 rounded-lg text-center hover:bg-blue-900 transition-all"
              >
                See Examples
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="relative w-full h-64 md:h-96">
              <Image 
                src="/math-animation.png" 
                alt="Math animation example" 
                fill
                className="object-cover rounded-lg shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-black">Turn Ideas Into Visual Math</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-all">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
                <FaChalkboardTeacher className="text-4xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-black">AI-Powered Generation</h3>
              <p className="text-gray-600">
                Our AI understands math concepts and generates beautiful, precise animations using the manim engine.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-all">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
                <FaVideo className="text-4xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-black">High-Quality Videos</h3>
              <p className="text-gray-600">
                Get professional-grade educational content perfect for courses, presentations, or online learning.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-all">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
                <FaRocket className="text-4xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-black">No Coding Required</h3>
              <p className="text-gray-600">
                Access the power of manim without writing a single line of code. Just describe what you want.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-black">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full  text-black text-2xl font-bold mb-6">1</div>
              <h3 className="text-xl font-bold mb-4">Describe Your Animation</h3>
              <p className="text-gray-600">
                Enter a detailed description of the mathematical concept or animation you want to create.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-black text-2xl font-bold mb-6">2</div>
              <h3 className="text-xl font-bold mb-4 text-black">AI Generates Code</h3>
              <p className="text-gray-600">
                Our AI system converts your description into manim code that creates the exact animation you need.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-black text-2xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold mb-4 text-black">Download Your Video</h3>
              <p className="text-gray-600">
                In minutes, receive a high-quality video animation ready to use in your presentations or courses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-blue-900 text-center text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to Bring Math to Life?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Join thousands of educators, students, and professionals who are creating stunning 
            visual explanations with our platform.
          </p>
          <Link 
            href="/register" 
            className="bg-white text-blue-900 hover:bg-blue-100 font-bold py-3 px-10 rounded-lg text-xl inline-block transition-all"
          >
            Create Your First Animation
          </Link>
        </div>
      </section>
    </main>
  );
}
