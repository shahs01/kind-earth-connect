
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

export const createTestUsers = async (): Promise<TestUser[]> => {
  const testUsers: TestUser[] = [];
  
  // Generate 100 test users
  for (let i = 1; i <= 100; i++) {
    testUsers.push({
      email: `tester${i}@gmail.com`,
      password: '#A123456',
      username: generateUsername(i - 1),
      name: generateName(i - 1),
      location: generateLocation(i - 1)
    });
  }
  
  console.log('Generated test user data, starting account creation...');
  
  // Create users through Supabase Auth API
  const createdUsers: TestUser[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const user of testUsers) {
    try {
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
        console.error(`Failed to create user ${user.email}:`, error.message);
        errorCount++;
        continue;
      }
      
      if (data.user) {
        createdUsers.push(user);
        successCount++;
        console.log(`Created user ${successCount}/100: ${user.email}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
      errorCount++;
    }
  }
  
  console.log(`User creation complete. Success: ${successCount}, Errors: ${errorCount}`);
  return createdUsers;
};
