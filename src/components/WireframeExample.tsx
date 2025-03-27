
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const WireframeExample = () => {
  return (
    <Card className="overflow-hidden shadow-md">
      <CardContent className="p-0">
        <div className="bg-gray-50 p-8 space-y-8">
          {/* Feature Section */}
          <section className="wf_container bg-white rounded-lg p-8 md:p-12 border border-gray-100">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="wf_content space-y-6">
                  <h3 className="wf_tagline text-sm font-semibold text-gray-700">
                    Tagline
                  </h3>
                  <h1 className="wf_heading text-4xl font-semibold text-gray-900">
                    A powerful heading that highlights core benefits
                  </h1>
                  <p className="wf_text text-base text-gray-600">
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Button className="wf_btn bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                      Get started
                    </Button>
                    <Button variant="outline" className="wf_btn_secondary border-gray-300 text-gray-700">
                      Learn more <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                <div className="wf_image-wrapper">
                  <PlaceholderImage aspectRatio="video" text="Feature Image" className="bg-blue-50" />
                </div>
              </div>
            </div>
          </section>
          
          {/* Login Form Section */}
          <section className="wf_container bg-white rounded-lg p-8 md:p-12 border border-gray-100">
            <div className="container mx-auto max-w-md">
              <div className="text-center mb-8">
                <h2 className="wf_heading text-2xl font-semibold text-gray-900 mb-2">
                  Log In
                </h2>
                <p className="wf_text text-sm text-gray-600">
                  Enter your email and password to access your account
                </p>
              </div>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                  Sign in
                </Button>
                <div className="text-center text-sm text-gray-500">
                  <span>Don't have an account? </span>
                  <a href="#" className="text-blue-600 hover:underline">Sign up</a>
                </div>
              </form>
            </div>
          </section>
          
          {/* Contact Section */}
          <section className="wf_container bg-white rounded-lg p-8 md:p-12 border border-gray-100">
            <div className="container mx-auto max-w-md">
              <div className="text-center mb-8">
                <h2 className="wf_heading text-2xl font-semibold text-gray-900 mb-2">
                  Contact us
                </h2>
                <p className="wf_text text-sm text-gray-600">
                  Fill out the form below and our team will get back to you shortly
                </p>
              </div>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <textarea 
                    placeholder="Enter your message" 
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                  Send message
                </Button>
              </form>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeExample;
