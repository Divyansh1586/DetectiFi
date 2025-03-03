import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CrimeSceneDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [user, setUser] = useState(null);
  // const navigate = useNavigate();
  useEffect(() => {
    // Get user details from localStorage after login
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove authentication token
    localStorage.removeItem("user"); // Remove user details
    setUser(null); // Clear user state
    window.location.href = "/login"; // Redirect to login page
    // navigate("/login");

  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setUploadedFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with User Profile */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Crime Scene Analysis Dashboard</h1>

        {/* User Profile Section */}
        {user ? (
          <div className="flex items-center space-x-4">
            <img
              src={user.picture || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div className="text-gray-800">
              <p className="font-semibold">{user.username}</p>
              <button onClick={handleLogout} className="text-red-500 text-sm underline">Logout</button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Loading user...</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="border rounded-lg shadow-md">
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition"
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-600">Drag & drop some files here, or click to select files</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {uploadedFiles.map((file, index) => (
                  <img key={index} src={file.preview} alt="Uploaded preview" className="w-20 h-20 rounded object-cover" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className="border rounded-lg shadow-md">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No results to display yet. Upload and process images to see analysis.</p>
            <Button className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white">Process Images</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
