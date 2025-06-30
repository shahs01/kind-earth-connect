
import { supabase } from "@/integrations/supabase/client";

interface TestUser {
  email: string;
  password: string;
  username: string;
  name: string;
  location: string;
}

// Generate realistic usernames to avoid looking auto-generated
const generateUsername = (index: number): string => {
  const prefixes = ['sarah', 'mike', 'emma', 'david', 'lisa', 'alex', 'maya', 'james', 'rachel', 'kevin', 'amanda', 'ryan', 'sophie', 'chris', 'jen', 'mark', 'nicole', 'tyler', 'jessica', 'brandon'];
  const suffixes = ['123', 'van', 'help', '88', 'bc', 'can', 'user', 'new', 'friendly', 'kind'];
  
  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixes[Math.floor(index / prefixes.length) % suffixes.length];
  const number = Math.floor(index / (prefixes.length * suffixes.length)) + 1;
  
  if (number === 1) {
    return `${prefix}_${suffix}`;
  }
  return `${prefix}_${suffix}${number}`;
};

// Generate realistic names
const generateName = (index: number): string => {
  const firstNames = ['Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Alex', 'Maya', 'James', 'Rachel', 'Kevin', 'Amanda', 'Ryan', 'Sophie', 'Chris', 'Jennifer', 'Mark', 'Nicole', 'Tyler', 'Jessica', 'Brandon'];
  const lastNames = ['Chen', 'Thompson', 'Rodriguez', 'Kim', 'Wong', 'Johnson', 'Patel', 'Wilson', 'Green', 'Lee', 'Foster', 'Miller', 'Taylor', 'Brown', 'Davis', 'Garcia', 'Martinez', 'Anderson', 'Moore', 'Jackson'];
  
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  
  return `${firstName} ${lastName}`;
};

// Generate locations (mostly BC, some AB and ON)
const generateLocation = (index: number): string => {
  const locations = [
    // BC locations (70%)
    'Vancouver, BC', 'Richmond, BC', 'Burnaby, BC', 'Surrey, BC', 'Victoria, BC', 
    'New Westminster, BC', 'Kelowna, BC', 'Abbotsford, BC', 'Coquitlam, BC', 'Langley, BC',
    'Delta, BC', 'North Vancouver, BC', 'Kamloops, BC', 'Nanaimo, BC', 'Prince George, BC',
    'Chilliwack, BC', 'Vernon, BC', 'Penticton, BC', 'Campbell River, BC', 'Courtenay, BC',
    'Port Coquitlam, BC', 'Maple Ridge, BC', 'New Westminster, BC', 'White Rock, BC', 'Port Moody, BC',
    'Burnaby, BC', 'Richmond, BC', 'Surrey, BC', 'Vancouver, BC', 'Victoria, BC',
    'Kelowna, BC', 'Kamloops, BC', 'Nanaimo, BC', 'Abbotsford, BC', 'Coquitlam, BC',
    'Langley, BC', 'Delta, BC', 'North Vancouver, BC', 'Chilliwack, BC', 'Vernon, BC',
    'Penticton, BC', 'Campbell River, BC', 'Courtenay, BC', 'Port Coquitlam, BC', 'Maple Ridge, BC',
    'White Rock, BC', 'Port Moody, BC', 'West Vancouver, BC', 'Mission, BC', 'Cranbrook, BC',
    'Prince Rupert, BC', 'Dawson Creek, BC', 'Fort St. John, BC', 'Quesnel, BC', 'Williams Lake, BC',
    'Terrace, BC', 'Powell River, BC', 'Squamish, BC', 'Whistler, BC', 'Pemberton, BC',
    'Hope, BC', 'Merritt, BC', 'Salmon Arm, BC', 'Revelstoke, BC', 'Invermere, BC',
    'Fernie, BC', 'Nelson, BC', 'Castlegar, BC', 'Trail, BC', 'Grand Forks, BC',
    'Oliver, BC', 'Osoyoos, BC', 'Princeton, BC', 'Lillooet, BC', 'Cache Creek, BC',
    // Alberta locations (20%)
    'Calgary, AB', 'Edmonton, AB', 'Red Deer, AB', 'Lethbridge, AB', 'Medicine Hat, AB',
    'Grande Prairie, AB', 'Airdrie, AB', 'Spruce Grove, AB', 'Leduc, AB', 'Lloydminster, AB',
    'Camrose, AB', 'Wetaskiwin, AB', 'Cold Lake, AB', 'Fort McMurray, AB', 'Canmore, AB',
    'Jasper, AB', 'Banff, AB', 'Drumheller, AB', 'High River, AB', 'Okotoks, AB',
    // Ontario locations (10%)
    'Toronto, ON', 'Ottawa, ON', 'Mississauga, ON', 'Hamilton, ON', 'London, ON',
    'Kitchener, ON', 'Windsor, ON', 'Oshawa, ON', 'Kingston, ON', 'Guelph, ON'
  ];
  
  return locations[index % locations.length];
};

// Delay function to handle rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createTestUsers = async (): Promise<TestUser[]> => {
  const testUsers: TestUser[] = [];
  
  // Generate 100 test users
  for (let i = 1; i <= 100; i++) {
    testUsers.push({
      email: `tester${i}@gmail.com`,
      password: '#Aa123456',
      username: generateUsername(i - 1),
      name: generateName(i - 1),
      location: generateLocation(i - 1)
    });
  }
  
  console.log('Generated test user data, starting account creation...');
  
  // Create users with much more conservative rate limiting
  const createdUsers: TestUser[] = [];
  let successCount = 0;
  let errorCount = 0;
  let rateLimitCount = 0;
  
  // Process users one at a time with longer delays
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    
    try {
      console.log(`[${i + 1}/100] Creating user: ${user.email}`);
      
      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            username: user.username,
            name: user.name,
            location: user.location
          }
        }
      });
      
      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('429') || error.status === 429) {
          console.log(`Rate limited for user ${user.email}, waiting 10 seconds...`);
          rateLimitCount++;
          await delay(10000); // Wait 10 seconds on rate limit
          
          // Retry once
          const { data: retryData, error: retryError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              data: {
                username: user.username,
                name: user.name,
                location: user.location
              }
            }
          });
          
          if (retryError) {
            console.error(`Failed to create user ${user.email} even after retry:`, retryError.message);
            errorCount++;
          } else if (retryData.user) {
            createdUsers.push(user);
            successCount++;
            console.log(`✓ Created user ${successCount}/100: ${user.email} (after retry)`);
          }
        } else {
          console.error(`Failed to create user ${user.email}:`, error.message);
          errorCount++;
        }
      } else if (data.user) {
        createdUsers.push(user);
        successCount++;
        console.log(`✓ Created user ${successCount}/100: ${user.email}`);
      }
      
      // Wait 2 seconds between each user creation attempt
      if (i < testUsers.length - 1) {
        await delay(2000);
      }
      
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n=== User Creation Summary ===`);
  console.log(`Total attempted: ${testUsers.length}`);
  console.log(`Successfully created: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Rate limited: ${rateLimitCount}`);
  console.log(`===============================`);
  
  return createdUsers;
};
