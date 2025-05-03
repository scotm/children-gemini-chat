// Define a type for the user profile
export interface UserProfile {
  age: number;
  characteristics: string[];
  interests: string[];
}

// Placeholder user profile (for an 8-year-old, bright, curious, imaginative, and creative girl)
export const placeholderUserProfile: UserProfile = {
  age: 8,
  characteristics: ["bright", "curious", "imaginative", "creative"],
  interests: ["stories", "drawing", "science", "animals"], // Example interests
};

export const userProfiles = [
  placeholderUserProfile,
  {
    age: 6,
    characteristics: ["shy", "quiet", "observant"],
    interests: ["animals", "nature", "books"],
  },
  {
    age: 10,
    characteristics: ["outgoing", "energetic", "sporty"],
    interests: ["sports", "games", "friends"],
  },
];
