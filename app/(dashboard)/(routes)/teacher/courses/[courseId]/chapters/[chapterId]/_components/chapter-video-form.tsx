"use client";

import * as z from "zod";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter } from "@prisma/client";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

interface ChapterVideoFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialData.videoUrl || null);
  const [fileList, setFileList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (initialData.videoUrl) {
      setVideoUrl(initialData.videoUrl);
    }
  }, [initialData.videoUrl]);

  const toggleEdit = () => setIsEditing((current) => !current);

  const fetchFiles = async () => {
    try {
      const response = await axios.get("https://gdapi.viatg.workers.dev/listFilesInFolder.aspx?folderId=1y8bnKjngGHhNknAfSL3151nNYrHUGFWv");
      setFileList(response.data.files || []); // Initialize with empty array if response.data.files is null
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const selectVideo = (fileId: string) => {
    setVideoUrl(fileId);
  };

  const onSubmit = async () => {
    try {
      console.log("Video URL:", videoUrl); 
      // await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, videoUrl);
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, { videoUrl });
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !videoUrl && (
            <>
              {/* Remove <Pencil> icon */}
              Add a video
            </>
          )}
          {!isEditing && videoUrl && (
            <>
              {/* Remove <Pencil> icon */}
              Edit video
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div>
          {videoUrl ? (
            <video controls className="w-full">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
              <Video className="h-10 w-10 text-slate-500" />
            </div>
          )}
        </div>
      )}
      {isEditing && (
        <div>
          <select
            className="block w-full p-2 border rounded-md"
            value={videoUrl || ""}
            onChange={(e) => selectVideo(e.target.value)}
          >
            <option value="">Select a video</option>
            {fileList.map((file) => (
              <option key={file.id} value={file.id}>
                {file.name}
              </option>
            ))}
          </select>
          <div className="text-xs text-muted-foreground mt-4">
            Choose a video from the list
          </div>
        </div>
      )}
      {videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process. Refresh the page if the video does not appear.
        </div>
      )}
      {isEditing && (
        <div className="mt-4">
          <Button onClick={onSubmit}>Save</Button>
        </div>
      )}
    </div>
  );
};
