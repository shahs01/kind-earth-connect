
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, FileText, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SiteContent {
  id: string;
  section_key: string;
  title?: string;
  content?: string;
  updated_at: string;
}

const AdminSiteContent = () => {
  const [contentSections, setContentSections] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSiteContent();
  }, []);

  const fetchSiteContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section_key');

      if (error) throw error;
      setContentSections(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching site content",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: SiteContent, updates: Partial<SiteContent>) => {
    setSaving(section.id);
    try {
      const { error } = await supabase
        .from('site_content')
        .update(updates)
        .eq('id', section.id);

      if (error) throw error;
      
      toast({ title: "Content updated successfully" });
      fetchSiteContent();
    } catch (error: any) {
      toast({
        title: "Error updating content",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const updateSection = (sectionId: string, field: keyof SiteContent, value: string) => {
    setContentSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, [field]: value }
          : section
      )
    );
  };

  const getSectionDisplayName = (sectionKey: string) => {
    const displayNames: Record<string, string> = {
      'about_thryvance': 'About Thryvance',
      'our_mission': 'Our Mission',
      'our_story': 'Our Story'
    };
    return displayNames[sectionKey] || sectionKey.replace('_', ' ');
  };

  const getSectionDescription = (sectionKey: string) => {
    const descriptions: Record<string, string> = {
      'about_thryvance': 'Main description displayed at the top of the About page',
      'our_mission': 'Mission statement and core values section',
      'our_story': 'Company history and background story'
    };
    return descriptions[sectionKey] || 'Website content section';
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="h-8 w-8 animate-spin text-red-600" />
      <span className="ml-2">Loading site content...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-red-800">Site Content Management</h2>
        <p className="text-gray-600">Edit content sections displayed on your website pages</p>
      </div>

      <div className="space-y-6">
        {contentSections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content sections found</h3>
              <p className="text-gray-500 text-center">
                Site content sections will appear here once they're created
              </p>
            </CardContent>
          </Card>
        ) : (
          contentSections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="capitalize">
                  {getSectionDisplayName(section.section_key)}
                </CardTitle>
                <CardDescription>
                  {getSectionDescription(section.section_key)} • Last updated: {new Date(section.updated_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`title-${section.id}`}>Section Title</Label>
                  <Input
                    id={`title-${section.id}`}
                    value={section.title || ''}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                <div>
                  <Label htmlFor={`content-${section.id}`}>Content</Label>
                  <Textarea
                    id={`content-${section.id}`}
                    value={section.content || ''}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    rows={section.section_key === 'our_story' ? 8 : 4}
                    placeholder="Section content"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Use line breaks to create new paragraphs
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave(section, {
                      title: section.title,
                      content: section.content
                    })}
                    disabled={saving === section.id}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving === section.id ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSiteContent;
