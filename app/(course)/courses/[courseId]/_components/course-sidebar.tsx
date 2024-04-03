import { auth } from "@clerk/nextjs";
import { Chapter, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseProgress } from "@/components/course-progress";

import { CourseSidebarItem } from "./course-sidebar-item";

type UserProgressType = { userProgress: UserProgress[] | null } | null;
type ChapterType = Chapter & UserProgressType;

interface CourseSidebarProps {
  course: Course & {
    chapters: ChapterType[];
  };
  progressCount: number;
}

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const { userId } = auth();
  // const total = course.chapters.length;

  // const lastActiveIndex = Math.round(total / (progressCount * 0.01));
  // const index = lastActiveIndex === 0 ? 0 :
  const isPreviousCompleted = (chapters: ChapterType[], index: number) => {
    if (index < 1) {
      return true;
    } else if (!!chapters[index - 1].userProgress?.[0]?.isCompleted) {
      return true;
    } else {
      false;
    }
  };

  const purchase = userId
    ? await db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      })
    : null;

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter, index) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter?.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={
              (!chapter.isFree && !purchase) ||
              !isPreviousCompleted(course.chapters, index)
            }
          />
        ))}
      </div>
    </div>
  );
};