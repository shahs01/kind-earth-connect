
import { Quote } from "lucide-react";

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
  },
  {
    text: "The site is clean and easy to use. I made a post offering tutoring help and got a response the next day.",
    author: "Noah",
    location: "Coquitlam"
  },
  {
    text: "I shared a post for someone else who didn't have internet access. They got help within hours. That's real impact.",
    author: "Alicia",
    location: "Chilliwack"
  },
  {
    text: "I don't have a lot of money, but I do have time. I've been using Thryvance to offer rides and help with errands in my area.",
    author: "Chris",
    location: "New Westminster"
  },
  {
    text: "There are so many people willing to help. This site brings that out. It made me feel like I'm not alone.",
    author: "Anonymous",
    location: "Maple Ridge"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-thryvance-blue-light/30 to-thryvance-green-light/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Stories from Our Community
          </h2>
          <p className="text-lg text-gray-600">
            Real experiences from neighbors helping neighbors across BC
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-white/50"
            >
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
