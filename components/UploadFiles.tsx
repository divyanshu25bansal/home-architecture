import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import {
  PROGRESS_INCREMENT,
  REDIRECT_DELAY_MS,
  PROGRESS_INTERVAL_MS,
} from "./lib/constant";

const UploadFiles = ({
  onComplete,
}: {
  onComplete: (data: string) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { isSignedIn } = useOutletContext<AuthContext>();
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && ALLOWED_FILE_TYPES.includes(files[0].type)) {
      setFile(files[0]);
      processFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onerror = () => {
      setFile(null);
      setProgress(0);
    };

    reader.onload = () => {
      const base64 = reader.result as string;
      let currentProgress = 0;
      setProgress(0);
      intervalRef.current = setInterval(() => {
        currentProgress += PROGRESS_INCREMENT;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(intervalRef.current!); // ! it means it is not null, we are sure of that
          timeoutRef.current = setTimeout(() => {
            onComplete(base64);
          }, REDIRECT_DELAY_MS);
        }
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
        if(intervalRef.current) clearInterval(intervalRef.current);
        if(timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <div className={"upload"}>
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type={"file"}
            className={"drop-input"}
            accept={".jpg,.png,.jpeg"}
            disabled={!isSignedIn}
            onChange={handleChange}
          />
          <div className={"drop-content"}>
            <div className={"drop-icon"}>
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or just drag and drop"
                : "Sign in or sign up with Puter to upload"}
            </p>
            <p className={"help"}>Maximum file size 10 MB.</p>
          </div>
        </div>
      ) : (
        <div className={"upload-status"}>
          <div className={"status-content"}>
            <div className={"status-icon"}>
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className={"image"} />
              )}
            </div>
            <h3>{file.name}</h3>
            <div className={"progress"}>
              <div className={`bar`} style={{ width: `${progress}%` }}></div>
              <p className={"status-text"}>
                {progress < 100 ? "Analyzing floor plan..." : "Redirecting..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFiles;
