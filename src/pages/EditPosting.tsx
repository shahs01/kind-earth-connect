
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X, Upload } from "lucide-react";
import { categories } from "@/data/searchHelpData";
import { useAuth } from "@/context/AuthContext";

const EditPosting = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"offer" | "request">("offer");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photosToRemove, setPhotosToRemove] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data: post, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single();

        if (error) throw error;

        // Check if the current user is the post owner
        if (post.user_id !== user?.id) {
          toast({
            title: "Unauthorized",
            description: "You can only edit your own posts",
            variant: "destructive",
          });
          navigate("/profile");
          return;
        }

        // Populate form fields
        setTitle(post.title || "");
        setDescription(post.description || "");
        setCategory(post.category || "");
        setType(post.type as "offer" | "request");
        setLocation(post.location || "");
        setAvailability(post.availability || "");
        setTimeframe(post.timeframe || "");
        setExistingPhotos(post.photos || []);
      } catch (err: any) {
        console.error("Error fetching post:", err);
        toast({
          title: "Error",
          description: "Could not load the post for editing",
          variant: "destructive",
        });
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, user, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);

      // Handle photo uploads for new photos
      let updatedPhotos = [...existingPhotos];

      // Remove any photos that were marked for removal
      updatedPhotos = updatedPhotos.filter(
        (photo) => !photosToRemove.includes(photo)
      );

      // Upload new photos
      if (newPhotos.length > 0) {
        for (const photo of newPhotos) {
          const fileExt = photo.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("post_photos")
            .upload(filePath, photo);

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL
          const { data } = supabase.storage
            .from("post_photos")
            .getPublicUrl(filePath);

          if (data.publicUrl) {
            updatedPhotos.push(data.publicUrl);
          }
        }
      }

      // Update post in the database
      const { error } = await supabase
        .from("posts")
        .update({
          title,
          description,
          category,
          type,
          location,
          availability,
          timeframe,
          photos: updatedPhotos,
          status: "active", // Ensure it's active when updated
        })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your post has been updated",
        variant: "default",
      });

      navigate(`/profile/${user.id}`);
    } catch (err: any) {
      console.error("Error updating post:", err);
      toast({
        title: "Error",
        description: "Could not update your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setNewPhotos([...newPhotos, ...newFiles]);
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (photoUrl: string) => {
    setPhotosToRemove([...photosToRemove, photoUrl]);
  };

  const categoryOptions = categories.map((category) => ({
    label: category,
    value: category,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10 bg-thryvance-neutral-light">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Edit Your Post</h1>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type">Post Type *</Label>
                      <Select
                        value={type}
                        onValueChange={(value) => setType(value as "offer" | "request")}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="offer">Offering Help</SelectItem>
                          <SelectItem value="request">Requesting Help</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={category}
                        onValueChange={(value) => setCategory(value)}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, State/Province, Country"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Input
                        id="availability"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        placeholder="e.g. Weekends, Evenings, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeframe">Timeframe</Label>
                      <Input
                        id="timeframe"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        placeholder="e.g. One-time, Ongoing, etc."
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Photos</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingPhotos
                        .filter((photo) => !photosToRemove.includes(photo))
                        .map((photo, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square border rounded-md overflow-hidden"
                          >
                            <img
                              src={photo}
                              alt={`Post photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="rounded-full p-2 h-auto w-auto"
                                type="button"
                                onClick={() => removeExistingPhoto(photo)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                      {newPhotos.map((photo, index) => (
                        <div
                          key={`new-${index}`}
                          className="relative group aspect-square border rounded-md overflow-hidden"
                        >
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`New photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-full p-2 h-auto w-auto"
                              type="button"
                              onClick={() => removeNewPhoto(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md border-gray-300 cursor-pointer hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            Add Photo
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditPosting;
