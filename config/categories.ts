/**
 * Subscription Categories Configuration for SubTrack
 * Comprehensive category system for organizing subscriptions
 */


// Base category structure
export const Category = {
  ENTERTAINMENT: 'entertainment',
  UTILITIES: 'utilities',
  PRODUCTIVITY: 'productivity',
  HEALTH: 'health',
  EDUCATION: 'education',
  FINANCE: 'finance',
  SHOPPING: 'shopping',
  FOOD: 'food',
  TRAVEL: 'travel',
  OTHER: 'other',
};

// Main categories with detailed configuration
export const CATEGORIES = [
  {
    id: Category.ENTERTAINMENT,
    name: 'Entertainment',
    description: 'Streaming services, gaming, movies, music, and media subscriptions',
    icon: 'film',
    iconFamily: 'MaterialCommunityIcons',
    color: '#6366F1', // Indigo
    gradient: ['#6366F1', '#8B5CF6'],
    subCategories: [
      {
        id: 'streaming',
        name: 'Video Streaming',
        description: 'Netflix, Disney+, Hulu, Amazon Prime Video, etc.',
        icon: 'youtube-tv',
        examples: ['Netflix', 'Disney+', 'Hulu', 'Amazon Prime Video', 'HBO Max'],
      },
      {
        id: 'music',
        name: 'Music Streaming',
        description: 'Spotify, Apple Music, YouTube Music, etc.',
        icon: 'music',
        examples: ['Spotify', 'Apple Music', 'YouTube Music', 'Pandora'],
      },
      {
        id: 'gaming',
        name: 'Gaming',
        description: 'PlayStation Plus, Xbox Game Pass, Nintendo Online, etc.',
        icon: 'gamepad-variant',
        examples: ['PlayStation Plus', 'Xbox Game Pass', 'Nintendo Online', 'Steam'],
      },
      {
        id: 'reading',
        name: 'Reading & News',
        description: 'Newspapers, magazines, eBook services, audiobooks',
        icon: 'book-open-variant',
        examples: ['New York Times', 'Kindle Unlimited', 'Audible', 'Medium'],
      },
      {
        id: 'sports',
        name: 'Sports & Fitness',
        description: 'Sports streaming, fitness apps, workout services',
        icon: 'dumbbell',
        examples: ['ESPN+', 'Peloton', 'NFL Game Pass', 'NBA League Pass'],
      },
    ],
    popularServices: ['Netflix', 'Spotify', 'Disney+', 'PlayStation Plus', 'Amazon Prime Video'],
    averageMonthlyCost: 35,
    budgetRecommendation: 50,
    taxDeductible: false,
    isEssential: false,
    order: 1,
  },
  {
    id: Category.UTILITIES,
    name: 'Utilities',
    description: 'Essential services for home and daily life',
    icon: 'lightbulb',
    iconFamily: 'MaterialCommunityIcons',
    color: '#10B981', // Emerald
    gradient: ['#10B981', '#34D399'],
    subCategories: [
      {
        id: 'internet',
        name: 'Internet',
        description: 'Home and mobile internet services',
        icon: 'wifi',
        examples: ['Comcast Xfinity', 'AT&T Internet', 'Verizon Fios', 'Spectrum'],
      },
      {
        id: 'mobile',
        name: 'Mobile Phone',
        description: 'Cell phone plans and services',
        icon: 'cellphone',
        examples: ['Verizon Wireless', 'AT&T', 'T-Mobile', 'Google Fi'],
      },
      {
        id: 'electricity',
        name: 'Electricity',
        description: 'Power and energy services',
        icon: 'flash',
        examples: ['PG&E', 'Con Edison', 'Duke Energy', 'National Grid'],
      },
      {
        id: 'water',
        name: 'Water & Sewage',
        description: 'Water supply and sewage services',
        icon: 'water',
        examples: ['Local Water Company'],
      },
      {
        id: 'gas',
        name: 'Gas',
        description: 'Natural gas services',
        icon: 'fire',
        examples: ['Southern California Gas', 'CenterPoint Energy'],
      },
    ],
    popularServices: ['Comcast Xfinity', 'Verizon Wireless', 'AT&T', 'T-Mobile'],
    averageMonthlyCost: 150,
    budgetRecommendation: 200,
    taxDeductible: true, // Business use only
    isEssential: true,
    order: 2,
  },
  {
    id: Category.PRODUCTIVITY,
    name: 'Productivity',
    description: 'Software, tools, and services for work and productivity',
    icon: 'briefcase',
    iconFamily: 'MaterialCommunityIcons',
    color: '#F59E0B', // Amber
    gradient: ['#F59E0B', '#FBBF24'],
    subCategories: [
      {
        id: 'software',
        name: 'Software',
        description: 'Productivity software and suites',
        icon: 'laptop',
        examples: ['Microsoft 365', 'Adobe Creative Cloud', 'Google Workspace'],
      },
      {
        id: 'cloud',
        name: 'Cloud Storage',
        description: 'File storage and backup services',
        icon: 'cloud',
        examples: ['Dropbox', 'Google Drive', 'iCloud', 'OneDrive'],
      },
      {
        id: 'project',
        name: 'Project Management',
        description: 'Tools for managing projects and teams',
        icon: 'clipboard-check',
        examples: ['Asana', 'Trello', 'Monday.com', 'Jira'],
      },
      {
        id: 'communication',
        name: 'Communication',
        description: 'Business communication tools',
        icon: 'message-text',
        examples: ['Slack', 'Zoom', 'Microsoft Teams'],
      },
      {
        id: 'design',
        name: 'Design Tools',
        description: 'Graphic design and creative tools',
        icon: 'palette',
        examples: ['Figma', 'Canva Pro', 'Sketch'],
      },
    ],
    popularServices: ['Microsoft 365', 'Google Workspace', 'Dropbox', 'Adobe Creative Cloud'],
    averageMonthlyCost: 25,
    budgetRecommendation: 50,
    taxDeductible: true, // Business expenses
    isEssential: false,
    order: 3,
  },
  {
    id: Category.HEALTH,
    name: 'Health & Fitness',
    description: 'Healthcare, wellness, and fitness services',
    icon: 'heart-pulse',
    iconFamily: 'MaterialCommunityIcons',
    color: '#A855F7', // Purple
    gradient: ['#A855F7', '#C084FC'],
    subCategories: [
      {
        id: 'gym',
        name: 'Gym & Fitness',
        description: 'Gym memberships and fitness apps',
        icon: 'dumbbell',
        examples: ['24 Hour Fitness', 'Planet Fitness', 'ClassPass', 'Peloton'],
      },
      {
        id: 'health',
        name: 'Health Apps',
        description: 'Health tracking and wellness apps',
        icon: 'hospital-box',
        examples: ['MyFitnessPal', 'Headspace', 'Calm', 'Noom'],
      },
      {
        id: 'insurance',
        name: 'Health Insurance',
        description: 'Medical and dental insurance',
        icon: 'shield-plus',
        examples: ['Blue Cross', 'Aetna', 'UnitedHealthcare', 'Cigna'],
      },
      {
        id: 'telehealth',
        name: 'Telehealth',
        description: 'Virtual healthcare services',
        icon: 'video',
        examples: ['Teladoc', 'Doctor on Demand', 'Amwell'],
      },
      {
        id: 'supplements',
        name: 'Supplements',
        description: 'Vitamin and supplement subscriptions',
        icon: 'pill',
        examples: ['Care/of', 'Ritual', 'HUM Nutrition'],
      },
    ],
    popularServices: ['Planet Fitness', 'MyFitnessPal', 'Headspace', '24 Hour Fitness'],
    averageMonthlyCost: 50,
    budgetRecommendation: 75,
    taxDeductible: true, // Medical expenses (with limitations)
    isEssential: true,
    order: 4,
  },
  {
    id: Category.EDUCATION,
    name: 'Education',
    description: 'Learning platforms, courses, and educational services',
    icon: 'school',
    iconFamily: 'MaterialCommunityIcons',
    color: '#EC4899', // Pink
    gradient: ['#EC4899', '#F472B6'],
    subCategories: [
      {
        id: 'courses',
        name: 'Online Courses',
        description: 'Educational courses and certifications',
        icon: 'video-plus',
        examples: ['Coursera', 'Udemy', 'LinkedIn Learning', 'Skillshare'],
      },
      {
        id: 'language',
        name: 'Language Learning',
        description: 'Language learning apps and services',
        icon: 'translate',
        examples: ['Duolingo Plus', 'Babbel', 'Rosetta Stone'],
      },
      {
        id: 'coding',
        name: 'Coding & Tech',
        description: 'Programming and tech education',
        icon: 'code-braces',
        examples: ['Codecademy', 'Pluralsight', 'Treehouse'],
      },
      {
        id: 'kids',
        name: 'Kids Education',
        description: 'Educational content for children',
        icon: 'school-outline',
        examples: ['ABCmouse', 'Khan Academy Kids', 'Epic!'],
      },
      {
        id: 'professional',
        name: 'Professional Development',
        description: 'Career development and certifications',
        icon: 'certificate',
        examples: ['PMI', 'CFA Institute', 'Professional Associations'],
      },
    ],
    popularServices: ['Coursera', 'Duolingo Plus', 'Udemy', 'Skillshare'],
    averageMonthlyCost: 20,
    budgetRecommendation: 30,
    taxDeductible: true, // Educational expenses
    isEssential: false,
    order: 5,
  },
  {
    id: Category.FINANCE,
    name: 'Finance',
    description: 'Financial services, banking, and investment tools',
    icon: 'bank',
    iconFamily: 'MaterialCommunityIcons',
    color: '#3B82F6', // Blue
    gradient: ['#3B82F6', '#60A5FA'],
    subCategories: [
      {
        id: 'banking',
        name: 'Banking Fees',
        description: 'Bank account maintenance fees',
        icon: 'credit-card',
        examples: ['Monthly Account Fees', 'ATM Fees', 'Overdraft Protection'],
      },
      {
        id: 'investment',
        name: 'Investment',
        description: 'Investment platforms and tools',
        icon: 'chart-line',
        examples: ['Robinhood Gold', 'Betterment', 'Wealthfront', 'Acorns'],
      },
      {
        id: 'tax',
        name: 'Tax Software',
        description: 'Tax preparation software',
        icon: 'calculator',
        examples: ['TurboTax', 'H&R Block', 'TaxAct'],
      },
      {
        id: 'credit',
        name: 'Credit Services',
        description: 'Credit monitoring and reporting',
        icon: 'shield-check',
        examples: ['Experian', 'Equifax', 'Credit Karma', 'Identity Guard'],
      },
      {
        id: 'insurance',
        name: 'Insurance',
        description: 'Life, auto, and home insurance',
        icon: 'home-shield',
        examples: ['Geico', 'State Farm', 'Allstate', 'Progressive'],
      },
    ],
    popularServices: ['Robinhood Gold', 'TurboTax', 'Betterment', 'Credit Karma'],
    averageMonthlyCost: 15,
    budgetRecommendation: 25,
    taxDeductible: true, // Investment and tax expenses
    isEssential: true,
    order: 6,
  },
  {
    id: Category.SHOPPING,
    name: 'Shopping',
    description: 'Retail memberships, delivery services, and shopping subscriptions',
    icon: 'cart',
    iconFamily: 'MaterialCommunityIcons',
    color: '#F97316', // Orange
    gradient: ['#F97316', '#FB923C'],
    subCategories: [
      {
        id: 'retail',
        name: 'Retail Memberships',
        description: 'Store memberships and loyalty programs',
        icon: 'store',
        examples: ['Amazon Prime', 'Walmart+', 'Costco', 'Sam\'s Club'],
      },
      {
        id: 'delivery',
        name: 'Delivery Services',
        description: 'Food and grocery delivery',
        icon: 'truck-delivery',
        examples: ['Instacart', 'DoorDash DashPass', 'Uber Eats Pass', 'Shipt'],
      },
      {
        id: 'fashion',
        name: 'Fashion & Clothing',
        description: 'Clothing rental and subscription boxes',
        icon: 'hanger',
        examples: ['Stitch Fix', 'Rent the Runway', 'Trunk Club'],
      },
      {
        id: 'beauty',
        name: 'Beauty & Cosmetics',
        description: 'Beauty product subscriptions',
        icon: 'lipstick',
        examples: ['Ipsy', 'Birchbox', 'Sephora Play'],
      },
      {
        id: 'misc',
        name: 'Miscellaneous',
        description: 'Various product subscriptions',
        icon: 'package-variant',
        examples: ['Dollar Shave Club', 'HelloFresh', 'BarkBox'],
      },
    ],
    popularServices: ['Amazon Prime', 'Instacart', 'DoorDash DashPass', 'Costco'],
    averageMonthlyCost: 40,
    budgetRecommendation: 60,
    taxDeductible: false,
    isEssential: false,
    order: 7,
  },
  {
    id: Category.FOOD,
    name: 'Food & Dining',
    description: 'Food delivery, meal kits, and dining subscriptions',
    icon: 'food',
    iconFamily: 'MaterialCommunityIcons',
    color: '#EF4444', // Red
    gradient: ['#EF4444', '#F87171'],
    subCategories: [
      {
        id: 'mealkits',
        name: 'Meal Kits',
        description: 'Pre-portioned meal ingredient delivery',
        icon: 'food-takeout-box',
        examples: ['HelloFresh', 'Blue Apron', 'Home Chef', 'EveryPlate'],
      },
      {
        id: 'coffee',
        name: 'Coffee & Beverages',
        description: 'Coffee and beverage subscriptions',
        icon: 'coffee',
        examples: ['Trade Coffee', 'Atlas Coffee Club', 'Drink Trade'],
      },
      {
        id: 'snacks',
        name: 'Snacks & Treats',
        description: 'Snack and treat subscription boxes',
        icon: 'cookie',
        examples: ['SnackCrate', 'Universal Yums', 'TryTreats'],
      },
      {
        id: 'alcohol',
        name: 'Alcohol Delivery',
        description: 'Wine, beer, and spirit clubs',
        icon: 'glass-wine',
        examples: ['Winc', 'Bright Cellars', 'Flaviar', 'Tavour'],
      },
      {
        id: 'restaurant',
        name: 'Restaurant Memberships',
        description: 'Restaurant loyalty programs',
        icon: 'silverware-fork-knife',
        examples: ['Restaurant-specific memberships'],
      },
    ],
    popularServices: ['HelloFresh', 'Blue Apron', 'Trade Coffee', 'Home Chef'],
    averageMonthlyCost: 60,
    budgetRecommendation: 100,
    taxDeductible: false,
    isEssential: false,
    order: 8,
  },
  {
    id: Category.TRAVEL,
    name: 'Travel',
    description: 'Travel services, memberships, and accommodation',
    icon: 'airplane',
    iconFamily: 'MaterialCommunityIcons',
    color: '#10B981', // Emerald (reused for consistency)
    gradient: ['#10B981', '#34D399'],
    subCategories: [
      {
        id: 'accommodation',
        name: 'Accommodation',
        description: 'Hotel and lodging memberships',
        icon: 'bed',
        examples: ['Marriott Bonvoy', 'Hilton Honors', 'IHG Rewards'],
      },
      {
        id: 'transportation',
        name: 'Transportation',
        description: 'Ride-sharing and transportation services',
        icon: 'car',
        examples: ['Uber One', 'Lyft Pink', 'Zipcar', 'Turo'],
      },
      {
        id: 'travelapps',
        name: 'Travel Apps',
        description: 'Travel planning and booking tools',
        icon: 'map-marker',
        examples: ['TripIt Pro', 'App in the Air', 'LoungeBuddy'],
      },
      {
        id: 'airline',
        name: 'Airline Memberships',
        description: 'Airline loyalty programs and subscriptions',
        icon: 'airplane-takeoff',
        examples: ['Delta SkyMiles', 'American Airlines AAdvantage', 'United MileagePlus'],
      },
      {
        id: 'vacation',
        name: 'Vacation Rentals',
        description: 'Vacation rental platforms',
        icon: 'home-city',
        examples: ['Airbnb Plus', 'VRBO', 'Vacasa'],
      },
    ],
    popularServices: ['Uber One', 'Lyft Pink', 'Marriott Bonvoy', 'TripIt Pro'],
    averageMonthlyCost: 25,
    budgetRecommendation: 40,
    taxDeductible: true, // Business travel
    isEssential: false,
    order: 9,
  },
  {
    id: Category.OTHER,
    name: 'Other',
    description: 'Miscellaneous subscriptions and services',
    icon: 'dots-horizontal-circle',
    iconFamily: 'MaterialCommunityIcons',
    color: '#6B7280', // Gray
    gradient: ['#6B7280', '#9CA3AF'],
    subCategories: [
      {
        id: 'donations',
        name: 'Donations',
        description: 'Charitable donations and memberships',
        icon: 'heart',
        examples: ['Patreon', 'Twitch Subscriptions', 'Charity Memberships'],
      },
      {
        id: 'memberships',
        name: 'Club Memberships',
        description: 'Social and club memberships',
        icon: 'account-group',
        examples: ['Country Clubs', 'Gym Social Clubs', 'Professional Organizations'],
      },
      {
        id: 'services',
        name: 'Misc Services',
        description: 'Various services and subscriptions',
        icon: 'wrench',
        examples: ['Lawn Care', 'Cleaning Services', 'Pet Services'],
      },
      {
        id: 'custom',
        name: 'Custom',
        description: 'Custom subscriptions',
        icon: 'pencil',
        examples: ['Custom Subscription'],
      },
    ],
    popularServices: ['Patreon', 'Custom Services'],
    averageMonthlyCost: 20,
    budgetRecommendation: 30,
    taxDeductible: false,
    isEssential: false,
    order: 10,
  },
];

// Helper functions
export const CategoryHelpers = {
  /**
   * Get category by ID
   */
  getCategoryById(categoryId) {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES.find(cat => cat.id === Category.OTHER);
  },

  /**
   * Get category by name
   */
  getCategoryByName(categoryName) {
    return CATEGORIES.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase()) || 
           CATEGORIES.find(cat => cat.id === Category.OTHER);
  },

  /**
   * Get subcategory by ID
   */
  getSubCategoryById(categoryId, subCategoryId) {
    const category = this.getCategoryById(categoryId);
    if (!category || !category.subCategories) return null;
    
    return category.subCategories.find(sub => sub.id === subCategoryId) || null;
  },

  /**
   * Get all categories as options for dropdown
   */
  getCategoryOptions() {
    return CATEGORIES.map(category => ({
      label: category.name,
      value: category.id,
      color: category.color,
      icon: category.icon,
    }));
  },

  /**
   * Get subcategory options for a category
   */
  getSubCategoryOptions(categoryId) {
    const category = this.getCategoryById(categoryId);
    if (!category || !category.subCategories) return [];
    
    return category.subCategories.map(sub => ({
      label: sub.name,
      value: sub.id,
      icon: sub.icon,
    }));
  },

  /**
   * Get icon for category
   */
  getCategoryIcon(categoryId) {
    const category = this.getCategoryById(categoryId);
    return category?.icon || 'help-circle';
  },

  /**
   * Get color for category
   */
  getCategoryColor(categoryId) {
    const category = this.getCategoryById(categoryId);
    return category?.color || '#6B7280';
  },

  /**
   * Get gradient for category
   */
  getCategoryGradient(categoryId) {
    const category = this.getCategoryById(categoryId);
    return category?.gradient || ['#6B7280', '#9CA3AF'];
  },

  /**
   * Auto-detect category from service name
   */
  detectCategoryFromName(serviceName) {
    const name = serviceName.toLowerCase();
    
    // Entertainment detection
    if (name.includes('netflix') || name.includes('disney') || name.includes('hulu') || 
        name.includes('hbo') || name.includes('prime video') || name.includes('youtube')) {
      return Category.ENTERTAINMENT;
    }
    
    // Music detection
    if (name.includes('spotify') || name.includes('apple music') || name.includes('pandora')) {
      return Category.ENTERTAINMENT;
    }
    
    // Utility detection
    if (name.includes('internet') || name.includes('wifi') || name.includes('comcast') || 
        name.includes('verizon') || name.includes('at&t') || name.includes('mobile')) {
      return Category.UTILITIES;
    }
    
    // Productivity detection
    if (name.includes('microsoft') || name.includes('office') || name.includes('adobe') || 
        name.includes('dropbox') || name.includes('google drive') || name.includes('slack')) {
      return Category.PRODUCTIVITY;
    }
    
    // Health detection
    if (name.includes('gym') || name.includes('fitness') || name.includes('peloton') || 
        name.includes('health') || name.includes('insurance') || name.includes('medical')) {
      return Category.HEALTH;
    }
    
    // Shopping detection
    if (name.includes('amazon') || name.includes('prime') || name.includes('costco') || 
        name.includes('walmart') || name.includes('delivery') || name.includes('instacart')) {
      return Category.SHOPPING;
    }
    
    // Food detection
    if (name.includes('food') || name.includes('meal') || name.includes('hello') || 
        name.includes('blue apron') || name.includes('coffee') || name.includes('snack')) {
      return Category.FOOD;
    }
    
    // Travel detection
    if (name.includes('uber') || name.includes('lyft') || name.includes('airline') || 
        name.includes('hotel') || name.includes('marriott') || name.includes('hilton')) {
      return Category.TRAVEL;
    }
    
    // Finance detection
    if (name.includes('bank') || name.includes('credit') || name.includes('investment') || 
        name.includes('tax') || name.includes('insurance') || name.includes('robinhood')) {
      return Category.FINANCE;
    }
    
    // Education detection
    if (name.includes('course') || name.includes('learning') || name.includes('education') || 
        name.includes('duolingo') || name.includes('skillshare') || name.includes('udemy')) {
      return Category.EDUCATION;
    }
    
    return Category.OTHER;
  },

  /**
   * Get category statistics
   */
  getCategoryStatistics(subscriptions) {
    const stats = {};
    
    CATEGORIES.forEach(category => {
      const categorySubs = subscriptions.filter(sub => sub.category === category.id);
      const totalMonthly = categorySubs.reduce((sum, sub) => {
        // Calculate monthly amount for each subscription
        const amount = sub.amount || 0;
        const cycle = sub.billingCycle || 'monthly';
        
        switch (cycle) {
          case 'daily': return sum + (amount * 30);
          case 'weekly': return sum + (amount * 4.33);
          case 'monthly': return sum + amount;
          case 'yearly': return sum + (amount / 12);
          default: return sum + amount;
        }
      }, 0);
      
      stats[category.id] = {
        name: category.name,
        count: categorySubs.length,
        totalMonthly: totalMonthly,
        averageMonthly: categorySubs.length > 0 ? totalMonthly / categorySubs.length : 0,
        color: category.color,
        icon: category.icon,
      };
    });
    
    return stats;
  },

  /**
   * Get budget recommendations by category
   */
  getBudgetRecommendations() {
    const recommendations = {};
    
    CATEGORIES.forEach(category => {
      recommendations[category.id] = {
        minimum: Math.round(category.averageMonthlyCost * 0.5),
        recommended: category.budgetRecommendation,
        maximum: Math.round(category.averageMonthlyCost * 1.5),
      };
    });
    
    return recommendations;
  },

  /**
   * Get popular services by category
   */
  getPopularServicesByCategory(categoryId) {
    const category = this.getCategoryById(categoryId);
    return category?.popularServices || [];
  },
};

// Export default
export default {
  Category,
  CATEGORIES,
  CategoryHelpers,
  
  // Convenience exports
  getCategory: CategoryHelpers.getCategoryById,
  getCategoryIcon: CategoryHelpers.getCategoryIcon,
  getCategoryColor: CategoryHelpers.getCategoryColor,
  detectCategory: CategoryHelpers.detectCategoryFromName,
  getCategoryOptions: CategoryHelpers.getCategoryOptions,
};