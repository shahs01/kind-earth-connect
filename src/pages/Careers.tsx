
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Careers = () => {
  const jobOpenings = [
    {
      id: 1,
      title: "Community Engagement Manager",
      department: "Community Operations",
      location: "Remote",
      type: "Full-time",
      posted: "2 weeks ago"
    },
    {
      id: 2,
      title: "Frontend Developer",
      department: "Engineering",
      location: "Hybrid",
      type: "Full-time",
      posted: "1 week ago"
    },
    {
      id: 3,
      title: "Nonprofit Partnerships Coordinator",
      department: "Partnerships",
      location: "In-office",
      type: "Full-time",
      posted: "3 days ago"
    },
    {
      id: 4,
      title: "Content Writer",
      department: "Marketing",
      location: "Remote",
      type: "Part-time",
      posted: "1 month ago"
    },
    {
      id: 5,
      title: "User Experience Researcher",
      department: "Product",
      location: "Remote",
      type: "Contract",
      posted: "2 days ago"
    }
  ];

  const values = [
    {
      title: "Community Impact",
      description: "We measure our success by the positive change we create in communities."
    },
    {
      title: "Inclusivity",
      description: "We value diverse perspectives and create an environment where everyone belongs."
    },
    {
      title: "Innovation",
      description: "We embrace creative solutions and aren't afraid to try new approaches."
    },
    {
      title: "Integrity",
      description: "We operate with transparency and hold ourselves to the highest ethical standards."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Careers at Thryvance</h1>
          <p className="text-lg text-gray-700 mb-8">
            Join our team and help build technology that strengthens communities and creates meaningful connections.
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Current Openings</h2>
            
            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="engineering">Engineering</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {jobOpenings.map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-thryvance-green transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.department} • {job.location} • {job.type}</p>
                        </div>
                        <span className="text-xs text-gray-500">Posted {job.posted}</span>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <Button 
                          variant="outline" 
                          className="text-sm border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light"
                        >
                          View Details
                        </Button>
                        <Button className="text-sm bg-thryvance-green hover:bg-thryvance-green-dark">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="engineering">
                <div className="space-y-4">
                  {jobOpenings.filter(job => job.department === "Engineering").map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-thryvance-green transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.department} • {job.location} • {job.type}</p>
                        </div>
                        <span className="text-xs text-gray-500">Posted {job.posted}</span>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <Button 
                          variant="outline" 
                          className="text-sm border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light"
                        >
                          View Details
                        </Button>
                        <Button className="text-sm bg-thryvance-green hover:bg-thryvance-green-dark">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="operations">
                <div className="space-y-4">
                  {jobOpenings.filter(job => job.department === "Community Operations" || job.department === "Partnerships").map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-thryvance-green transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.department} • {job.location} • {job.type}</p>
                        </div>
                        <span className="text-xs text-gray-500">Posted {job.posted}</span>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <Button 
                          variant="outline" 
                          className="text-sm border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light"
                        >
                          View Details
                        </Button>
                        <Button className="text-sm bg-thryvance-green hover:bg-thryvance-green-dark">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="marketing">
                <div className="space-y-4">
                  {jobOpenings.filter(job => job.department === "Marketing").map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-thryvance-green transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.department} • {job.location} • {job.type}</p>
                        </div>
                        <span className="text-xs text-gray-500">Posted {job.posted}</span>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <Button 
                          variant="outline" 
                          className="text-sm border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light"
                        >
                          View Details
                        </Button>
                        <Button className="text-sm bg-thryvance-green hover:bg-thryvance-green-dark">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="text-center">
              <Button variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light">
                View All Openings
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Why Work With Us</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Meaningful Work</span>: Build technology that directly improves people's lives and strengthens communities.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Growth Opportunities</span>: Develop your skills and advance your career in a supportive environment.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Flexible Work</span>: Remote-friendly policies and work-life balance.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Inclusive Culture</span>: A diverse team where all voices are valued and respected.
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Our Values</h2>
              <div className="grid grid-cols-2 gap-4">
                {values.map((value, index) => (
                  <div key={index} className="border border-gray-200 rounded p-4">
                    <h3 className="font-medium text-thryvance-green mb-2">{value.title}</h3>
                    <p className="text-sm text-gray-700">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Don't See the Right Fit?</h2>
            <p className="text-gray-700 mb-6">
              We're always looking for talented individuals who are passionate about our mission.
              Submit your resume to <strong>thryvance.ca@gmail.com</strong> and we'll keep you in mind for future opportunities.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
