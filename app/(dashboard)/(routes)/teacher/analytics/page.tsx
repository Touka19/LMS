// page.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { LeaderboardEntry, getLeaderboard } from "@/actions/get-leaderboard"; // Import LeaderboardEntry and getLeaderboard from leaderboard.ts

import { getAnalytics } from "@/actions/get-analytics";
import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";

const AnalyticsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const {
    data,
    totalRevenue,
    totalSales,
    totalCompletedChapters,
    totalCompletedCourses,
  } = await getAnalytics(userId);

  let leaderboardData: LeaderboardEntry[] = [];

  try {
    leaderboardData = await getLeaderboard();
    // Check if leaderboardData is not an array
    if (!Array.isArray(leaderboardData)) {
      throw new Error("Leaderboard data is not an array.");
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    // Provide a fallback value
    leaderboardData = [];
  }

  return ( 
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DataCard
          label="Total Revenue"
          value={totalRevenue}
          shouldFormat
        />
        <DataCard
          label="Total Sales"
          value={totalSales}
        />
        {/* <DataCard
          label="Total Courses"
          value={totalCompletedCourses}
        />
        <DataCard
          label="Total Chapters"
          value={totalCompletedChapters}
        /> */}
      </div>
      <Chart
        data={data}
      />
      
      <div>
        <h2>Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Total Completed Chapters</th>
              <th>Total Chapters in Courses</th>
              <th>Course Completed</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry) => (
              <tr key={entry.userId}>
                <td>{String(entry.userId)}</td>
                <td>{String(entry.total_completed_chapters)}</td>
                <td>{String(entry.total_chapters_in_courses)}</td>
                <td>{String(entry.course_completed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 
export default AnalyticsPage;
