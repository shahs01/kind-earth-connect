
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Globe, Phone, Mail, Building, ExternalLink } from "lucide-react";
import { Nonprofit } from "@/hooks/useNonprofits";

interface NonprofitDetailDialogProps {
  nonprofit: Nonprofit | null;
  isOpen: boolean;
  onClose: () => void;
}

const NonprofitDetailDialog = ({ nonprofit, isOpen, onClose }: NonprofitDetailDialogProps) => {
  if (!isOpen || !nonprofit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-thryvance-neutral flex items-center justify-center overflow-hidden flex-shrink-0">
              {nonprofit.logo ? (
                <img 
                  src={nonprofit.logo} 
                  alt={nonprofit.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building className="h-8 w-8 text-thryvance-green" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{nonprofit.name}</CardTitle>
              <Badge variant="outline" className="bg-thryvance-green-light text-thryvance-green border-thryvance-green/20 mt-1">
                {nonprofit.category}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">About this organization</h3>
            <p className="text-gray-700 leading-relaxed">{nonprofit.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Contact Information</h4>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">{nonprofit.location}</span>
              </div>
              
              {nonprofit.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <a 
                    href={nonprofit.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-thryvance-blue hover:underline flex items-center gap-1"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              
              {nonprofit.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <a 
                    href={`tel:${nonprofit.phone_number}`} 
                    className="text-gray-700 hover:underline"
                  >
                    {nonprofit.phone_number}
                  </a>
                </div>
              )}
              
              {nonprofit.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <a 
                    href={`mailto:${nonprofit.email}`} 
                    className="text-thryvance-blue hover:underline"
                  >
                    {nonprofit.email}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Organization Details</h4>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Category</span>
                <p className="text-gray-900">{nonprofit.category}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${nonprofit.verified ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className="text-gray-900">
                    {nonprofit.verified ? 'Verified Organization' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex gap-2">
              {nonprofit.email && (
                <Button 
                  className="bg-thryvance-green hover:bg-thryvance-green-dark"
                  onClick={() => window.location.href = `mailto:${nonprofit.email}`}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              )}
              {nonprofit.website && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(nonprofit.website, '_blank')}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Website
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NonprofitDetailDialog;
