
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

// Sample posts data
const offerPosts = [
  {
    title: "Free dining table and chairs",
    description: "Moving out of my apartment and need to give away my dining set. Table seats 4 people, chairs are a bit worn but still sturdy. Perfect for students or anyone starting out. You'll need to pick up from my place in Vancouver, and honestly you might need a truck or van to move it. Message me if interested!",
    category: "furniture",
    location: "Vancouver, BC",
    type: "offer" as const,
    username: "SarahM88",
    images: furnitureImages.slice(0, 2),
  },
  {
    title: "Gently used winter coats - various sizes",
    description: "Cleaned out my closet and have several winter jackets that don't fit anymore. Sizes range from small to large, mostly women's but a couple men's too. All are clean and in good condition. If anyone happens to need warm clothes for the season, you're welcome to come take a look!",
    category: "clothing",
    location: "Surrey, BC",
    type: "offer" as const,
    username: "Nadia_inSurrey",
    images: clothingImages.slice(0, 1),
  },
  {
    title: "Fresh vegetables from my garden",
    description: "My garden went a bit crazy this year and I have way too many tomatoes, cucumbers, and zucchini. All organic, no pesticides. Happy to share with neighbors - just bring a bag and take what you need. Available for pickup most evenings this week.",
    category: "food",
    location: "Burnaby, BC",
    type: "offer" as const,
    username: "MikeFromBurnaby",
    images: foodImages.slice(0, 1),
  },
  {
    title: "Baby clothes 0-12 months",
    description: "My little one has outgrown all these clothes way too fast! Have tons of onesies, sleepers, and outfits in excellent condition. Mix of boy and neutral colors. Would love to see them go to another family who could use them rather than just sitting in storage.",
    category: "clothing",
    location: "Richmond, BC",
    type: "offer" as const,
    username: "LisaL_Richmond",
    images: clothingImages.slice(1, 3),
  },
  {
    title: "Old laptop for parts or repair",
    description: "Have an older ThinkPad that stopped working properly. Screen is cracked and it won't boot up, but might be useful for someone who knows how to fix computers or needs parts. Free to whoever wants to try fixing it up.",
    category: "tech",
    location: "Abbotsford, BC",
    type: "offer" as const,
    username: "DaveAbby",
    images: techImages.slice(0, 1),
  },
  {
    title: "Homemade jam and preserves",
    description: "Made way too much jam this summer from our fruit trees! Have strawberry, peach, and mixed berry. All in proper mason jars. Would be happy to share with anyone who'd appreciate some homemade goodness. Just let me know what flavors you'd prefer.",
    category: "food",
    location: "Chilliwack, BC",
    type: "offer" as const,
    username: "AnnaBananaChi",
    images: foodImages.slice(1, 2),
  },
  {
    title: "Kids bike - outgrown but still good",
    description: "My son outgrew his bike and it's just taking up space in the garage. It's a 16-inch wheel bike, good for ages 4-7 probably. Has some scratches but rides perfectly fine. Training wheels included if needed.",
    category: "household",
    location: "Coquitlam, BC",
    type: "offer" as const,
    username: "TomCoquitlam",
    images: [],
  },
  {
    title: "Free firewood - you haul",
    description: "Had to take down a tree in my backyard and have a bunch of firewood cut up. It's been seasoning for about 6 months so should be good to burn. You'd need to come pick it up yourself though - I don't have a way to deliver it.",
    category: "household",
    location: "Maple Ridge, BC",
    type: "offer" as const,
    username: "JennyMR",
    images: [],
  },
  {
    title: "Books - fiction and non-fiction mix",
    description: "Cleaning out my bookshelves and have probably 50+ books to give away. Mix of novels, self-help, cooking books, and some textbooks. Come browse and take whatever catches your eye. Better than throwing them out!",
    category: "household",
    location: "Delta, BC",
    type: "offer" as const,
    username: "DeltaDan",
    images: householdImages.slice(0, 1),
  },
  {
    title: "Help with basic computer issues",
    description: "I work in IT and have some free time on weekends. Happy to help seniors or anyone struggling with basic computer problems - setting up email, removing viruses, that sort of thing. No charge, just want to help out the community.",
    category: "services",
    location: "New Westminster, BC",
    type: "offer" as const,
    username: "NewWestNick",
    images: [],
  },
  {
    title: "Free piano lessons for beginners",
    description: "I'm a music teacher and would love to offer some free beginner piano lessons to kids or adults who can't afford regular lessons. Have a piano at my place or can come to you if you have one. Just want to share the love of music!",
    category: "services",
    location: "Langley, BC",
    type: "offer" as const,
    username: "LangleyLaura",
    images: [],
  },
  {
    title: "Dog walking services",
    description: "Love dogs and have flexible schedule. Happy to walk your dog during the day if you're stuck at work or need help. Have experience with all sizes and breeds. Just want to help out fellow dog owners and get some exercise myself!",
    category: "services",
    location: "Calgary, AB",
    type: "offer" as const,
    username: "CalgaryCarl",
    images: [],
  },
  {
    title: "Knitted scarves and hats",
    description: "Picked up knitting as a hobby during lockdown and now I have way too many scarves and hats! All made with good quality yarn. Perfect for the cold weather we're having. Various colors and patterns available.",
    category: "clothing",
    location: "Edmonton, AB",
    type: "offer" as const,
    username: "EdmontonEmily",
    images: clothingImages.slice(2, 3),
  },
  {
    title: "Kitchen appliances - moving sale",
    description: "Downsizing to a smaller place and can't take all my kitchen stuff. Have a blender, food processor, stand mixer, and some smaller appliances. All work perfectly, just don't have room for them anymore.",
    category: "household",
    location: "Toronto, ON",
    type: "offer" as const,
    username: "TorontoTina",
    images: householdImages.slice(1, 3),
  },
  {
    title: "Tutoring help - math and science",
    description: "I'm an engineering student and have time to help high school students with math and science homework. Used to tutor back home and miss teaching. No charge - just want to help kids who might be struggling.",
    category: "services",
    location: "Mississauga, ON",
    type: "offer" as const,
    username: "MissaugaMike",
    images: [],
  },
  {
    title: "Moving boxes and packing supplies",
    description: "Just finished moving and have tons of boxes, bubble wrap, and packing paper left over. All in good condition and ready for someone else's move. Would hate to see them go to waste when someone could definitely use them.",
    category: "household",
    location: "Brampton, ON",
    type: "offer" as const,
    username: "BramptonBen",
    images: householdImages.slice(0, 2),
  },
  {
    title: "Homemade bread and baked goods",
    description: "Love to bake and always make too much! Usually have fresh bread, muffins, or cookies available. Let me know what you're craving and I'll see what I can whip up. Just ask that you provide your own container.",
    category: "food",
    location: "Ottawa, ON",
    type: "offer" as const,
    username: "OttawaOlivia",
    images: foodImages.slice(2, 3),
  },
  {
    title: "Maternity clothes size medium",
    description: "Done having babies and have a whole wardrobe of maternity clothes just sitting there. Sizes mostly medium, mix of casual and work clothes. All washed and ready to go to someone who could actually use them!",
    category: "clothing",
    location: "Vancouver, BC",
    type: "offer" as const,
    username: "VanMom123",
    images: clothingImages.slice(0, 2),
  },
  {
    title: "Textbook sharing - business courses",
    description: "Finished my business degree and have expensive textbooks gathering dust. Economics, accounting, marketing, management - you name it. Rather than sell them, happy to lend to students who need them. Just return when done!",
    category: "household",
    location: "Surrey, BC",
    type: "offer" as const,
    username: "SurreyStudent",
    images: [],
  },
  {
    title: "Garden vegetables and herbs",
    description: "My vegetable garden is producing way more than my family can eat. Have fresh lettuce, carrots, herbs, and green beans available most days. All organic and pesticide-free. Come by and grab what you need!",
    category: "food",
    location: "Burnaby, BC",
    type: "offer" as const,
    username: "BurnabyBob",
    images: foodImages.slice(0, 1),
  },
  {
    title: "Free haircuts - practicing stylist",
    description: "I'm a hair styling student and need practice on different hair types. Offering free cuts and simple styling to anyone willing to let me practice on them. Supervised by my instructor, so you're in good hands!",
    category: "services",
    location: "Richmond, BC",
    type: "offer" as const,
    username: "RichmondRita",
    images: [],
  },
  {
    title: "Old smartphone - Android",
    description: "Upgraded my phone and the old one is just sitting in a drawer. It's an older Samsung but still works fine for basic stuff. Screen protector and case included. Perfect as a backup phone or for someone who needs something simple.",
    category: "tech",
    location: "Abbotsford, BC",
    type: "offer" as const,
    username: "AbbyAmanda",
    images: techImages.slice(1, 2),
  },
  {
    title: "Workout equipment",
    description: "Bought a bunch of home gym equipment during the pandemic that I barely used. Have dumbbells, resistance bands, yoga mat, and a medicine ball. Time to admit I'm not going to become a fitness guru and pass these on!",
    category: "household",
    location: "Chilliwack, BC",
    type: "offer" as const,
    username: "ChilliwackChad",
    images: householdImages.slice(2, 3),
  },
  {
    title: "Senior shopping assistance",
    description: "I do my grocery shopping on weekends anyway and would be happy to pick up groceries for seniors or anyone who has trouble getting out. Just give me your list and I'll grab everything and drop it off. No delivery fee!",
    category: "services",
    location: "Coquitlam, BC",
    type: "offer" as const,
    username: "CoqCarol",
    images: [],
  },
  {
    title: "Office supplies from home office",
    description: "Cleaned out my home office and have tons of supplies I don't need. Pens, notebooks, binders, paper, sticky notes - you name it. Perfect for students or anyone setting up a workspace. Come take what you need!",
    category: "household",
    location: "Maple Ridge, BC",
    type: "offer" as const,
    username: "MapleMartin",
    images: householdImages.slice(1, 2),
  },
  // Continue with more offer posts...
];

const requestPosts = [
  {
    title: "Looking for a dresser or chest of drawers",
    description: "Just moved into a new place and desperately need somewhere to put my clothes! Looking for a dresser or chest of drawers, doesn't have to be fancy. Willing to pick up anywhere in the lower mainland if the price is right.",
    category: "furniture",
    location: "Vancouver, BC",
    type: "request" as const,
    username: "James.Van",
    images: [],
  },
  {
    title: "Need help moving a couch this weekend",
    description: "Bought a couch from someone and need help getting it up to my 3rd floor apartment. It's not super heavy but definitely a two-person job. Would be Saturday afternoon, should only take about an hour. Happy to pay for your time and buy pizza after!",
    category: "services",
    location: "Surrey, BC",
    type: "request" as const,
    username: "SarahM88",
    images: [],
  },
  {
    title: "Looking for winter boots size 8",
    description: "Lost my winter boots somewhere and can't afford to buy new ones right now. Looking for women's size 8 boots that are still in decent shape. Willing to pay a small amount or trade for something if I have what you need.",
    category: "clothing",
    location: "Burnaby, BC",
    type: "request" as const,
    username: "LisaL_Richmond",
    images: [],
  },
  {
    title: "Need a ride to medical appointment",
    description: "Have a doctor's appointment next Tuesday at 2pm at VGH and my usual ride fell through. I can take transit there but would really appreciate a ride home since I might be a bit groggy after the procedure. Happy to cover gas money.",
    category: "rides",
    location: "Vancouver, BC",
    type: "request" as const,
    username: "VanMom123",
    images: [],
  },
  {
    title: "Looking for someone to watch my cat",
    description: "Going out of town for a week and my regular pet sitter is unavailable. Looking for someone who could check on my cat once a day, feed her, and give her some attention. She's very friendly and low maintenance. Can pay a bit for your time.",
    category: "services",
    location: "Richmond, BC",
    type: "request" as const,
    username: "MikeFromBurnaby",
    images: [],
  },
  {
    title: "Need basic laptop for online classes",
    description: "Starting some online courses and need a laptop that can handle video calls and basic programs. Doesn't need to be fancy, just reliable. My budget is pretty tight but I can pay something reasonable or work out a payment plan.",
    category: "tech",
    location: "Surrey, BC",
    type: "request" as const,
    username: "SurreyStudent",
    images: [],
  },
  {
    title: "Looking for baby formula - specific brand",
    description: "My baby is on a specific formula due to allergies and I'm running low. Looking for Similac Alimentum if anyone happens to have extra. I know formula is expensive so happy to pay or trade for something else you might need.",
    category: "food",
    location: "Langley, BC",
    type: "request" as const,
    username: "LangleyLaura",
    images: [],
  },
  {
    title: "Need help with yard work",
    description: "Getting older and my yard is getting away from me. Looking for someone who could help with raking leaves and general cleanup. Would probably take a Saturday morning. Happy to pay fair wages and provide lunch!",
    category: "services",
    location: "Abbotsford, BC",
    type: "request" as const,
    username: "DaveAbby",
    images: [],
  },
  {
    title: "Looking for children's books",
    description: "Trying to build up my daughter's library but books are so expensive! Looking for any children's books for ages 4-8. They don't have to be perfect, just readable. Would love to find some classics or popular series.",
    category: "household",
    location: "Chilliwack, BC",
    type: "request" as const,
    username: "AnnaBananaChi",
    images: [],
  },
  {
    title: "Need someone to teach me basic cooking",
    description: "Just moved out on my own and realized I can't survive on takeout forever! Looking for someone patient who could teach me some basic cooking skills. Happy to buy groceries and learn at your place or mine.",
    category: "services",
    location: "Coquitlam, BC",
    type: "request" as const,
    username: "TomCoquitlam",
    images: [],
  },
  {
    title: "Looking for a desk for working from home",
    description: "Started working from home and my kitchen table isn't cutting it anymore. Looking for a decent desk that won't break the bank. Don't need anything fancy, just something sturdy with some drawer space.",
    category: "furniture",
    location: "Maple Ridge, BC",
    type: "request" as const,
    username: "JennyMR",
    images: [],
  },
  {
    title: "Need help moving apartments next month",
    description: "Moving to a new place in Delta next month and could use some help loading/unloading the truck. I've got most of the logistics figured out, just need a few strong backs for a few hours. Pizza and drinks provided!",
    category: "services",
    location: "Delta, BC",
    type: "request" as const,
    username: "DeltaDan",
    images: [],
  },
  {
    title: "Looking for warm blankets",
    description: "Heat in my apartment isn't great and I'm trying to save on heating bills. Looking for any extra blankets people might have. Doesn't matter if they're not perfect, just need something to help stay warm at night.",
    category: "household",
    location: "New Westminster, BC",
    type: "request" as const,
    username: "NewWestNick",
    images: [],
  },
  {
    title: "Need someone to walk my dog weekdays",
    description: "Got a new job with longer hours and feel bad leaving my dog alone all day. Looking for someone reliable who could walk him around lunchtime on weekdays. He's very friendly and good on a leash. Can pay weekly.",
    category: "services",
    location: "Calgary, AB",
    type: "request" as const,
    username: "CalgaryCarl",
    images: [],
  },
  {
    title: "Looking for professional clothes size 10",
    description: "Starting a new office job and need to build up my professional wardrobe. Looking for women's business clothes in size 10 - blazers, dress pants, skirts, nice tops. Happy to pay reasonable prices for things in good condition.",
    category: "clothing",
    location: "Edmonton, AB",
    type: "request" as const,
    username: "EdmontonEmily",
    images: [],
  },
  {
    title: "Need help with computer virus removal",
    description: "My laptop is acting really weird and I think it has a virus or malware. Looking for someone who knows about computers who could help me clean it up. Happy to pay for your time or bring coffee and donuts!",
    category: "services",
    location: "Toronto, ON",
    type: "request" as const,
    username: "TorontoTina",
    images: [],
  },
  {
    title: "Looking for a highchair for toddler",
    description: "My little one is ready for a proper highchair but they're so expensive for something they'll outgrow quickly. Looking for one that's still safe and clean. Happy to pay a fair price for something in good condition.",
    category: "furniture",
    location: "Mississauga, ON",
    type: "request" as const,
    username: "MissaugaMike",
    images: [],
  },
  {
    title: "Need ride to airport early Sunday morning",
    description: "Have a 7am flight this Sunday and need a ride to Pearson. It's super early so transit isn't really an option. Happy to pay for gas and your time - probably looking at leaving around 5am. I know it's early but would really appreciate the help!",
    category: "rides",
    location: "Brampton, ON",
    type: "request" as const,
    username: "BramptonBen",
    images: [],
  },
  {
    title: "Looking for tutoring help with math",
    description: "My teenager is struggling with grade 11 math and I can't help with the advanced stuff anymore. Looking for someone patient who could help her understand the concepts. Would prefer to meet at the library or somewhere public.",
    category: "services",
    location: "Ottawa, ON",
    type: "request" as const,
    username: "OttawaOlivia",
    images: [],
  },
  {
    title: "Need basic tools for small repairs",
    description: "Just bought my first place and realized I don't have any tools for basic maintenance. Looking to borrow or buy some basic tools - screwdriver set, hammer, wrench, that sort of thing. Don't need anything fancy, just functional.",
    category: "household",
    location: "Vancouver, BC",
    type: "request" as const,
    username: "James.Van",
    images: [],
  },
  // Continue with more request posts...
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

// Function to determine image count (70% = 1 image, 20% = 2-4 images, 10% = no images)
function getImageCount(): number {
  const rand = Math.random();
  if (rand < 0.1) return 0; // 10% no images
  if (rand < 0.3) return Math.floor(Math.random() * 3) + 2; // 20% multiple images (2-4)
  return 1; // 70% single image
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
    
    // Generate all posts (50 offers + 50 requests)
    const allPosts = [...offerPosts];
    
    // Add more offer posts to reach 50
    const additionalOffers = [
      {
        title: "Meal prep containers",
        description: "Have way too many glass meal prep containers from when I was trying to be organized. Various sizes, all with lids. Perfect for someone just starting to meal prep or batch cook. Much better than disposable containers!",
        category: "household",
        location: "Delta, BC",
        type: "offer" as const,
        username: "DeltaDiana",
        images: getRandomImages("household", getImageCount()),
      },
      // Add 24 more offer posts...
    ];
    
    // Add request posts
    const additionalRequests = [
      // Add 30 more request posts to reach 50...
    ];
    
    // Process all posts
    const postsToCreate = [...allPosts, ...additionalOffers, ...additionalRequests];
    
    for (const post of postsToCreate) {
      const userId = usernameToId[post.username];
      if (!userId) {
        console.log(`User not found for username: ${post.username}`);
        continue;
      }
      
      // Determine image count if not already set
      const imageCount = post.images.length > 0 ? post.images.length : getImageCount();
      const images = imageCount > 0 ? getRandomImages(post.category, imageCount) : [];
      
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
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
        });
        
      if (postError) {
        console.log(`Post creation error:`, postError);
      } else {
        console.log(`Created post: ${post.title}`);
      }
    }
    
    console.log("Finished seeding posts!");
    
  } catch (error) {
    console.error("Error seeding posts:", error);
  }
}
