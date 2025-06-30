import { supabase } from "@/integrations/supabase/client";

// Sample user data for seed accounts
const seedUsers = [
  { username: "SarahM88", name: "Sarah Martinez", location: "Vancouver, BC" },
  { username: "James.Van", name: "James Van Der Berg", location: "Surrey, BC" },
  { username: "Nadia_inSurrey", name: "Nadia Patel", location: "Surrey, BC" },
  { username: "MikeFromBurnaby", name: "Mike Chen", location: "Burnaby, BC" },
  { username: "LisaL_Richmond", name: "Lisa Liu", location: "Richmond, BC" },
  { username: "DaveAbby", name: "Dave Thompson", location: "Abbotsford, BC" },
  { username: "AnnaBananaChi", name: "Anna Kowalski", location: "Chilliwack, BC" },
  { username: "TomCoquitlam", name: "Tom Rodriguez", location: "Coquitlam, BC" },
  { username: "JennyMR", name: "Jenny Park", location: "Maple Ridge, BC" },
  { username: "DeltaDan", name: "Dan Williams", location: "Delta, BC" },
  { username: "NewWestNick", name: "Nick Johnson", location: "New Westminster, BC" },
  { username: "LangleyLaura", name: "Laura Singh", location: "Langley, BC" },
  { username: "CalgaryCarl", name: "Carl Anderson", location: "Calgary, AB" },
  { username: "EdmontonEmily", name: "Emily Foster", location: "Edmonton, AB" },
  { username: "TorontoTina", name: "Tina Brown", location: "Toronto, ON" },
  { username: "MissaugaMike", name: "Mike Davis", location: "Mississauga, ON" },
  { username: "BramptonBen", name: "Ben Kumar", location: "Brampton, ON" },
  { username: "OttawaOlivia", name: "Olivia Wilson", location: "Ottawa, ON" },
  { username: "VanMom123", name: "Rachel Kim", location: "Vancouver, BC" },
  { username: "SurreyStudent", name: "Alex Morgan", location: "Surrey, BC" },
  { username: "BurnabyBob", name: "Bob Taylor", location: "Burnaby, BC" },
  { username: "RichmondRita", name: "Rita Zhao", location: "Richmond, BC" },
  { username: "AbbyAmanda", name: "Amanda White", location: "Abbotsford, BC" },
  { username: "ChilliwackChad", name: "Chad Miller", location: "Chilliwack, BC" },
  { username: "CoqCarol", name: "Carol Lewis", location: "Coquitlam, BC" },
  { username: "MapleMartin", name: "Martin Garcia", location: "Maple Ridge, BC" },
  { username: "DeltaDiana", name: "Diana Lee", location: "Delta, BC" },
  { username: "NewWestNancy", name: "Nancy Moore", location: "New Westminster, BC" },
  { username: "LangleyLeo", name: "Leo Jackson", location: "Langley, BC" },
  { username: "CalgaryClara", name: "Clara Martinez", location: "Calgary, AB" },
  { username: "EdmontonEric", name: "Eric Thompson", location: "Edmonton, AB" },
  { username: "TorontoTony", name: "Tony Rodriguez", location: "Toronto, ON" },
  { username: "MissaugaMary", name: "Mary Chen", location: "Mississauga, ON" },
  { username: "BramptonBella", name: "Bella Patel", location: "Brampton, ON" },
  { username: "OttawaOscar", name: "Oscar Wilson", location: "Ottawa, ON" },
];

// Placeholder images from Unsplash
const foodImages = [
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
  "https://images.unsplash.com/photo-1567306301408-9b74b3b3da3f",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
];

const furnitureImages = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
  "https://images.unsplash.com/photo-1615797213168-0593973d7e48",
];

const clothingImages = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105",
  "https://images.unsplash.com/photo-1506629905720-cf7b1337e85a",
];

const householdImages = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  "https://images.unsplash.com/photo-1521747116042-5a810fda9664",
];

const techImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
];

// Sample posts data - keeping it concise
const samplePosts = [
  // Offers
  {
    title: "Free dining table and chairs",
    description: "Moving out of my apartment and need to give away my dining set. Table seats 4 people, chairs are a bit worn but still sturdy. Perfect for students or anyone starting out.",
    category: "furniture",
    location: "Vancouver, BC",
    type: "offer" as const,
    username: "SarahM88",
    images: 2,
  },
  {
    title: "Gently used winter coats - various sizes",
    description: "Cleaned out my closet and have several winter jackets that don't fit anymore. Sizes range from small to large, mostly women's but a couple men's too.",
    category: "clothing",
    location: "Surrey, BC",
    type: "offer" as const,
    username: "Nadia_inSurrey",
    images: 1,
  },
  {
    title: "Fresh vegetables from my garden",
    description: "My garden went a bit crazy this year and I have way too many tomatoes, cucumbers, and zucchini. All organic, no pesticides.",
    category: "food",
    location: "Burnaby, BC",
    type: "offer" as const,
    username: "MikeFromBurnaby",
    images: 1,
  },
  {
    title: "Help with basic computer issues",
    description: "I work in IT and have some free time on weekends. Happy to help seniors or anyone struggling with basic computer problems.",
    category: "services",
    location: "New Westminster, BC",
    type: "offer" as const,
    username: "NewWestNick",
    images: 0,
  },
  {
    title: "Free piano lessons for beginners",
    description: "I'm a music teacher and would love to offer some free beginner piano lessons to kids or adults who can't afford regular lessons.",
    category: "services",
    location: "Langley, BC",
    type: "offer" as const,
    username: "LangleyLaura",
    images: 0,
  },
  // Requests
  {
    title: "Looking for a dresser or chest of drawers",
    description: "Just moved into a new place and desperately need somewhere to put my clothes! Looking for a dresser or chest of drawers, doesn't have to be fancy.",
    category: "furniture",
    location: "Vancouver, BC",
    type: "request" as const,
    username: "James.Van",
    images: 0,
  },
  {
    title: "Need help moving a couch this weekend",
    description: "Bought a couch from someone and need help getting it up to my 3rd floor apartment. Should only take about an hour. Happy to pay for your time!",
    category: "services",
    location: "Surrey, BC",
    type: "request" as const,
    username: "SarahM88",
    images: 0,
  },
  {
    title: "Looking for winter boots size 8",
    description: "Lost my winter boots somewhere and can't afford to buy new ones right now. Looking for women's size 8 boots that are still in decent shape.",
    category: "clothing",
    location: "Burnaby, BC",
    type: "request" as const,
    username: "LisaL_Richmond",
    images: 0,
  },
  {
    title: "Need basic laptop for online classes",
    description: "Starting some online courses and need a laptop that can handle video calls and basic programs. Doesn't need to be fancy, just reliable.",
    category: "tech",
    location: "Surrey, BC",
    type: "request" as const,
    username: "SurreyStudent",
    images: 0,
  },
  {
    title: "Looking for children's books",
    description: "Trying to build up my daughter's library but books are so expensive! Looking for any children's books for ages 4-8.",
    category: "household",
    location: "Chilliwack, BC",
    type: "request" as const,
    username: "AnnaBananaChi",
    images: 0,
  },
];

// Function to get random images based on category
function getRandomImages(category: string, count: number): string[] {
  let imagePool: string[] = [];
  
  switch (category) {
    case 'food':
      imagePool = foodImages;
      break;
    case 'furniture':
      imagePool = furnitureImages;
      break;
    case 'clothing':
      imagePool = clothingImages;
      break;
    case 'household':
      imagePool = householdImages;
      break;
    case 'tech':
      imagePool = techImages;
      break;
    default:
      imagePool = [...foodImages, ...furnitureImages, ...clothingImages, ...householdImages, ...techImages];
  }
  
  const shuffled = imagePool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Function to generate random timestamp within past 40 days
function getRandomTimestamp(): string {
  const now = new Date();
  const fortyDaysAgo = new Date(now.getTime() - (40 * 24 * 60 * 60 * 1000));
  const randomTime = fortyDaysAgo.getTime() + Math.random() * (now.getTime() - fortyDaysAgo.getTime());
  return new Date(randomTime).toISOString();
}

// Generate more posts to reach 100 total
function generateAdditionalPosts(): any[] {
  const additionalPosts = [];
  const categories = ['food', 'furniture', 'clothing', 'household', 'tech', 'services'];
  const locations = ['Vancouver, BC', 'Surrey, BC', 'Burnaby, BC', 'Richmond, BC', 'Calgary, AB', 'Toronto, ON'];
  const types = ['offer', 'request'];
  
  // More varied post titles and descriptions for better searchability
  const offerTitles = [
    "Free books and magazines", "Help with gardening", "Cooking lessons available", "Free tutoring sessions",
    "Offering ride shares", "Free pet sitting", "Help with moving", "Language exchange partner",
    "Free home repairs", "Sharing tools and equipment", "Free music lessons", "Art supplies to give away",
    "Help with resume writing", "Free childcare", "Bicycle repair service", "Computer troubleshooting help"
  ];
  
  const requestTitles = [
    "Need help with yard work", "Looking for study buddy", "Need transportation help", "Seeking babysitter",
    "Looking for workout partner", "Need help with taxes", "Seeking language tutor", "Need pet care advice",
    "Looking for roommate", "Need furniture assembly help", "Seeking career advice", "Need tech support",
    "Looking for cooking partner", "Need help with cleaning", "Seeking volunteer opportunities", "Need moving boxes"
  ];
  
  for (let i = 0; i < 90; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const username = seedUsers[Math.floor(Math.random() * seedUsers.length)].username;
    const imageCount = Math.random() < 0.1 ? 0 : Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 2 : 1;
    
    const titlePool = type === 'offer' ? offerTitles : requestTitles;
    const title = titlePool[Math.floor(Math.random() * titlePool.length)] + ` - ${category}`;
    
    additionalPosts.push({
      title,
      description: `This is a ${type} for ${category} items in ${location}. I'm looking to connect with someone who can help or needs assistance. Feel free to message me if you're interested!`,
      category,
      location,
      type,
      username,
      images: imageCount,
    });
  }
  
  return additionalPosts;
}

export async function seedPosts() {
  try {
    console.log("Starting to seed posts...");
    
    // First, create the seed user profiles
    for (const user of seedUsers) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: crypto.randomUUID(),
          username: user.username,
          name: user.name,
          location: user.location,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
          bio: `Community member from ${user.location}`,
          trust_score: Math.floor(Math.random() * 2) + 4, // Random score between 4-5
          help_offered: Math.floor(Math.random() * 10),
          help_received: Math.floor(Math.random() * 5),
          verified_status: Math.random() > 0.7, // 30% verified
        }, { onConflict: 'username' });
        
      if (profileError) {
        console.log(`Profile creation error for ${user.username}:`, profileError);
      }
    }
    
    // Get the created user profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', seedUsers.map(u => u.username));
    
    if (!profiles) {
      throw new Error("Could not fetch created profiles");
    }
    
    // Create a mapping of username to user_id
    const usernameToId = profiles.reduce((acc, profile) => {
      acc[profile.username] = profile.id;
      return acc;
    }, {} as Record<string, string>);
    
    // Generate all posts (sample + additional to reach 100)
    const allPosts = [...samplePosts, ...generateAdditionalPosts()];
    
    // Process all posts
    for (const post of allPosts) {
      const userId = usernameToId[post.username];
      if (!userId) {
        console.log(`User not found for username: ${post.username}`);
        continue;
      }
      
      const images = post.images > 0 ? getRandomImages(post.category, post.images) : [];
      const createdAt = getRandomTimestamp();
      
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          title: post.title,
          description: post.description,
          category: post.category,
          location: post.location,
          type: post.type,
          user_id: userId,
          photos: images,
          status: 'active',
          created_at: createdAt,
        });
        
      if (postError) {
        console.log(`Post creation error:`, postError);
      } else {
        console.log(`Created post: ${post.title} (${createdAt})`);
      }
    }
    
    console.log("Finished seeding posts!");
    
  } catch (error) {
    console.error("Error seeding posts:", error);
    throw error;
  }
}
