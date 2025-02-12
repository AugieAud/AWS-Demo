import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadURL, setUploadURL] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    // Step 1: Request a signed URL from API Gateway
    const { data } = await axios.post(
      "https://21hodsnpf6.execute-api.ap-southeast-2.amazonaws.com/dev/generate-upload-erl",
      {
        fileName: file.name,
        fileType: file.type,
      }
    );

    setUploadURL(data.uploadURL);

    // Step 2: Upload the file to S3
    await axios.put(data.uploadURL, file, {
      headers: { "Content-Type": file.type },
    });

    alert("File uploaded successfully!");
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
