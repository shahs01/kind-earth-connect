
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Calendar, Clock, Users, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import VolunteerSignupForm from "./VolunteerSignupForm";

interface VolunteerOpportunityDialogProps {
  opportunity: any;
  isOpen: boolean;
  onClose: () => void;
}

const VolunteerOpportunityDialog = ({ opportunity, isOpen, onClose }: VolunteerOpportunityDialogProps) => {
  const { isAuthenticated } = useAuth();
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !opportunity) return null;

  const extractVolunteerDetails = (description: string) => {
    const parts = description.split('VOLUNTEER OPPORTUNITY DETAILS:');
    const mainDescription = parts[0].trim();
    const detailsSection = parts[1] || '';
    
    const scheduleMatch = detailsSection.match(/Schedule: (.+?)(?=\n|$)/);
    const commitmentMatch = detailsSection.match(/Commitment: (.+?)(?=\n|$)/);
    const spotsMatch = detailsSection.match(/Available Spots: (.+?)(?=\n|$)/);
    
    return {
      mainDescription,
      schedule: scheduleMatch?.[1] || 'Not specified',
      commitment: commitmentMatch?.[1] || 'Not specified',
      spots: spotsMatch?.[1] || 'Not specified'
    };
  };

  const details = extractVolunteerDetails(opportunity.description);
  const hasImages = opportunity.photos && opportunity.photos.length > 0;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % opportunity.photos.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + opportunity.photos.length) % opportunity.photos.length);
    }
  };

  const handleSignUp = () => {
    if (!isAuthenticated) {
      // This should not happen since we check auth state, but just in case
      return;
    }
    setShowSignupForm(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{opportunity.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {opportunity.location}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Posted by {opportunity.user.name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(opportunity.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {hasImages && (
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                  <img 
                    src={opportunity.photos[currentImageIndex]} 
                    alt={`${opportunity.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {opportunity.photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {opportunity.photos.length}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-thryvance-green-light text-thryvance-green border-thryvance-green/20">
                {opportunity.category}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">About this opportunity</h3>
              <p className="text-gray-700 leading-relaxed">{details.mainDescription}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-thryvance-green" />
                  <span className="font-medium">Schedule</span>
                </div>
                <p className="text-sm text-gray-600">{details.schedule}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-thryvance-green" />
                  <span className="font-medium">Commitment</span>
                </div>
                <p className="text-sm text-gray-600">{details.commitment}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-thryvance-green" />
                  <span className="font-medium">Available Spots</span>
                </div>
                <p className="text-sm text-gray-600">{details.spots}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {isAuthenticated && (
                <Button 
                  className="bg-thryvance-green hover:bg-thryvance-green-dark"
                  onClick={handleSignUp}
                >
                  <User className="mr-2 h-4 w-4" />
                  Apply to Volunteer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <VolunteerSignupForm
        opportunity={opportunity}
        isOpen={showSignupForm}
        onClose={() => setShowSignupForm(false)}
      />
    </>
  );
};

export default VolunteerOpportunityDialog;
