
import { Link } from "react-router-dom";
import { TrendingUp, Users, Heart, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useImpactMetrics } from "@/hooks/useImpact";

const ImpactPreviewSection = () => {
  const { data: metrics, isLoading } = useImpactMetrics();

  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'total_posts_created':
        return <TrendingUp className="h-6 w-6 text-thryvance-green" />;
      case 'people_helped':
        return <Users className="h-6 w-6 text-thryvance-green" />;
      case 'ngos_listed':
        return <Building className="h-6 w-6 text-thryvance-green" />;
      default:
        return <Heart className="h-6 w-6 text-thryvance-green" />;
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-thryvance-green-light/30 to-thryvance-blue-light/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Our Growing Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how our community is making a real difference across British Columbia through acts of kindness and mutual support.
          </p>
        </div>

        {/* Impact Metrics Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="text-center bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            metrics?.slice(0, 3).map((metric) => (
              <Card key={metric.id} className="text-center bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {getMetricIcon(metric.metric_key)}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
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

        {/* Call to Action */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-thryvance-green hover:bg-thryvance-green-dark text-white">
            <Link to="/our-impact">
              View Full Impact Report
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ImpactPreviewSection;
