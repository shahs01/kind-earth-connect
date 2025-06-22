
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Upload } from "lucide-react";
import { useAdminAboutImages, useCreateAboutImage, useUpdateAboutImage, useDeleteAboutImage, useUploadAboutImage, type AboutImage } from "@/hooks/useAboutImages";

const AdminAboutImages = () => {
  const { data: images, isLoading } = useAdminAboutImages();
  const createImage = useCreateAboutImage();
  const updateImage = useUpdateAboutImage();
  const deleteImage = useDeleteAboutImage();
  const uploadImage = useUploadAboutImage();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<AboutImage | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    section_key: '',
    image_url: '',
    alt_text: '',
    caption: '',
    order_position: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      section_key: '',
      image_url: '',
      alt_text: '',
      caption: '',
      order_position: 0,
      is_active: true,
    });
    setUploadingFile(null);
    setEditingImage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(file);
    }
  };

  const handleUploadAndCreate = async () => {
    if (!uploadingFile) return;

    try {
      const imageUrl = await uploadImage.mutateAsync(uploadingFile);
      await createImage.mutateAsync({
        ...formData,
        image_url: imageUrl,
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating image:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingImage) return;

    let imageUrl = formData.image_url;
    
    if (uploadingFile) {
      imageUrl = await uploadImage.mutateAsync(uploadingFile);
    }

    await updateImage.mutateAsync({
      id: editingImage.id,
      ...formData,
      image_url: imageUrl,
    });
    setEditingImage(null);
    resetForm();
  };

  const handleEdit = (image: AboutImage) => {
    setEditingImage(image);
    setFormData({
      section_key: image.section_key,
      image_url: image.image_url,
      alt_text: image.alt_text || '',
      caption: image.caption || '',
      order_position: image.order_position,
      is_active: image.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteImage.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">About Us Images</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New About Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={formData.section_key} onValueChange={(value) => setFormData(prev => ({ ...prev, section_key: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="our_mission">Our Mission</SelectItem>
                    <SelectItem value="our_story">Our Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file">Upload Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>

              <div>
                <Label htmlFor="alt_text">Alt Text</Label>
                <Input
                  value={formData.alt_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="Descriptive text for accessibility"
                />
              </div>

              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Optional caption for the image"
                />
              </div>

              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  type="number"
                  value={formData.order_position}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_position: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <Button 
                onClick={handleUploadAndCreate} 
                disabled={!uploadingFile || !formData.section_key}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload and Add Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images?.map((image) => (
          <Card key={image.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm">
                    {image.section_key === 'our_mission' ? 'Our Mission' : 'Our Story'}
                  </CardTitle>
                  <Badge variant={image.is_active ? "default" : "secondary"}>
                    {image.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(image)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(image.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src={image.image_url}
                alt={image.alt_text || ''}
                className="w-full h-32 object-cover rounded mb-2"
              />
              {image.caption && (
                <p className="text-xs text-gray-600 mb-2">{image.caption}</p>
              )}
              <p className="text-xs text-gray-500">Order: {image.order_position}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingImage && (
        <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={formData.section_key} onValueChange={(value) => setFormData(prev => ({ ...prev, section_key: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="our_mission">Our Mission</SelectItem>
                    <SelectItem value="our_story">Our Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Current Image</Label>
                <img src={formData.image_url} alt="" className="w-full h-32 object-cover rounded mb-2" />
                <Label htmlFor="file">Upload New Image (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>

              <div>
                <Label htmlFor="alt_text">Alt Text</Label>
                <Input
                  value={formData.alt_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="Descriptive text for accessibility"
                />
              </div>

              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Optional caption for the image"
                />
              </div>

              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  type="number"
                  value={formData.order_position}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_position: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <Button onClick={handleUpdate} className="w-full">
                Update Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminAboutImages;
