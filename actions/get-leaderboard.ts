// leaderboard.ts
import { db } from "@/lib/db";

// Define interface for leaderboard entry
export interface LeaderboardEntry {
  userId: string;
  total_completed_chapters: number;
  total_chapters_in_courses: number;
  course_completed: number;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const leaderboardData: LeaderboardEntry[] = await db.$queryRaw`
      SELECT 
        subquery.userId,
        SUM(subquery.total_completed_chapters) AS total_completed_chapters,
        SUM(subquery.total_chapters_in_course) AS total_chapters_in_courses,
        SUM(CASE WHEN subquery.total_completed_chapters = subquery.total_chapters_in_course THEN 1 ELSE 0 END) AS course_completed
      FROM (
        SELECT 
          up.userId,
          c.id AS course_id,
          COUNT(DISTINCT CASE WHEN up.isCompleted = 1 THEN up.chapterId END) AS total_completed_chapters,
          (SELECT COUNT(DISTINCT ch.id) FROM Chapter ch WHERE ch.courseId = c.id) AS total_chapters_in_course
        FROM 
          UserProgress up
        JOIN 
          Chapter ch ON up.chapterId = ch.id
        JOIN
          Course c ON ch.courseId = c.id
        GROUP BY 
          up.userId, c.id
      ) AS subquery
      GROUP BY 
        subquery.userId;
    `;

    return leaderboardData;
  } catch (error) {
    console.error("[GET_LEADERBOARD]", error);
    return [];
  }
};