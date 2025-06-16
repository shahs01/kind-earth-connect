
import { Heart, Users, Search, Check } from "lucide-react";

const features = [
  {
    icon: <Heart className="w-8 h-8 text-thryvance-green" />,
    title: "Offer Help",
    description: "Share free items, skills, or time to support someone in your neighborhood — whether it's groceries, clothing, home help, or kindness."
  },
  {
    icon: <Users className="w-8 h-8 text-thryvance-blue" />,
    title: "Request Support",
    description: "Ask for what you need, big or small. Our caring community is here to support you without judgment or cost."
  },
  {
    icon: <Search className="w-8 h-8 text-thryvance-green-dark" />,
    title: "Find Local Resources",
    description: "Discover nonprofits, shelters, food banks, and support services near you."
  }
];

const FeatureSection = () => {
  return (
    <section className="py-16 bg-thryvance-neutral-light">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Thryvance Works</h2>
          <p className="text-lg text-gray-600">
            Our platform makes it easy to connect with your community through simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-start"
            >
              <div className="p-3 bg-thryvance-neutral-light rounded-lg mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 bg-gradient-to-r from-thryvance-green-light to-thryvance-blue-light p-8 md:p-12 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-700 mb-6">
                Thryvance exists to strengthen communities by fostering a spirit of mutual aid and support. 
                We believe every person has something valuable to offer, and when we help each other, we all thrive.
              </p>
              
              <div className="space-y-3">
                {["Building stronger communities", "Creating networks of support", "Valuing every contribution"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-thryvance-green flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="bg-white p-1 rounded-xl shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80" 
                  alt="Community garden project" 
                  className="rounded-lg w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
