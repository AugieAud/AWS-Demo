"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadURL, setUploadURL] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!file) return alert("Please select a file");

      console.log("Attempting to upload file:", file.name);

      // Step 1: Request a signed URL from API Gateway
      console.log("Requesting signed URL...");
      const { data } = await axios.post(
        "https://21hodsnpf6.execute-api.ap-southeast-2.amazonaws.com/dev/generate-upload-erl",
        {
          fileName: file.name,
          fileType: file.type,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5 second timeout
        }
      );

      console.log("Received signed URL:", data.uploadURL);
      setUploadURL(data.uploadURL);

      // Step 2: Upload the file to S3
      console.log("Attempting to upload to S3...");
      await axios.put(data.uploadURL, file, {
        headers: {
          "Content-Type": file.type,
        },
        timeout: 10000, // 10 second timeout
      });

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error details:", {
        name: error instanceof Error ? error.name : "Unknown error",
        message: error instanceof Error ? error.message : String(error),
        config: axios.isAxiosError(error) ? error.config : undefined,
        code: axios.isAxiosError(error) ? error.code : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response
          ? `Upload failed: ${error.response.status} - ${error.response.statusText}`
          : `Upload failed: ${error.message} (${error.code})`;
        alert(errorMessage);
      } else {
        alert("An unexpected error occurred during upload");
      }
    }
  };
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold">Upload an Image</h1>
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="mt-2 p-2 bg-blue-500 text-white"
      >
        Upload
      </button>
    </div>
  );
}
