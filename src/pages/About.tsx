import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAboutImages } from "@/hooks/useAboutImages";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio?: string;
  photo_url?: string;
  linkedin_url?: string;
  order_position: number;
  is_active: boolean;
}

interface SiteContent {
  section_key: string;
  title?: string;
  content?: string;
}

const About = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [loading, setLoading] = useState(true);
  
  const { data: missionImages } = useAboutImages('our_mission');
  const { data: storyImages } = useAboutImages('our_story');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch team members
      const { data: members, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (teamError) throw teamError;

      // Fetch site content
      const { data: contentData, error: contentError } = await supabase
        .from('site_content')
        .select('*')
        .in('section_key', ['about_thryvance', 'our_mission', 'our_story']);

      if (contentError) throw contentError;

      setTeamMembers(members || []);
      
      // Convert content array to object for easy access
      const contentMap = (contentData || []).reduce((acc, item) => {
        acc[item.section_key] = item;
        return acc;
      }, {} as Record<string, SiteContent>);
      
      setContent(contentMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentValue = (key: string, field: 'title' | 'content', fallback: string) => {
    return content[key]?.[field] || fallback;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {getContentValue('about_thryvance', 'title', 'About Thryvance')}
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            {getContentValue('about_thryvance', 'content', 'Thryvance is a community-focused platform connecting people and resources to create thriving communities.')}
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {getContentValue('our_mission', 'title', 'Our Mission')}
            </h2>
            <div className="text-gray-700 mb-6 whitespace-pre-line">
              {getContentValue('our_mission', 'content', 'We believe that when communities have access to the right resources and connections, they can thrive and overcome challenges together.')}
            </div>
            
            {/* Mission Images */}
            {missionImages && missionImages.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {missionImages.map((image) => (
                    <div key={image.id} className="rounded-lg overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || 'Mission image'}
                        className="w-full h-48 object-cover"
                      />
                      {image.caption && (
                        <p className="text-sm text-gray-600 mt-2 px-2">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show placeholder if no images uploaded */}
            {(!missionImages || missionImages.length === 0) && (
              <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
            )}
            
            <h3 className="text-lg font-medium mb-3">Core Values</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Community-First</span>: We put community needs at the center of everything we do.
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Accessibility</span>: Making resources accessible to all community members.
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Empowerment</span>: Building capacity for communities to help themselves.
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Transparency</span>: Open and honest in all our operations and communications.
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {getContentValue('our_story', 'title', 'Our Story')}
            </h2>
            <div className="space-y-4 text-gray-700 whitespace-pre-line mb-6">
              {getContentValue('our_story', 'content', 'Thryvance began in 2022 when a group of community organizers noticed a disconnect between available resources and community needs.')}
            </div>
            
            {/* Story Images */}
            {storyImages && storyImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storyImages.map((image) => (
                  <div key={image.id} className="rounded-lg overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || 'Story image'}
                      className="w-full h-48 object-cover"
                    />
                    {image.caption && (
                      <p className="text-sm text-gray-600 mt-2 px-2">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Team</h2>
            {teamMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No team members to display at the moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {teamMembers.map(member => (
                  <div key={member.id} className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-3">
                      <AvatarImage src={member.photo_url || ''} alt={member.name} />
                      <AvatarFallback className="text-lg">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.title}</p>
                    {member.bio && (
                      <p className="text-xs text-gray-600 mt-1">{member.bio}</p>
                    )}
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 inline-block mt-1"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Join Our Mission</h2>
            <p className="text-gray-700 mb-5">
              There are many ways to get involved with Thryvance and support our mission of building thriving communities.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-thryvance-green hover:bg-thryvance-green-dark">
                Join the Community
              </Button>
              <Button variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light">
                Partner With Us
              </Button>
              <Button variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light">
                View Open Positions
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
