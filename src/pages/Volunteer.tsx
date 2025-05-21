
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { User, Clock, Calendar, MapPin, Users as UsersIcon } from "lucide-react";

const Volunteer = () => {
  const opportunities = [
    {
      id: 1,
      title: "Community Garden Helper",
      location: "East Side Neighborhood",
      schedule: "Weekends, 9am-12pm",
      commitment: "Flexible",
      category: "Environment",
      spots: 8
    },
    {
      id: 2,
      title: "Literacy Tutor",
      location: "Multiple Libraries",
      schedule: "Weekday evenings",
      commitment: "3 months minimum",
      category: "Education",
      spots: 5
    },
    {
      id: 3,
      title: "Food Pantry Assistant",
      location: "Central Community Center",
      schedule: "Tuesdays & Thursdays, 2pm-5pm",
      commitment: "Weekly",
      category: "Food Security",
      spots: 12
    },
    {
      id: 4,
      title: "Senior Companion",
      location: "Various Neighborhoods",
      schedule: "Flexible hours",
      commitment: "2 hours/week",
      category: "Senior Support",
      spots: 20
    },
    {
      id: 5,
      title: "Youth Mentor",
      location: "Westside Youth Center",
      schedule: "After school hours",
      commitment: "6 months minimum",
      category: "Youth",
      spots: 10
    },
    {
      id: 6,
      title: "Event Organizer",
      location: "Various Locations",
      schedule: "Based on event schedule",
      commitment: "Project-based",
      category: "Community Events",
      spots: 6
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Volunteer Your Time</h1>
          <p className="text-lg text-gray-700 mb-8">
            Share your time and talents to make a difference in your community.
            We offer a variety of volunteer opportunities for all skills and schedules.
          </p>
          
          <div className="flex flex-wrap gap-3 mb-8">
            <Button variant="outline" className="bg-thryvance-green text-white hover:bg-thryvance-green-dark">
              All Opportunities
            </Button>
            <Button variant="outline">One-Time</Button>
            <Button variant="outline">Ongoing</Button>
            <Button variant="outline">Remote</Button>
            <Button variant="outline">In-Person</Button>
            <Button variant="outline">Groups</Button>
            <Button variant="outline">Individuals</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {opportunities.map(opportunity => (
              <div key={opportunity.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                    <span className="bg-thryvance-green-light text-thryvance-green text-xs font-medium px-2 py-1 rounded">
                      {opportunity.category}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {opportunity.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {opportunity.schedule}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Commitment: {opportunity.commitment}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      {opportunity.spots} spots available
                    </div>
                  </div>
                  
                  <Button className="w-full bg-thryvance-green hover:bg-thryvance-green-dark">
                    <User className="mr-2 h-4 w-4" />
                    Sign Up to Volunteer
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Virtual Volunteer Opportunities</h2>
            <p className="text-gray-700 mb-4">
              Can't volunteer in person? We also offer remote opportunities:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-5">
              <li>Online tutoring and mentorship</li>
              <li>Digital content creation</li>
              <li>Administrative support</li>
              <li>Translation services</li>
              <li>Virtual event planning</li>
            </ul>
            <Button variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light">
              Browse Virtual Opportunities
            </Button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Group Volunteering</h2>
            <p className="text-gray-700 mb-4">
              Looking for team-building opportunities or ways to give back with your:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div className="bg-white p-3 rounded text-center">Company</div>
              <div className="bg-white p-3 rounded text-center">School</div>
              <div className="bg-white p-3 rounded text-center">Faith Group</div>
              <div className="bg-white p-3 rounded text-center">Community Org</div>
            </div>
            <Button className="bg-thryvance-green hover:bg-thryvance-green-dark">
              Request Group Volunteer Day
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Volunteer;
