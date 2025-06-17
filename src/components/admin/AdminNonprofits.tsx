import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNonprofits, Nonprofit } from "@/hooks/useNonprofits";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Building, Globe, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LogoUpload from "@/components/LogoUpload";

const categories = [
  "Food Assistance",
  "Housing & Shelter", 
  "Healthcare",
  "Youth Services",
  "Senior Services",
  "Veterans Services",
  "Education",
  "Job Training",
  "Crisis Support",
  "Mental Health",
  "Disability Services",
  "Environmental",
  "Animal Welfare"
];

const AdminNonprofits = () => {
  const { loading, fetchNonprofits, createNonprofit, updateNonprofit, deleteNonprofit } = useNonprofits();
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNonprofit, setEditingNonprofit] = useState<Nonprofit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    website: '',
    phone_number: '',
    email: '',
    logo: '',
    status: 'active' as 'active' | 'archived' | 'draft'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadNonprofits();
  }, []);

  const loadNonprofits = async () => {
    const data = await fetchNonprofits(true); // Include all statuses for admin
    setNonprofits(data);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      location: '',
      website: '',
      phone_number: '',
      email: '',
      logo: '',
      status: 'active'
    });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.description || !formData.category || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, description, category, location).",
        variant: "destructive",
      });
      return;
    }

    const success = await createNonprofit({
      ...formData,
      verified: true
    });

    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
      loadNonprofits();
    }
  };

  const handleEdit = (nonprofit: Nonprofit) => {
    setEditingNonprofit(nonprofit);
    setFormData({
      name: nonprofit.name,
      description: nonprofit.description,
      category: nonprofit.category,
      location: nonprofit.location,
      website: nonprofit.website || '',
      phone_number: nonprofit.phone_number || '',
      email: nonprofit.email || '',
      logo: nonprofit.logo || '',
      status: nonprofit.status
    });
  };

  const handleUpdate = async () => {
    if (!editingNonprofit) return;

    if (!formData.name || !formData.description || !formData.category || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, description, category, location).",
        variant: "destructive",
      });
      return;
    }

    const success = await updateNonprofit(editingNonprofit.id, formData);

    if (success) {
      setEditingNonprofit(null);
      resetForm();
      loadNonprofits();
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteNonprofit(id);
    if (success) {
      loadNonprofits();
    }
  };

  const handleStatusChange = async (nonprofit: Nonprofit, newStatus: 'active' | 'archived' | 'draft') => {
    const success = await updateNonprofit(nonprofit.id, { status: newStatus });
    if (success) {
      loadNonprofits();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && nonprofits.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2">Loading nonprofits...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-800">Manage Nonprofits</h2>
          <p className="text-gray-600">Create, edit, and manage nonprofit organizations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Nonprofit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Nonprofit</DialogTitle>
              <DialogDescription>
                Add a new nonprofit organization to the directory
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nonprofit organization name"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the organization's mission and services"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.org"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@nonprofit.org"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Logo</label>
                <LogoUpload
                  currentLogo={formData.logo}
                  onLogoUpdate={(logoUrl) => setFormData({ ...formData, logo: logoUrl })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'archived' | 'draft') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Visible to public)</SelectItem>
                    <SelectItem value="draft">Draft (Hidden from public)</SelectItem>
                    <SelectItem value="archived">Archived (Hidden from public)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Nonprofit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {nonprofits.map((nonprofit) => (
          <Card key={nonprofit.id} className="border-red-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-red-50 flex items-center justify-center overflow-hidden">
                    {nonprofit.logo ? (
                      <img 
                        src={nonprofit.logo} 
                        alt={nonprofit.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-red-800">{nonprofit.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {nonprofit.category}
                      </Badge>
                      <Badge className={getStatusColor(nonprofit.status)}>
                        {nonprofit.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={nonprofit.status}
                    onValueChange={(value: 'active' | 'archived' | 'draft') => handleStatusChange(nonprofit, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4" />
                          Draft
                        </div>
                      </SelectItem>
                      <SelectItem value="archived">
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4" />
                          Archived
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(nonprofit)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Nonprofit</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{nonprofit.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(nonprofit.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{nonprofit.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>{nonprofit.location}</span>
                </div>
                {nonprofit.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a href={nonprofit.website} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {nonprofit.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{nonprofit.phone_number}</span>
                  </div>
                )}
                {nonprofit.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{nonprofit.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {nonprofits.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No nonprofits yet</h3>
              <p className="text-gray-500 mb-4">Start by creating your first nonprofit organization</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Nonprofit
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      {editingNonprofit && (
        <Dialog open={!!editingNonprofit} onOpenChange={() => setEditingNonprofit(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Nonprofit</DialogTitle>
              <DialogDescription>
                Update the nonprofit organization details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nonprofit organization name"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the organization's mission and services"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.org"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@nonprofit.org"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Logo</label>
                <LogoUpload
                  currentLogo={formData.logo}
                  onLogoUpdate={(logoUrl) => setFormData({ ...formData, logo: logoUrl })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'archived' | 'draft') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Visible to public)</SelectItem>
                    <SelectItem value="draft">Draft (Hidden from public)</SelectItem>
                    <SelectItem value="archived">Archived (Hidden from public)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingNonprofit(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Nonprofit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminNonprofits;
