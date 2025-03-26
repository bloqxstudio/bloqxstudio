
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
          <section className="hero_wrapper bg-white rounded-lg p-8 md:p-12 shadow-sm">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="hero_content space-y-6">
                  <h1 className="hero_heading text-4xl font-semibold text-gray-800">
                    Heading Here
                  </h1>
                  <p className="hero_text text-gray-600">
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat
                  </p>
                  <Button className="hero_btn flex items-center gap-2">
                    Button <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="hero_image-wrapper">
                  <PlaceholderImage aspectRatio="video" />
                </div>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="features_wrapper bg-gray-50 rounded-lg p-8 md:p-12 shadow-sm">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="features_heading text-3xl font-semibold text-gray-800 mb-4">
                  Features Section
                </h2>
                <p className="features_subheading text-gray-600 max-w-2xl mx-auto">
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`feature${i}_container bg-white p-6 rounded-lg shadow-sm`}>
                    <div className={`feature${i}_icon-wrapper mb-4 bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center`}>
                      <span className="text-gray-600">{i}</span>
                    </div>
                    <h3 className={`feature${i}_heading text-xl font-medium text-gray-800 mb-2`}>
                      Lorem Ipsum
                    </h3>
                    <p className={`feature${i}_text text-gray-600`}>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Testimonial Section */}
          <section className="testimonial_wrapper bg-white rounded-lg p-8 md:p-12 shadow-sm">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="testimonial_image-wrapper">
                  <PlaceholderImage aspectRatio="square" />
                </div>
                <div className="testimonial_content space-y-6">
                  <div className="testimonial_quote text-gray-800 text-lg italic">
                    "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat."
                  </div>
                  <div className="testimonial_author text-gray-700 font-medium">
                    John Doe, Position, Company
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeExample;
