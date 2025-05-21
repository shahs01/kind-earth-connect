
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { HandHeart } from "lucide-react";

const SponsorProject = () => {
  const projects = [
    {
      id: 1,
      title: "Community Garden Initiative",
      location: "East Side Neighborhood",
      fundingGoal: 15000,
      currentFunding: 8750,
      description: "Help create a community garden that will provide fresh produce and a gathering space for neighborhood residents.",
      category: "Environment"
    },
    {
      id: 2,
      title: "Youth Technology Workshop",
      location: "Central Community Center",
      fundingGoal: 12000,
      currentFunding: 5200,
      description: "Support a 12-week technology workshop teaching coding and digital skills to underserved youth.",
      category: "Education"
    },
    {
      id: 3,
      title: "Small Business Incubator",
      location: "Downtown District",
      fundingGoal: 25000,
      currentFunding: 18500,
      description: "Help fund resources and mentorship for local entrepreneurs starting small businesses.",
      category: "Economic Development"
    },
    {
      id: 4,
      title: "Senior Support Network",
      location: "Various Neighborhoods",
      fundingGoal: 10000,
      currentFunding: 3200,
      description: "Create a network connecting volunteers with seniors who need assistance with daily tasks and companionship.",
      category: "Health & Wellness"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sponsor a Community Project</h1>
          <p className="text-lg text-gray-700 mb-8">
            Make a direct impact by funding specific community initiatives. 
            Choose a project that aligns with your values and help bring it to life.
          </p>
          
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              <Button variant="outline" className="bg-thryvance-green text-white hover:bg-thryvance-green-dark">All Projects</Button>
              <Button variant="outline">Education</Button>
              <Button variant="outline">Health & Wellness</Button>
              <Button variant="outline">Environment</Button>
              <Button variant="outline">Economic Development</Button>
              <Button variant="outline">Arts & Culture</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(project => (
                <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                      <span className="bg-thryvance-green-light text-thryvance-green text-xs font-medium px-2 py-1 rounded">
                        {project.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{project.location}</p>
                    <p className="text-gray-700 mb-4">{project.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>${project.currentFunding.toLocaleString()} raised</span>
                        <span>${project.fundingGoal.toLocaleString()} goal</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-thryvance-green h-2 rounded-full" 
                          style={{ width: `${(project.currentFunding / project.fundingGoal) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-thryvance-green hover:bg-thryvance-green-dark">
                      <HandHeart className="mr-2 h-4 w-4" />
                      Sponsor This Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">How Project Sponsorship Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-thryvance-green-light rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-thryvance-green font-bold">1</span>
                </div>
                <h3 className="font-medium mb-2">Browse Projects</h3>
                <p className="text-sm text-gray-600">Explore community initiatives that need funding and choose one that resonates with you.</p>
              </div>
              <div className="text-center">
                <div className="bg-thryvance-green-light rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-thryvance-green font-bold">2</span>
                </div>
                <h3 className="font-medium mb-2">Make a Contribution</h3>
                <p className="text-sm text-gray-600">Donate any amount toward the project's funding goal.</p>
              </div>
              <div className="text-center">
                <div className="bg-thryvance-green-light rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-thryvance-green font-bold">3</span>
                </div>
                <h3 className="font-medium mb-2">See Your Impact</h3>
                <p className="text-sm text-gray-600">Receive updates as the project progresses and see how your contribution makes a difference.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SponsorProject;
