
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useImpactMetrics, useImpactPhotos, useCoveredLocations } from "@/hooks/useImpact";
import { Quote, Users, Heart, Building, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const testimonials = [
  {
    text: "I posted asking for warm clothes for my kids and someone in my area responded within a day. This platform made me feel seen.",
    author: "Samantha",
    location: "Abbotsford"
  },
  {
    text: "Donated a microwave I wasn't using anymore. So much better than tossing it. Love what this site stands for.",
    author: "Dev",
    location: "Surrey"
  },
  {
    text: "I didn't know what to expect, but Thryvance helped me find food resources I didn't even know existed in my city.",
    author: "Anonymous",
    location: "Burnaby"
  },
  {
    text: "It's nice to have a place where people can just give without expecting something back. It's all heart.",
    author: "Jen",
    location: "Richmond"
  },
  {
    text: "This is like Craigslist meets community care. I've helped two people already just by offering extra things I had around.",
    author: "Marcus",
    location: "Vancouver"
  },
  {
    text: "I'm new to BC and was struggling to find support services. Thryvance made it easier to find what I needed without judgment.",
    author: "Fatima",
    location: "Langley"
  }
];

const OurImpact = () => {
  const { data: metrics, isLoading: metricsLoading } = useImpactMetrics();
  const { data: photos, isLoading: photosLoading } = useImpactPhotos();
  const { data: locations, isLoading: locationsLoading } = useCoveredLocations();

  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'total_posts_created':
        return <TrendingUp className="h-8 w-8 text-thryvance-green" />;
      case 'people_helped':
        return <Users className="h-8 w-8 text-thryvance-green" />;
      case 'ngos_listed':
        return <Building className="h-8 w-8 text-thryvance-green" />;
      case 'active_cities':
        return <MapPin className="h-8 w-8 text-thryvance-green" />;
      default:
        return <Heart className="h-8 w-8 text-thryvance-green" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-thryvance-blue-light/30 to-thryvance-green-light/30 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Our Community Impact
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how we're building stronger communities across British Columbia, 
              one connection at a time.
            </p>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                By the Numbers
              </h2>
              <p className="text-lg text-gray-600">
                Real impact, measured in meaningful connections
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricsLoading ? (
                // Loading skeletons
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded mx-auto animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                metrics?.map((metric) => (
                  <Card key={metric.id} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        {getMetricIcon(metric.metric_key)}
                      </div>
                      <div className="text-3xl font-bold text-gray-800 mb-2">
                        {metric.metric_value.toLocaleString()}
                      </div>
                      <div className="text-gray-600 font-medium">
                        {metric.display_name}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* User Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Stories from Our Community
              </h2>
              <p className="text-lg text-gray-600">
                Real experiences from neighbors helping neighbors across BC
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-thryvance-green-light rounded-full">
                        <Quote className="w-4 h-4 text-thryvance-green" />
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          — {testimonial.author}
                        </p>
                        <p className="text-sm text-gray-600">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Photos Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Community in Action
              </h2>
              <p className="text-lg text-gray-600">
                Moments that capture the spirit of mutual aid
              </p>
            </div>
            
            {photosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : photos && photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="group">
                    <img
                      src={photo.photo_url}
                      alt={photo.alt_text || photo.title}
                      className="w-full aspect-video object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                    />
                    <div className="mt-3">
                      <h3 className="font-semibold text-gray-800">{photo.title}</h3>
                      {photo.description && (
                        <p className="text-sm text-gray-600 mt-1">{photo.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Photos coming soon! We're capturing moments of community support.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Covered Locations */}
        <section className="py-16 bg-gradient-to-br from-thryvance-green-light/20 to-thryvance-blue-light/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Serving Communities Across BC
              </h2>
              <p className="text-lg text-gray-600">
                Growing our network of mutual support throughout British Columbia
              </p>
            </div>
            
            {locationsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-20 bg-white/50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {locations?.map((location) => (
                  <Card key={location.id} className="text-center bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <MapPin className="h-5 w-5 text-thryvance-green mr-2" />
                        <span className="font-semibold text-gray-800">
                          {location.city_name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{location.region}</p>
                      {(location.user_count > 0 || location.post_count > 0) && (
                        <div className="mt-2 text-xs text-thryvance-green">
                          {location.user_count} users • {location.post_count} posts
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OurImpact;
