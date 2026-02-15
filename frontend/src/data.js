// Mock Data for Graphic Corner System

export const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@graphiccorner.lk",
    password: "admin123",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=E63946&color=fff"
  },
  {
    id: 2,
    name: "Nimal Silva",
    email: "nimal@graphiccorner.lk",
    password: "team123",
    role: "team",
    specialty: "Video Editor",
    avatar: "https://ui-avatars.com/api/?name=Nimal+Silva&background=4CAF50&color=fff"
  },
  {
    id: 3,
    name: "Shalini Fernando",
    email: "shalini@graphiccorner.lk",
    password: "team123",
    role: "team",
    specialty: "Graphic Designer",
    avatar: "https://ui-avatars.com/api/?name=Shalini+Fernando&background=2196F3&color=fff"
  },
  {
    id: 4,
    name: "Kasun Perera",
    email: "kasun@example.com",
    password: "customer123",
    role: "customer",
    avatar: "https://ui-avatars.com/api/?name=Kasun+Perera&background=FF9800&color=fff"
  },
  {
    id: 5,
    name: "Dilini Jayawardena",
    email: "dilini@example.com",
    password: "customer123",
    role: "customer",
    avatar: "https://ui-avatars.com/api/?name=Dilini+Jayawardena&background=9C27B0&color=fff"
  }
];

export const services = [
  // Graphics Services
  {
    id: 1,
    name: "Logo Design",
    category: "Graphics",
    description: "Professional logo design with unlimited revisions",
    priceRange: "5,000 - 8,000",
    minPrice: 5000,
    maxPrice: 8000,
    currency: "LKR",
    deliveryTime: "3-5 days",
    icon: "Palette"
  },
  {
    id: 2,
    name: "Social Media Post Design",
    category: "Graphics",
    description: "Eye-catching social media graphics",
    priceRange: "800 - 1,500",
    minPrice: 800,
    maxPrice: 1500,
    currency: "LKR",
    deliveryTime: "1-2 days",
    icon: "Image"
  },
  {
    id: 3,
    name: "Flyer Design",
    category: "Graphics",
    description: "Print-ready flyers for promotions",
    priceRange: "1,200 - 2,500",
    minPrice: 1200,
    maxPrice: 2500,
    currency: "LKR",
    deliveryTime: "2-3 days",
    icon: "FileText"
  },
  // Video Services
  {
    id: 4,
    name: "Video Editing - Short Reels",
    category: "Video",
    description: "Professional editing for Instagram/TikTok reels",
    priceRange: "1,500",
    minPrice: 1500,
    maxPrice: 1500,
    currency: "LKR",
    deliveryTime: "1-2 days",
    icon: "Video"
  },
  {
    id: 5,
    name: "YouTube Video Editing",
    category: "Video",
    description: "Full video editing with effects and transitions",
    priceRange: "3,500 - 6,000",
    minPrice: 3500,
    maxPrice: 6000,
    currency: "LKR",
    deliveryTime: "3-5 days",
    icon: "Film"
  },
  {
    id: 6,
    name: "Thumbnail Design",
    category: "Video",
    description: "Click-worthy YouTube thumbnails",
    priceRange: "500 - 800",
    minPrice: 500,
    maxPrice: 800,
    currency: "LKR",
    deliveryTime: "1 day",
    icon: "Monitor"
  },
  // 3D Services
  {
    id: 7,
    name: "3D Product Rendering",
    category: "3D",
    description: "Photorealistic 3D product visualization",
    priceRange: "8,000 - 15,000",
    minPrice: 8000,
    maxPrice: 15000,
    currency: "LKR",
    deliveryTime: "5-7 days",
    icon: "Box"
  },
  {
    id: 8,
    name: "3D Animation",
    category: "3D",
    description: "Short 3D animated videos",
    priceRange: "12,000 - 25,000",
    minPrice: 12000,
    maxPrice: 25000,
    currency: "LKR",
    deliveryTime: "7-10 days",
    icon: "Cube"
  },
  // AI Services
  {
    id: 9,
    name: "AI Image Generation",
    category: "AI",
    description: "Custom AI-generated images using latest models",
    priceRange: "2,000 - 4,000",
    minPrice: 2000,
    maxPrice: 4000,
    currency: "LKR",
    deliveryTime: "1-2 days",
    icon: "Sparkles"
  },
  {
    id: 10,
    name: "AI Content Writing",
    category: "AI",
    description: "SEO-optimized AI-assisted content",
    priceRange: "1,500 - 3,000",
    minPrice: 1500,
    maxPrice: 3000,
    currency: "LKR",
    deliveryTime: "1-2 days",
    icon: "PenTool"
  }
];

export const packages = [
  {
    id: 1,
    name: "Tuition Silver Plan",
    description: "Perfect for educational institutions",
    price: 14000,
    currency: "LKR",
    duration: "Monthly",
    features: [
      "4 Short Videos (Reels/TikTok)",
      "4 Social Media Posts",
      "Custom Graphics",
      "Priority Support"
    ],
    popular: false
  },
  {
    id: 2,
    name: "YouTube Gold Plan",
    description: "Comprehensive YouTube content package",
    price: 40000,
    currency: "LKR",
    duration: "Monthly",
    features: [
      "6 YouTube Videos (Fully Edited)",
      "6 Custom Thumbnails",
      "Video SEO Optimization",
      "Intro/Outro Templates",
      "24/7 Support"
    ],
    popular: true
  },
  {
    id: 3,
    name: "Business Starter Pack",
    description: "Complete branding solution",
    price: 25000,
    currency: "LKR",
    duration: "One-time",
    features: [
      "Logo Design",
      "Business Card Design",
      "5 Social Media Posts",
      "2 Short Videos",
      "Unlimited Revisions"
    ],
    popular: false
  }
];

export const orders = [
  {
    id: 1,
    customerId: 4,
    customerName: "Kasun Perera",
    serviceId: 4,
    serviceName: "Video Editing - Short Reels",
    status: "awaiting_advance",
    currentStep: 2,
    totalSteps: 6,
    totalAmount: 1500,
    advanceAmount: 375,
    finalAmount: 1125,
    orderDate: "2026-02-10",
    expectedDelivery: "2026-02-16",
    assignedTeam: null,
    paymentSlips: [],
    files: {
      rawFootage: null,
      watermark: null,
      finalLink: null
    },
    notes: "Need quick turnaround for Instagram campaign"
  },
  {
    id: 2,
    customerId: 5,
    customerName: "Dilini Jayawardena",
    serviceId: 1,
    serviceName: "Logo Design",
    status: "in_progress",
    currentStep: 3,
    totalSteps: 6,
    totalAmount: 6500,
    advanceAmount: 1625,
    finalAmount: 4875,
    orderDate: "2026-02-08",
    expectedDelivery: "2026-02-15",
    assignedTeam: 3,
    assignedTeamName: "Shalini Fernando",
    paymentSlips: [
      {
        id: 1,
        amount: 1625,
        uploadDate: "2026-02-09",
        status: "approved"
      }
    ],
    files: {
      rawFootage: null,
      watermark: "https://drive.google.com/preview/logo_v1.png",
      finalLink: null
    },
    notes: "Modern minimalist style preferred"
  },
  {
    id: 3,
    customerId: 4,
    customerName: "Kasun Perera",
    serviceId: 5,
    serviceName: "YouTube Video Editing",
    status: "completed",
    currentStep: 6,
    totalSteps: 6,
    totalAmount: 5000,
    advanceAmount: 1250,
    finalAmount: 3750,
    orderDate: "2026-01-28",
    expectedDelivery: "2026-02-05",
    completedDate: "2026-02-04",
    assignedTeam: 2,
    assignedTeamName: "Nimal Silva",
    paymentSlips: [
      {
        id: 1,
        amount: 1250,
        uploadDate: "2026-01-29",
        status: "approved"
      },
      {
        id: 2,
        amount: 3750,
        uploadDate: "2026-02-03",
        status: "approved"
      }
    ],
    files: {
      rawFootage: "https://drive.google.com/raw/video_raw.mp4",
      watermark: "https://drive.google.com/preview/video_preview.mp4",
      finalLink: "https://drive.google.com/final/video_final.mp4"
    },
    rating: 5,
    review: "Excellent work! Very professional.",
    notes: "Tech tutorial video"
  }
];

export const tasks = [
  {
    id: 1,
    orderId: 2,
    title: "Logo Design - Dilini Jayawardena",
    description: "Modern minimalist logo design",
    status: "in_progress",
    assignedTo: 3,
    assignedToName: "Shalini Fernando",
    dueDate: "2026-02-15",
    priority: "high"
  },
  {
    id: 2,
    orderId: 1,
    title: "Video Editing - Kasun Perera",
    description: "Short reel for Instagram campaign",
    status: "todo",
    assignedTo: null,
    dueDate: "2026-02-16",
    priority: "medium"
  },
  {
    id: 3,
    orderId: null,
    title: "Update Portfolio Website",
    description: "Add recent projects to showcase",
    status: "review",
    assignedTo: 2,
    assignedToName: "Nimal Silva",
    dueDate: "2026-02-20",
    priority: "low"
  }
];

export const financialData = {
  totalRevenue: 125000,
  pendingPayments: 28500,
  monthlyGrowth: 15.5,
  targetSales: 150000,
  actualSales: 125000,
  revenueByService: [
    { name: "Graphics", value: 45000, percentage: 36 },
    { name: "Video", value: 55000, percentage: 44 },
    { name: "3D", value: 20000, percentage: 16 },
    { name: "AI", value: 5000, percentage: 4 }
  ],
  monthlyData: [
    { month: "Jan", target: 150000, actual: 125000 },
    { month: "Feb", target: 150000, actual: 140000 },
    { month: "Mar", target: 160000, actual: 155000 },
    { month: "Apr", target: 160000, actual: 148000 },
    { month: "May", target: 170000, actual: 165000 },
    { month: "Jun", target: 170000, actual: 175000 }
  ]
};

export const walletTransactions = [
  {
    id: 1,
    userId: 4,
    type: "credit",
    amount: 5000,
    description: "Top-up via Bank Transfer",
    date: "2026-02-12",
    status: "completed"
  },
  {
    id: 2,
    userId: 4,
    type: "debit",
    amount: 1500,
    description: "Payment for Order #1",
    date: "2026-02-10",
    status: "completed"
  },
  {
    id: 3,
    userId: 5,
    type: "credit",
    amount: 10000,
    description: "Top-up via Card",
    date: "2026-02-08",
    status: "completed"
  }
];

// Helper Functions
export const getOrdersByCustomerId = (customerId) => {
  return orders.filter(order => order.customerId === customerId);
};

export const getOrdersByTeamMemberId = (teamId) => {
  return orders.filter(order => order.assignedTeam === teamId);
};

export const getTasksByTeamMemberId = (teamId) => {
  return tasks.filter(task => task.assignedTo === teamId);
};

export const getUserById = (userId) => {
  return users.find(user => user.id === userId);
};

export const getServiceById = (serviceId) => {
  return services.find(service => service.id === serviceId);
};

export const getOrderById = (orderId) => {
  return orders.find(order => order.id === orderId);
};

// Status Step Names
export const statusSteps = [
  { id: 1, name: "Pending Approval", key: "pending" },
  { id: 2, name: "Advance Payment (25%)", key: "awaiting_advance" },
  { id: 3, name: "Work in Progress", key: "in_progress" },
  { id: 4, name: "Review Watermark", key: "review" },
  { id: 5, name: "Final Payment", key: "awaiting_final" },
  { id: 6, name: "Completed", key: "completed" }
];
