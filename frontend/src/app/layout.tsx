'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { FaGithub, FaUser } from "react-icons/fa";
import { useState } from "react";
import { AuthProvider, useAuth } from "../lib/auth-context";

const inter = Inter({ subsets: ["latin"] });

// // Since metadata requires a server component and we need a client component for auth
// export const metadata: Metadata = {
//   title: "Manim AI - Math Animation Generator",
//   description: "Generate beautiful mathematical animations from text descriptions using AI and the manim library",
// };

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <span className="text-blue-300">Manim</span>AI
        </Link>
        
        <nav className="hidden md:flex space-x-8 items-center">
          <Link href="/examples" className="hover:text-blue-300 transition-colors">
            Examples
          </Link>
          <Link href="/pricing" className="hover:text-blue-300 transition-colors">
            Pricing
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-300 transition-colors">
                Dashboard
              </Link>
              <div className="relative group">
                <button className="flex items-center space-x-1 hover:text-blue-300">
                  <FaUser />
                  <span>{user?.name || user?.email}</span>
                </button>
                <div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">
                    Profile
                  </Link>
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-blue-700 hover:bg-blue-600 px-5 py-2 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="bg-white text-blue-900 hover:bg-blue-100 px-5 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            className="text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800 p-4">
          <Link href="/examples" className="block py-2 hover:text-blue-300">
            Examples
          </Link>
          <Link href="/pricing" className="block py-2 hover:text-blue-300">
            Pricing
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block py-2 hover:text-blue-300">
                Dashboard
              </Link>
              <Link href="/profile" className="block py-2 hover:text-blue-300">
                Profile
              </Link>
              <button 
                onClick={logout}
                className="block w-full text-left py-2 hover:text-blue-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 hover:text-blue-300">
                Log In
              </Link>
              <Link href="/register" className="block py-2 hover:text-blue-300">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />

          {children}

          <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">ManimAI</h3>
                  <p className="mb-4">
                    Transform text descriptions into beautiful mathematical animations with the power of AI.
                  </p>
                  <div className="flex space-x-4">
                    <a href="https://github.com/3b1b/manim" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                      <FaGithub className="text-2xl" />
                    </a>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
                  <ul className="space-y-2">
                    <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                    <li><Link href="/examples" className="hover:text-white transition-colors">Examples</Link></li>
                    <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
                  <ul className="space-y-2">
                    <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                    <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
                    <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
                  <ul className="space-y-2">
                    <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                    <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                    <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
                <p>© {new Date().getFullYear()} ManimAI. All rights reserved.</p>
                <p className="mt-2">Built with the amazing <a href="https://github.com/3b1b/manim" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">manim library</a> created by 3Blue1Brown.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
