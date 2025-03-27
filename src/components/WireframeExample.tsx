
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const WireframeExample = () => {
  return (
    <Card className="overflow-hidden shadow-md">
      <CardContent className="p-0">
        <div className="bg-gray-100 p-8 space-y-8">
          {/* Hero Section */}
          <section className="wf_container bg-white rounded-lg p-8 md:p-12 shadow-sm border border-gray-200">
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
                    <Button className="wf_btn bg-gray-800 hover:bg-gray-900 text-white">
                      Get started
                    </Button>
                    <Button variant="outline" className="wf_btn_secondary border-gray-300 text-gray-700">
                      Learn more <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                <div className="wf_image-wrapper">
                  <PlaceholderImage aspectRatio="video" text="Hero Image" className="bg-gray-200" />
                </div>
              </div>
            </div>
          </section>
          
          {/* Form Section */}
          <section className="wf_container bg-white rounded-lg p-8 md:p-12 shadow-sm border border-gray-200">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="wf_content space-y-6">
                  <h2 className="wf_heading text-3xl font-semibold text-gray-900">
                    A headline to make a big impact on visitors
                  </h2>
                  <p className="wf_text text-base text-gray-600">
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat
                  </p>
                  <div className="wf_form space-y-4">
                    <div className="flex flex-col md:flex-row gap-2">
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="flex-grow rounded-md border border-gray-300 px-4 py-2 text-gray-700"
                      />
                      <Button className="wf_btn bg-gray-800 hover:bg-gray-900 text-white">
                        Sign up
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      We prioritize your data's security in our privacy policy
                    </p>
                  </div>
                </div>
                <div className="wf_image-wrapper relative">
                  <PlaceholderImage aspectRatio="portrait" text="Content Image" className="bg-gray-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="wf_container bg-gray-50 rounded-lg p-8 md:p-12 shadow-sm border border-gray-200">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="wf_heading text-3xl font-semibold text-gray-900 mb-4">
                  Features Section
                </h2>
                <p className="wf_text text-base text-gray-600 max-w-2xl mx-auto">
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="wf_feature bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="wf_icon mb-4 bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-gray-700">{i}</span>
                    </div>
                    <h3 className="wf_heading text-xl font-medium text-gray-900 mb-2">
                      Feature {i}
                    </h3>
                    <p className="wf_text text-gray-600">
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeExample;
