export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  likes: number;
  views: number;
  comments: Comment[];
  tags: string[];
  category: string;
  createdAt: string;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coverImage: string;
  bio: string;
  followers: number;
  following: number;
  videosCount: number;
  isFollowing?: boolean;
}

export const categories = [
  "All",
  "Music",
  "Comedy",
  "Dance",
  "Gaming",
  "Sports",
  "Food",
  "Travel",
  "Education",
  "Tech",
];

export const mockUsers: User[] = [
  {
    id: "user1",
    username: "creativemind",
    displayName: "Creative Mind",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop",
    bio: "Creating content that inspires ✨ | Daily uploads | 🎬 Filmmaker",
    followers: 125000,
    following: 892,
    videosCount: 48,
  },
  {
    id: "user2",
    username: "musicvibes",
    displayName: "Music Vibes",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=400&fit=crop",
    bio: "🎵 Music producer | Beat maker | Sharing the vibes",
    followers: 89000,
    following: 456,
    videosCount: 32,
  },
  {
    id: "user3",
    username: "techguru",
    displayName: "Tech Guru",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop",
    bio: "Tech reviews & tutorials 📱💻 | Making tech simple",
    followers: 234000,
    following: 123,
    videosCount: 67,
  },
];

export const mockVideos: Video[] = [
  {
    id: "vid1",
    title: "Amazing Sunset Timelapse",
    description: "Captured this beautiful sunset over the mountains. Nature never fails to amaze! 🌅",
    thumbnail: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&h=600&fit=crop",
    videoUrl: "https://example.com/video1.mp4",
    creatorId: "user1",
    creatorName: "Creative Mind",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    likes: 15420,
    views: 128000,
    comments: [
      {
        id: "c1",
        userId: "user2",
        userName: "Music Vibes",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        text: "This is absolutely stunning! 😍",
        createdAt: "2024-01-15T10:30:00Z",
        likes: 234,
      },
      {
        id: "c2",
        userId: "user3",
        userName: "Tech Guru",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        text: "What camera did you use for this?",
        createdAt: "2024-01-15T11:00:00Z",
        likes: 89,
      },
    ],
    tags: ["sunset", "timelapse", "nature", "mountains"],
    category: "Travel",
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "vid2",
    title: "Lo-Fi Beats to Study To",
    description: "Chill beats for your study session. Like and follow for more! 🎵",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop",
    videoUrl: "https://example.com/video2.mp4",
    creatorId: "user2",
    creatorName: "Music Vibes",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    likes: 28900,
    views: 450000,
    comments: [
      {
        id: "c3",
        userId: "user1",
        userName: "Creative Mind",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        text: "Perfect for late night work sessions!",
        createdAt: "2024-01-14T22:00:00Z",
        likes: 567,
      },
    ],
    tags: ["lofi", "music", "study", "beats"],
    category: "Music",
    createdAt: "2024-01-14T18:00:00Z",
  },
  {
    id: "vid3",
    title: "iPhone 15 Pro Review",
    description: "Complete review of the new iPhone 15 Pro. Is it worth the upgrade? 📱",
    thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=600&fit=crop",
    videoUrl: "https://example.com/video3.mp4",
    creatorId: "user3",
    creatorName: "Tech Guru",
    creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    likes: 45600,
    views: 890000,
    comments: [],
    tags: ["iphone", "tech", "review", "apple"],
    category: "Tech",
    createdAt: "2024-01-13T12:00:00Z",
  },
  {
    id: "vid4",
    title: "Dance Challenge 2024",
    description: "New dance challenge! Try it out and tag me! 💃🕺",
    thumbnail: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=600&fit=crop",
    videoUrl: "https://example.com/video4.mp4",
    creatorId: "user1",
    creatorName: "Creative Mind",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    likes: 89000,
    views: 1200000,
    comments: [],
    tags: ["dance", "challenge", "viral", "trending"],
    category: "Dance",
    createdAt: "2024-01-12T16:00:00Z",
  },
  {
    id: "vid5",
    title: "Street Food Tour Tokyo",
    description: "Exploring the best street food in Tokyo! 🍜🇯🇵",
    thumbnail: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=600&fit=crop",
    videoUrl: "https://example.com/video5.mp4",
    creatorId: "user2",
    creatorName: "Music Vibes",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    likes: 34500,
    views: 560000,
    comments: [],
    tags: ["food", "tokyo", "japan", "streetfood"],
    category: "Food",
    createdAt: "2024-01-11T14:00:00Z",
  },
  {
    id: "vid6",
    title: "Gaming Setup Tour 2024",
    description: "My ultimate gaming setup revealed! Specs in description 🎮",
    thumbnail: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=600&fit=crop",
    videoUrl: "https://example.com/video6.mp4",
    creatorId: "user3",
    creatorName: "Tech Guru",
    creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    likes: 67800,
    views: 980000,
    comments: [],
    tags: ["gaming", "setup", "pc", "tech"],
    category: "Gaming",
    createdAt: "2024-01-10T20:00:00Z",
  },
  {
    id: "vid7",
    title: "Comedy Skit: Office Life",
    description: "When your boss says 'quick meeting' 😂",
    thumbnail: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=600&fit=crop",
    videoUrl: "https://example.com/video7.mp4",
    creatorId: "user1",
    creatorName: "Creative Mind",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    likes: 156000,
    views: 2300000,
    comments: [],
    tags: ["comedy", "funny", "office", "relatable"],
    category: "Comedy",
    createdAt: "2024-01-09T10:00:00Z",
  },
  {
    id: "vid8",
    title: "Morning Yoga Routine",
    description: "Start your day right with this 10-minute routine 🧘‍♀️",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop",
    videoUrl: "https://example.com/video8.mp4",
    creatorId: "user2",
    creatorName: "Music Vibes",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    likes: 23400,
    views: 340000,
    comments: [],
    tags: ["yoga", "fitness", "morning", "health"],
    category: "Sports",
    createdAt: "2024-01-08T06:00:00Z",
  },
];

export const currentUser: User = {
  id: "currentUser",
  username: "johndoe",
  displayName: "John Doe",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
  bio: "Content creator & video enthusiast 🎬 | Sharing my journey",
  followers: 5420,
  following: 234,
  videosCount: 12,
};
