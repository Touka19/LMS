import { db } from "@/lib/db";
import { Course, Purchase, Chapter } from "@prisma/client";

type PurchaseWithCourse = Purchase & {
  course: Course;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};
  
  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }
    grouped[courseTitle] += purchase.course.price!;
  });

  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {
    // Fetch purchases with associated courses
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId: userId
        }
      },
      include: {
        course: true,
      }
    });

    // Fetch chapters associated with the purchased courses
    const coursesIds = purchases.map(purchase => purchase.course.id);
    const chapters = await db.chapter.findMany({
      where: {
        courseId: {
          in: coursesIds
        },
        isPublished: true // Assuming this indicates a completed chapter
      }
    });

    // Initialize object to store completed chapters count by course
    const completedChaptersByCourse: { [courseId: string]: number } = {};

    // Count completed chapters for each course
    chapters.forEach(chapter => {
      const courseId = chapter.courseId;
      completedChaptersByCourse[courseId] = (completedChaptersByCourse[courseId] || 0) + 1;
    });

    // Calculate total completed chapters for all courses
    const totalCompletedChapters = Object.values(completedChaptersByCourse).reduce((acc, curr) => acc + curr, 0);

    // Count completed courses for the user
    const completedCourses: { [courseId: string]: boolean } = {};
    purchases.forEach(purchase => {
      completedCourses[purchase.courseId] = true;
    });
    const totalCompletedCourses = Object.keys(completedCourses).length;

    // Proceed with the existing logic to calculate total revenue and sales
    const groupedEarnings = groupByCourse(purchases);
    const data = Object.entries(groupedEarnings).map(([courseTitle, total]) => ({
      name: courseTitle,
      total: total,
    }));

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = purchases.length;

    return {
      data,
      totalRevenue,
      totalSales,
      totalCompletedChapters,
      totalCompletedCourses,
    }
  } catch (error) {
    console.log("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
      totalCompletedChapters: 0,
      totalCompletedCourses: 0,
    }
  }
}