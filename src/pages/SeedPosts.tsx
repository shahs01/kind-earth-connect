
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { seedPosts } from '@/utils/seedPosts';

const SeedPosts = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeedPosts = async () => {
    setIsSeeding(true);
    setError(null);
    setIsComplete(false);
    
    try {
      await seedPosts();
      setIsComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while seeding posts');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Seed Sample Data</h2>
          <p className="text-gray-600">Generate sample posts and users for development and testing</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Seed Database with Sample Posts</CardTitle>
          <CardDescription>
            This will create 100 realistic posts (50 offers + 50 requests) with authentic usernames, varied timestamps over the past 40 days, and content to make your platform look active and trustworthy. Posts will appear in Community and Search Help feeds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isComplete && !error && (
            <Button 
              onClick={handleSeedPosts} 
              disabled={isSeeding}
              className="w-full"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Posts...
                </>
              ) : (
                'Seed 100 Sample Posts'
              )}
            </Button>
          )}
          
          {isComplete && (
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              <span className="text-green-800">Successfully created 100 sample posts!</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          )}
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>What this will create:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>35 unique user profiles with authentic usernames</li>
              <li>50 "Offer" posts across various categories</li>
              <li>50 "Request" posts for different needs</li>
              <li>Posts distributed across BC, Alberta, and Ontario locations</li>
              <li>Realistic descriptions with casual, authentic language</li>
              <li>Varied timestamps over the past 40 days</li>
              <li>Varied image assignments (70% single image, 20% multiple, 10% none)</li>
            </ul>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Posts will appear in the Community feed (/community) and Search Help page (/search-help), and will be fully searchable by title, description, category, and location.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeedPosts;
