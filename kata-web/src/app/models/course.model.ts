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
