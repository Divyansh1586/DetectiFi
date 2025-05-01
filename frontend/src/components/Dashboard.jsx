import { useCallback, useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import profile from "../assets/profile.png";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [result, setResult] = useState("No results to display yet. Upload and process images to see analysis.");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      console.log("User from localStorage:", storedUser);
      setUser(storedUser);
    }

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    ]);
  }, []);

  const removeImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error("Please select an image first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", files[0]);
  
    fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.analysis) {
          setResult(`Analysis:\n${data.analysis}`);
          toast.success("Analysis successful!");
        } else {
          toast.error(data.error || "Analysis failed.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Upload failed. Please try again.");
      });
  };
  
  


  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold">Crime Scene Analysis Dashboard</h1>

        {/* Profile Image + Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <img
              src={profile}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 hover:border-red-600"
              onClick={() => setDropdownOpen((prev) => !prev)}
            />

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md py-2 z-50">
                <div className="px-4 py-3 text-sm text-gray-800 border-b">
                  {user.name || "No Name Found"}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Space between Title and Upload Section */}
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto mt-10">
        <div className="w-full md:w-1/2 p-6 border rounded-lg bg-white shadow-md">
          <h2 className="font-semibold text-lg mb-4">Upload Images</h2>
          <div
            {...getRootProps({
              className:
                "border-dashed border-2 p-6 text-center cursor-pointer rounded-md bg-gray-50 hover:border-red-400",
            })}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              Drag 'n' drop some files here, or click to select files
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            {files.map((file, index) => (
              <div key={file.name} className="relative">
                <img
                  src={file.preview}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  onClick={() => removeImage(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 border rounded-lg bg-white shadow-md">
          <h2 className="font-semibold text-lg mb-4">Analysis Results</h2>
          <p className="text-gray-700 whitespace-pre-line">{result}</p>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <Button
          onClick={handleUpload}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
        >
          Upload Images
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
