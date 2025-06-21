
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useAdminImpactMetrics, 
  useUpdateImpactMetric,
  useAdminImpactPhotos,
  useCreateImpactPhoto,
  useDeleteImpactPhoto,
  useAdminCoveredLocations,
  useCreateCoveredLocation,
  useDeleteCoveredLocation
} from "@/hooks/useAdmin";
import { Trash2, Plus, Save } from "lucide-react";

const AdminImpact = () => {
  const [newPhoto, setNewPhoto] = useState({
    title: "",
    description: "",
    photo_url: "",
    alt_text: "",
    order_position: 0,
    is_active: true
  });

  const [newLocation, setNewLocation] = useState({
    city_name: "",
    region: "",
    is_active: true,
    user_count: 0,
    post_count: 0,
    coordinates: null
  });

  const { data: metrics, isLoading: metricsLoading } = useAdminImpactMetrics();
  const { data: photos, isLoading: photosLoading } = useAdminImpactPhotos();
  const { data: locations, isLoading: locationsLoading } = useAdminCoveredLocations();
  
  const updateMetricMutation = useUpdateImpactMetric();
  const createPhotoMutation = useCreateImpactPhoto();
  const deletePhotoMutation = useDeleteImpactPhoto();
  const createLocationMutation = useCreateCoveredLocation();
  const deleteLocationMutation = useDeleteCoveredLocation();

  const handleUpdateMetric = (id: string, value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue)) {
      updateMetricMutation.mutate({ id, metric_value: numericValue });
    }
  };

  const handleCreatePhoto = () => {
    if (newPhoto.title && newPhoto.photo_url) {
      createPhotoMutation.mutate(newPhoto);
      setNewPhoto({
        title: "",
        description: "",
        photo_url: "",
        alt_text: "",
        order_position: 0,
        is_active: true
      });
    }
  };

  const handleCreateLocation = () => {
    if (newLocation.city_name && newLocation.region) {
      createLocationMutation.mutate(newLocation);
      setNewLocation({
        city_name: "",
        region: "",
        is_active: true,
        user_count: 0,
        post_count: 0,
        coordinates: null
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impact Management</h1>
        <p className="text-gray-600">Manage impact metrics, photos, and covered locations</p>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics">Impact Metrics</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Impact Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <p>Loading metrics...</p>
              ) : (
                <div className="space-y-4">
                  {metrics?.map((metric) => (
                    <div key={metric.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{metric.display_name}</h3>
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          defaultValue={metric.metric_value}
                          className="w-24"
                          onBlur={(e) => handleUpdateMetric(metric.id, e.target.value)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateMetric(metric.id, document.querySelector(`input[defaultValue="${metric.metric_value}"]`)?.value || "0")}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="photo-title">Title</Label>
                  <Input
                    id="photo-title"
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Photo title"
                  />
                </div>
                <div>
                  <Label htmlFor="photo-description">Description</Label>
                  <Textarea
                    id="photo-description"
                    value={newPhoto.description}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Photo description"
                  />
                </div>
                <div>
                  <Label htmlFor="photo-url">Photo URL</Label>
                  <Input
                    id="photo-url"
                    value={newPhoto.photo_url}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, photo_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="alt-text">Alt Text</Label>
                  <Input
                    id="alt-text"
                    value={newPhoto.alt_text}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="Alt text for accessibility"
                  />
                </div>
                <Button onClick={handleCreatePhoto} disabled={createPhotoMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Photos</CardTitle>
              </CardHeader>
              <CardContent>
                {photosLoading ? (
                  <p>Loading photos...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos?.map((photo) => (
                      <div key={photo.id} className="border rounded-lg p-4">
                        <img
                          src={photo.photo_url}
                          alt={photo.alt_text || photo.title}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <h3 className="font-semibold">{photo.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePhotoMutation.mutate(photo.id)}
                          disabled={deletePhotoMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="city-name">City Name</Label>
                  <Input
                    id="city-name"
                    value={newLocation.city_name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, city_name: e.target.value }))}
                    placeholder="City name"
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={newLocation.region}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, region: e.target.value }))}
                    placeholder="Region or area"
                  />
                </div>
                <Button onClick={handleCreateLocation} disabled={createLocationMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Covered Locations</CardTitle>
              </CardHeader>
              <CardContent>
                {locationsLoading ? (
                  <p>Loading locations...</p>
                ) : (
                  <div className="space-y-2">
                    {locations?.map((location) => (
                      <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-semibold">{location.city_name}</span>
                          <span className="text-gray-600 ml-2">({location.region})</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {location.user_count} users • {location.post_count} posts
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteLocationMutation.mutate(location.id)}
                          disabled={deleteLocationMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminImpact;
