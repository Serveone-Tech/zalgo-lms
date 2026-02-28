import { storage } from "../storage";

const courseMetadata: Record<string, { level: string; rating: number }> = {
  "course-001": { level: "Beginner to Advanced", rating: 4.8 },
  "course-002": { level: "Intermediate", rating: 4.7 },
  "course-003": { level: "All Levels", rating: 4.9 },
  "course-004": { level: "Advanced", rating: 4.6 },
};

export async function enrichCourse(course: any) {
  const instructor = await storage.getUser(course.creatorId);
  const lectureCount = await storage.getCourseLectureCount(course.id);
  const studentCount = await storage.getCourseEnrollmentCount(course.id);
  const meta = courseMetadata[course.id] ?? { level: "All Levels", rating: 4.5 };
  return {
    ...course,
    instructorName: instructor?.userName ?? "Zalgo Edutech",
    lectureCount,
    studentCount,
    level: meta.level,
    rating: meta.rating,
  };
}
