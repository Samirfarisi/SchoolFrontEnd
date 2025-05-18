// Mock data to use when the API is unreachable
export const mockCourses = [
  {
    id: 1,
    title: "Introduction to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript to start building websites.",
    video_url: "https://www.youtube.com/watch?v=HD13eq_Pmp8",
    category_id: 1,
    created_at: "2025-01-15T08:30:00.000Z",
    updated_at: "2025-01-15T08:30:00.000Z",
    category: { id: 1, name: "Web Development" }
  },
  {
    id: 2,
    title: "Advanced React Techniques",
    description: "Explore advanced React concepts including hooks, context API, and performance optimization.",
    video_url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
    category_id: 1,
    created_at: "2025-01-20T10:15:00.000Z",
    updated_at: "2025-01-20T10:15:00.000Z",
    category: { id: 1, name: "Web Development" }
  },
  {
    id: 3,
    title: "Mobile App Development with React Native",
    description: "Build native mobile applications for iOS and Android using React Native.",
    video_url: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
    category_id: 2,
    created_at: "2025-01-25T14:45:00.000Z",
    updated_at: "2025-01-25T14:45:00.000Z",
    category: { id: 2, name: "Mobile Development" }
  },
  {
    id: 4,
    title: "Database Design Fundamentals",
    description: "Learn to design efficient and scalable database schemas.",
    video_url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
    category_id: 3,
    created_at: "2025-02-05T09:20:00.000Z",
    updated_at: "2025-02-05T09:20:00.000Z",
    category: { id: 3, name: "Database" }
  },
  {
    id: 5,
    title: "UI/UX Design Principles",
    description: "Master the principles of creating effective and intuitive user interfaces.",
    video_url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
    category_id: 4,
    created_at: "2025-02-10T11:30:00.000Z",
    updated_at: "2025-02-10T11:30:00.000Z",
    category: { id: 4, name: "Design" }
  }
];

export const mockCategories = [
  { id: 1, name: "Web Development", created_at: "2025-01-01T00:00:00.000Z", updated_at: "2025-01-01T00:00:00.000Z" },
  { id: 2, name: "Mobile Development", created_at: "2025-01-01T00:00:00.000Z", updated_at: "2025-01-01T00:00:00.000Z" },
  { id: 3, name: "Database", created_at: "2025-01-01T00:00:00.000Z", updated_at: "2025-01-01T00:00:00.000Z" },
  { id: 4, name: "Design", created_at: "2025-01-01T00:00:00.000Z", updated_at: "2025-01-01T00:00:00.000Z" },
  { id: 5, name: "DevOps", created_at: "2025-01-01T00:00:00.000Z", updated_at: "2025-01-01T00:00:00.000Z" }
];

export const mockUser = {
  id: 1,
  name: "Demo User",
  email: "demo@example.com",
  role: "student"
};

export const mockProgress = {
  completed: [
    {
      id: 1,
      course_id: 2,
      user_id: 1,
      completed_at: "2025-04-15T16:30:00.000Z",
      progress: 1,
      course: {
        id: 2,
        title: "Advanced React Techniques"
      }
    }
  ],
  in_progress: [
    {
      id: 2,
      course_id: 1,
      user_id: 1,
      progress: 0.6,
      course: {
        id: 1,
        title: "Introduction to Web Development"
      }
    }
  ],
  stats: {
    total_courses: 5,
    completed: 1,
    in_progress: 1,
    not_started: 3,
    completion_percentage: 20
  }
};
