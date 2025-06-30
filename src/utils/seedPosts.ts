
import { supabase } from "@/integrations/supabase/client";

export const seedPosts = async () => {
  try {
    // First, let's get existing user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, username, location')
      .limit(15);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No existing profiles found. Please create some user accounts first.');
      return;
    }

    console.log(`Found ${profiles.length} existing profiles to use for seeding posts`);

    // Create seed posts using existing user IDs
    const offers = [
      {
        title: 'Free dining table and 4 chairs',
        description: 'Moving out and need to get rid of my dining set. Solid wood table with some wear but still sturdy. Chairs are in good condition. You pick up!',
        category: 'Furniture',
        location: 'Vancouver, BC',
        photos: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
        days_ago: 2
      },
      {
        title: 'Homemade cookies for neighbors',
        description: 'Baked way too many chocolate chip cookies! Have about 3 dozen to share. Fresh out of the oven this morning.',
        category: 'Food',
        location: 'Calgary, AB',
        photos: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400'],
        days_ago: 1
      },
      {
        title: 'Kids winter clothes size 4-6',
        description: 'My daughter outgrew these winter clothes. Coats, snow pants, boots, mittens. All in great shape from smoke-free home.',
        category: 'Clothing',
        location: 'Toronto, ON',
        photos: ['https://images.unsplash.com/photo-1621452773781-0f992fd1f5c8?w=400', 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400'],
        days_ago: 5
      },
      {
        title: 'Ride to YVR airport tomorrow 2pm',
        description: 'Driving to the airport tomorrow around 2pm and have room for 1-2 passengers. Happy to help out!',
        category: 'Transportation',
        location: 'Richmond, BC',
        photos: [],
        days_ago: 0
      },
      {
        title: 'Old laptop for student',
        description: 'Have an older ThinkPad that still works fine for basic tasks. Perfect for a student who needs something for school.',
        category: 'Technology',
        location: 'Burnaby, BC',
        photos: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'],
        days_ago: 3
      },
      {
        title: 'Garden vegetables from my yard',
        description: 'Tomatoes, zucchini, and carrots are ready! More than my family can eat. Come by this weekend.',
        category: 'Food',
        location: 'Edmonton, AB',
        photos: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400'],
        days_ago: 4
      },
      {
        title: 'Free piano lessons for beginners',
        description: 'Music teacher offering free lessons to someone who cant afford them. Have been teaching for 10 years.',
        category: 'Community Help',
        location: 'Surrey, BC',
        photos: [],
        days_ago: 7
      },
      {
        title: 'Microwave and toaster',
        description: 'Both work perfectly, just upgraded my kitchen. Microwave is 1.2 cubic ft, toaster is 4-slice.',
        category: 'Household Items',
        location: 'Ottawa, ON',
        photos: ['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400'],
        days_ago: 6
      },
      {
        title: 'Dog walking services',
        description: 'Love dogs and have flexible schedule. Can walk your pup during the day while youre at work. No charge!',
        category: 'Community Help',
        location: 'Victoria, BC',
        photos: ['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400'],
        days_ago: 8
      },
      {
        title: 'Mens business shirts size M',
        description: 'Cleaning out closet. About 8 dress shirts, barely worn. Perfect for someone starting new job.',
        category: 'Clothing',
        location: 'Mississauga, ON',
        photos: [],
        days_ago: 9
      },
      {
        title: 'Fresh bread every weekend',
        description: 'Love baking sourdough! Make extra loaves every Saturday. Can drop off in Kelowna area.',
        category: 'Food',
        location: 'Kelowna, BC',
        photos: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400'],
        days_ago: 10
      },
      {
        title: 'Bookshelf and storage boxes',
        description: 'Moving sale! Tall bookshelf and several plastic storage containers. All clean and in good shape.',
        category: 'Furniture',
        location: 'Red Deer, AB',
        photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
        days_ago: 12
      },
      {
        title: 'Math tutoring for high school',
        description: 'Former math teacher offering free tutoring for students struggling with algebra or calculus.',
        category: 'Community Help',
        location: 'Hamilton, ON',
        photos: [],
        days_ago: 13
      },
      {
        title: 'Exercise bike barely used',
        description: 'Bought during pandemic but barely used it. Works perfectly, just taking up space now.',
        category: 'Household Items',
        location: 'New Westminster, BC',
        photos: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
        days_ago: 14
      },
      {
        title: 'Weekly rides to Costco',
        description: 'Go to Costco every Thursday evening. Happy to give someone a ride who needs to stock up.',
        category: 'Transportation',
        location: 'Lethbridge, AB',
        photos: [],
        days_ago: 15
      },
      {
        title: 'Baby clothes 0-12 months',
        description: 'My little one grew so fast! Tons of baby clothes in excellent condition. Mostly gender neutral colors.',
        category: 'Clothing',
        location: 'Vancouver, BC',
        photos: ['https://images.unsplash.com/photo-1522771930-78848d3d7bd0?w=400', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400'],
        days_ago: 16
      },
      {
        title: 'Old iPhone 8 still works',
        description: 'Upgraded my phone. This one has a cracked screen but everything works fine. Good for someone who needs backup phone.',
        category: 'Technology',
        location: 'Calgary, AB',
        photos: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400'],
        days_ago: 17
      },
      {
        title: 'Leftover party food',
        description: 'Had a bbq yesterday and made way too much food. Burgers, salads, desserts. All good for a few more days.',
        category: 'Food',
        location: 'Toronto, ON',
        photos: [],
        days_ago: 1
      },
      {
        title: 'Coffee table and side table',
        description: 'Redecorating living room. Both tables are in good condition, just dont match new decor.',
        category: 'Furniture',
        location: 'Richmond, BC',
        photos: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
        days_ago: 18
      },
      {
        title: 'Free tax help',
        description: 'Accountant offering to help seniors or low-income families with their tax returns. No charge.',
        category: 'Community Help',
        location: 'Burnaby, BC',
        photos: [],
        days_ago: 19
      },
      {
        title: 'Kitchen pots and pans set',
        description: 'Got new cookware for wedding. This old set is still perfectly good, just dont need two sets.',
        category: 'Household Items',
        location: 'Edmonton, AB',
        photos: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],
        days_ago: 20
      },
      {
        title: 'Womens work clothes size 8',
        description: 'Changed careers and dont need business attire anymore. Blazers, dress pants, blouses. Professional quality.',
        category: 'Clothing',
        location: 'Surrey, BC',
        photos: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'],
        days_ago: 21
      },
      {
        title: 'Guitar lessons for kids',
        description: 'Professional musician offering free guitar lessons for children aged 8-14. Bring your own guitar.',
        category: 'Community Help',
        location: 'Ottawa, ON',
        photos: [],
        days_ago: 22
      },
      {
        title: 'Homemade jam and pickles',
        description: 'Made too much preserves this summer. Have strawberry jam, dill pickles, and pickled beets.',
        category: 'Food',
        location: 'Victoria, BC',
        photos: ['https://images.unsplash.com/photo-1621947802413-8e2cda1ea2c3?w=400'],
        days_ago: 23
      },
      {
        title: 'Old computer monitor 22 inch',
        description: 'Upgraded to new monitor. This one works fine, just a bit older. Perfect for second screen or student.',
        category: 'Technology',
        location: 'Mississauga, ON',
        photos: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'],
        days_ago: 24
      }
    ];

    const requests = [
      {
        title: 'Need ride to airport Thursday morning',
        description: 'Flight leaves at 10am, need to be there by 8am. Can contribute gas money. Starting from downtown Edmonton.',
        category: 'Transportation',
        location: 'Edmonton, AB',
        photos: [],
        days_ago: 1
      },
      {
        title: 'Looking for winter coat size M',
        description: 'New to Canada and need warm winter coat. Mens medium. Any condition is fine, just need something warm.',
        category: 'Clothing',
        location: 'Surrey, BC',
        photos: [],
        days_ago: 2
      },
      {
        title: 'Need help moving couch upstairs',
        description: 'Moving this weekend and need 1-2 people to help carry couch up to 2nd floor apartment. Can provide pizza and drinks!',
        category: 'Community Help',
        location: 'Ottawa, ON',
        photos: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
        days_ago: 3
      },
      {
        title: 'Looking for baby crib',
        description: 'Expecting our first baby in 3 months. Looking for crib in good condition. Can pick up anywhere in Victoria area.',
        category: 'Furniture',
        location: 'Victoria, BC',
        photos: [],
        days_ago: 4
      },
      {
        title: 'Need old smartphone for elderly parent',
        description: 'My dad needs a simple smartphone for emergencies. Doesnt need to be fancy, just needs to work for calls and texts.',
        category: 'Technology',
        location: 'Mississauga, ON',
        photos: [],
        days_ago: 5
      },
      {
        title: 'Looking for baking ingredients',
        description: 'Starting a small baking business from home. Could use flour, sugar, eggs if anyone has extra.',
        category: 'Food',
        location: 'Kelowna, BC',
        photos: [],
        days_ago: 6
      },
      {
        title: 'Need desk for home office',
        description: 'Working from home now and need proper desk. Any size is fine, just need something sturdy for computer.',
        category: 'Furniture',
        location: 'Red Deer, AB',
        photos: [],
        days_ago: 7
      },
      {
        title: 'Looking for math tutor',
        description: 'Grade 11 student struggling with calculus. Looking for someone patient who can explain concepts clearly.',
        category: 'Community Help',
        location: 'Hamilton, ON',
        photos: [],
        days_ago: 8
      },
      {
        title: 'Need pots and pans',
        description: 'Just moved into first apartment. Looking for basic cookware to get started. Any condition is appreciated.',
        category: 'Household Items',
        location: 'New Westminster, BC',
        photos: [],
        days_ago: 9
      },
      {
        title: 'Looking for work clothes size 10',
        description: 'Starting new office job next week. Need professional clothes - blouses, pants, maybe a blazer. Womens size 10.',
        category: 'Clothing',
        location: 'Lethbridge, AB',
        photos: [],
        days_ago: 10
      },
      {
        title: 'Need ride to Vancouver this Friday',
        description: 'Have medical appointment in Vancouver Friday afternoon. Can share gas costs. Leaving from Burnaby area.',
        category: 'Transportation',
        location: 'Vancouver, BC',
        photos: [],
        days_ago: 11
      },
      {
        title: 'Looking for exercise equipment',
        description: 'Trying to get back in shape. Looking for dumbbells, yoga mat, or any home gym equipment.',
        category: 'Household Items',
        location: 'Calgary, AB',
        photos: [],
        days_ago: 12
      },
      {
        title: 'Need help with English practice',
        description: 'New immigrant looking for English conversation partner. Happy to teach you another language in exchange!',
        category: 'Community Help',
        location: 'Toronto, ON',
        photos: [],
        days_ago: 13
      },
      {
        title: 'Looking for laptop for school',
        description: 'College student on tight budget. Need laptop for assignments and research. Any working laptop would be amazing.',
        category: 'Technology',
        location: 'Richmond, BC',
        photos: [],
        days_ago: 14
      },
      {
        title: 'Need dining table for family',
        description: 'Family of 4 looking for dining table. Doesnt need to be fancy, just something we can all sit around for meals.',
        category: 'Furniture',
        location: 'Burnaby, BC',
        photos: [],
        days_ago: 15
      },
      {
        title: 'Looking for winter boots size 8',
        description: 'First winter in Canada! Need warm boots for walking to work. Womens size 8. Any style is fine.',
        category: 'Clothing',
        location: 'Edmonton, AB',
        photos: [],
        days_ago: 16
      },
      {
        title: 'Need help with yard cleanup',
        description: 'Elderly homeowner looking for help raking leaves and basic yard cleanup. Can provide refreshments.',
        category: 'Community Help',
        location: 'Surrey, BC',
        photos: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
        days_ago: 17
      },
      {
        title: 'Looking for microwave',
        description: 'Apartment didnt come with microwave. Looking for basic model that works. Can pick up anywhere in Ottawa.',
        category: 'Household Items',
        location: 'Ottawa, ON',
        photos: [],
        days_ago: 18
      },
      {
        title: 'Need groceries for food bank',
        description: 'Volunteering at local food bank. Always need non-perishable items - canned goods, pasta, rice, etc.',
        category: 'Food',
        location: 'Victoria, BC',
        photos: [],
        days_ago: 19
      },
      {
        title: 'Looking for bookshelf',
        description: 'Book lover with too many books and nowhere to put them! Looking for any kind of bookshelf or storage.',
        category: 'Furniture',
        location: 'Mississauga, ON',
        photos: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'],
        days_ago: 20
      },
      {
        title: 'Need computer monitor',
        description: 'Working from home and need second monitor for productivity. Any size would be helpful.',
        category: 'Technology',
        location: 'Kelowna, BC',
        photos: [],
        days_ago: 21
      },
      {
        title: 'Looking for baby clothes 6-12 months',
        description: 'Baby is growing so fast! Need clothes for next size up. Boy or gender neutral colors preferred.',
        category: 'Clothing',
        location: 'Red Deer, AB',
        photos: [],
        days_ago: 22
      },
      {
        title: 'Need help with resume',
        description: 'Been out of work for a while and need help updating my resume. Not sure how to make it look professional.',
        category: 'Community Help',
        location: 'Hamilton, ON',
        photos: [],
        days_ago: 23
      },
      {
        title: 'Looking for vacuum cleaner',
        description: 'Just moved and need vacuum for apartment. Anything that works would be greatly appreciated.',
        category: 'Household Items',
        location: 'New Westminster, BC',
        photos: [],
        days_ago: 24
      },
      {
        title: 'Need ride to medical appointment',
        description: 'Have doctors appointment Tuesday 2pm in Calgary. Elderly and cant drive anymore. Will pay gas money.',
        category: 'Transportation',
        location: 'Lethbridge, AB',
        photos: [],
        days_ago: 25
      }
    ];

    // Create offer posts
    const offerPosts = offers.map((offer, index) => ({
      user_id: profiles[index % profiles.length].id,
      type: 'offer',
      title: offer.title,
      description: offer.description,
      category: offer.category,
      location: offer.location,
      photos: offer.photos,
      created_at: new Date(Date.now() - offer.days_ago * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }));

    // Create request posts
    const requestPosts = requests.map((request, index) => ({
      user_id: profiles[index % profiles.length].id,
      type: 'request',
      title: request.title,
      description: request.description,
      category: request.category,
      location: request.location,
      photos: request.photos,
      created_at: new Date(Date.now() - request.days_ago * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }));

    // Insert offer posts in batches
    const batchSize = 10;
    for (let i = 0; i < offerPosts.length; i += batchSize) {
      const batch = offerPosts.slice(i, i + batchSize);
      const { error } = await supabase
        .from('posts')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting offer posts batch:', error);
        continue;
      }
      console.log(`Inserted offer posts batch ${Math.floor(i/batchSize) + 1}`);
    }

    // Insert request posts in batches
    for (let i = 0; i < requestPosts.length; i += batchSize) {
      const batch = requestPosts.slice(i, i + batchSize);
      const { error } = await supabase
        .from('posts')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting request posts batch:', error);
        continue;
      }
      console.log(`Inserted request posts batch ${Math.floor(i/batchSize) + 1}`);
    }

    console.log(`Successfully seeded ${offerPosts.length} offers and ${requestPosts.length} requests!`);
    
  } catch (error) {
    console.error('Error seeding posts:', error);
  }
};
