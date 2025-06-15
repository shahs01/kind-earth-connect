import { useEffect, useState } from "react";
import { SiteSetting, useAdminSiteSettings, useUpdateSiteSetting } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const AdminSettings = () => {
  const { data: settings = [], isLoading } = useAdminSiteSettings();
  const { mutate: updateSetting } = useUpdateSiteSetting();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settings.length > 0) {
        const values: Record<string, any> = {};
        settings.forEach(setting => {
            values[setting.key] = setting.value;
        });
        setLocalValues(values);
    }
  }, [settings]);

  const handleSave = async (key: string) => {
    setSavingKey(key);
    updateSetting({ key, value: localValues[key] }, {
      onSettled: () => {
        setSavingKey(null);
      }
    });
  };

  const renderSettingInput = (setting: SiteSetting) => {
    const value = localValues[setting.key];
    
    if (typeof value === 'boolean') {
      return (
        <Switch
          checked={value}
          onCheckedChange={(checked) => 
            setLocalValues(prev => ({ ...prev, [setting.key]: checked }))
          }
        />
      );
    }
    
    if (typeof value === 'number') {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => 
            setLocalValues(prev => ({ ...prev, [setting.key]: parseInt(e.target.value) }))
          }
        />
      );
    }
    
    if (setting.key.includes('description')) {
      return (
        <Textarea
          value={value?.replace(/"/g, '') || ''}
          onChange={(e) => 
            setLocalValues(prev => ({ ...prev, [setting.key]: `"${e.target.value}"` }))
          }
          rows={3}
        />
      );
    }
    
    return (
      <Input
        value={value?.replace(/"/g, '') || ''}
        onChange={(e) => 
          setLocalValues(prev => ({ ...prev, [setting.key]: `"${e.target.value}"` }))
        }
      />
    );
  };

  const formatKeyForDisplay = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading && settings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Site Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.key} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor={setting.key} className="text-base font-medium">
                {formatKeyForDisplay(setting.key)}
              </Label>
              <Button
                size="sm"
                onClick={() => handleSave(setting.key)}
                disabled={savingKey === setting.key}
              >
                {savingKey === setting.key ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
            
            {setting.description && (
              <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
            )}
            
            {renderSettingInput(setting)}
            
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {setting.updated_at ? 
                new Date(setting.updated_at).toLocaleDateString() : 
                'Never'
              }
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
