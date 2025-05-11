'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/lib/auth-context';

const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    description: 'For casual users exploring the basics',
    features: [
      'Generate up to 5 animations per month',
      'Standard quality output (720p)',
      'Access to basic animation templates',
      'Download generated videos',
      'View manim source code',
    ],
    limitations: [
      'Limited to 30 seconds per animation',
      'No commercial usage rights',
      'No priority rendering',
      'Limited customization options',
    ],
    buttonText: 'Get Started',
    color: 'bg-gray-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-800',
    buttonColor: 'bg-gray-700 hover:bg-gray-800',
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '19',
    description: 'For educators and content creators',
    features: [
      'Generate up to 20 animations per month',
      'HD quality output (1080p)',
      'Access to all animation templates',
      'Download generated videos',
      'View and edit manim source code',
      'Commercial usage rights',
      'Priority rendering',
    ],
    limitations: [
      'Limited to 2 minutes per animation',
    ],
    isMostPopular: true,
    buttonText: 'Subscribe',
    color: 'bg-blue-100',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '49',
    description: 'For professional educators & studios',
    features: [
      'Unlimited animations per month',
      '4K quality output',
      'Access to all animation templates',
      'Advanced customization options',
      'Download generated videos',
      'View and edit manim source code',
      'Commercial usage rights',
      'Priority rendering',
      'API access',
      'Dedicated support',
    ],
    limitations: [],
    buttonText: 'Subscribe',
    color: 'bg-purple-100',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-800',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
  }
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      router.push('/register');
      return;
    }
    
    // In a real app, this would navigate to a checkout page
    alert(`You selected the ${planId} plan. In a complete application, this would navigate to a payment processor.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-900 text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Choose the right plan for your needs and start creating beautiful mathematical animations today.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Billing interval toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md ${
                billingInterval === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-4 py-2 rounded-md ${
                billingInterval === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-700'
              }`}
            >
              Annual <span className="text-xs font-medium text-green-600 ml-1">Save 20%</span>
            </button>
          </div>
        </div>
        
        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const price = billingInterval === 'annual' 
              ? Math.round(Number(plan.price) * 0.8 * 12).toString()
              : plan.price;
              
            return (
              <div 
                key={plan.id}
                className={`${plan.color} border-2 ${plan.borderColor} rounded-xl overflow-hidden relative ${
                  plan.isMostPopular ? 'transform md:-translate-y-4 md:scale-105 z-10' : ''
                }`}
              >
                {plan.isMostPopular && (
                  <div className="bg-blue-600 text-white py-1 text-center text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className={`text-2xl font-bold ${plan.textColor} mb-2`}>{plan.name}</h3>
                  
                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${plan.textColor}`}>
                      ${price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {billingInterval === 'monthly' ? '/month' : '/year'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>
                  
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 rounded-lg text-white font-medium ${plan.buttonColor}`}
                  >
                    {user?.subscription_tier === plan.id ? 'Current Plan' : plan.buttonText}
                  </button>
                  
                  <div className="mt-8">
                    <p className={`font-semibold ${plan.textColor} mb-3`}>What's included:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.limitations.length > 0 && (
                      <>
                        <p className={`font-semibold ${plan.textColor} mt-6 mb-3`}>Limitations:</p>
                        <ul className="space-y-3">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-center">
                              <FaTimes className="text-red-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-700">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">What is ManimAI?</h3>
              <p className="text-gray-700">
                ManimAI is a service that uses artificial intelligence to generate mathematical
                animations based on your text descriptions, powered by the manim library created by 3Blue1Brown.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-700">
                Yes, you can cancel your subscription at any time. Your account will remain active until the end of your billing period.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Do I own the videos I create?</h3>
              <p className="text-gray-700">
                Yes, you own all the content you create with ManimAI. The Basic and Premium plans include commercial usage rights.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-700">
                We accept all major credit cards, PayPal, and certain regional payment methods.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Is there a free trial?</h3>
              <p className="text-gray-700">
                Yes, you can start with the Free plan to try our core features. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}