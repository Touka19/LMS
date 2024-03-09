"use client";

import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, Save, Video } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter } from "@prisma/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          "https://gdapi.viatg.workers.dev/listFilesInFolder.aspx?folderId=1y8bnKjngGHhNknAfSL3151nNYrHUGFWv"
        );
        setFiles(response.data.files);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async () => {
    try {
      // Patching the chapter with videoUrl
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        { videoUrl }
      );
      toast.success("Chapter updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const fileId = event.target.value;
    setSelectedFile(fileId);
    try {
      const response = await axios.get(
        `https://gdapi.viatg.workers.dev/generate.aspx?id=${fileId}`
      );
      setVideoUrl(response.data.link);
    } catch (error) {
      console.error("Error fetching video URL:", error);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          ) : !initialData.videoUrl ? (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </div>
      {!isEditing && !initialData.videoUrl && (
        <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
          No video selected
        </div>
      )}
      {!isEditing && initialData.videoUrl && (
        <div>
          <VideoDisplay selectedFile={initialData.videoUrl} />
        </div>
      )}
      {isEditing && (
        <div>
          <select onChange={handleFileSelect} value={selectedFile}>
            <option value="">Select a video</option>
            {files.map((file) => (
              <option key={file.id} value={file.id}>
                {file.name}
              </option>
            ))}
          </select>
          {videoUrl && <VideoDisplay selectedFile={videoUrl} />}
        </div>
      )}
      {initialData.videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process. Refresh the page if video
          does not appear.
        </div>
      )}
      {isEditing && (
        <Button onClick={onSubmit} variant="success">
          Save
        </Button>
      )}
    </div>
  );
};

interface VideoDisplayProps {
  selectedFile: string;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ selectedFile }) => {
  return (
    <div>
      <video controls>
        <source src={selectedFile} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
