export interface Course {
  id: number;
  title: string;
  description: string;
  module: string;
  durationHours: string;
  badgeImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageableCourse {
  content: Course[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
}

export interface CourseRequestParams {
  module?: string;
  page?: number;
  size?: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  module: string;
  duration: string;
  image?: string;
}

export interface CourseResponse {
  id: number;
  title: string;
  description: string;
  module: string;
  durationHours: string;
  badgeImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: string;
  userProgress: UserProgress[];
}

export interface UserProgress {
  id: number;
  user: User;
  course: Course;
  status: string;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface CreateUserProgressDto {
  userEmail: string;
  courseId: number;
}

export interface UserProgressDetail {
  userName: string;
  courseId: number;
  courseName: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
}

export interface CompleteCourseResponse {
  message: string;
  badge: number;
  course: {
    courseId: number;
    userName: string;
    courseTitle: string;
    status: string;
  };
}

export interface Badge {
  code: string;
  title: string;
  description: string;
  userid: string;
  username: string;
}
