import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";

const FileUploadArea = ({ 
  processingType, 
  onFilesSelected, 
  selectedFiles, 
  onRemoveFile, 
  onProcess, 
  isLoading, 
  isWebcamActive 
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesSelected, // Pass all accepted files to the handler
    accept: processingType === "image" 
            ? { 'image/*': [] } 
            : { 'video/*': ['.mp4', '.mov', '.avi', '.mkv'] }, // Be more specific for videos if needed
    multiple: true, // Allow multiple files for both image and video types in dropzone
  });

  return (
    <div className="p-6 border rounded-lg bg-white shadow-md mb-6">
      <h2 className="font-semibold text-xl mb-4 text-gray-700">
        Upload {processingType === "image" ? "Images" : "Videos"}
      </h2>
      <div
        {...getRootProps({
          className: `border-dashed border-2 p-6 text-center cursor-pointer rounded-md bg-gray-50 hover:border-red-400 transition-colors duration-150 ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300'}`
        })}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive 
            ? `Drop the ${processingType}(s) here ...` 
            : `Drag 'n' drop ${processingType === 'image' ? 'some image files' : 'video file(s)'} here, or click to select`}
        </p>
        {/* Message about multiple files can be generic now or removed */}
         <p className="text-sm text-gray-500 mt-1">Multiple files can be selected.</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2">Selected file(s):</h3>
          <div className="flex flex-wrap gap-4">
            {selectedFiles.map((file, index) => (
              <div key={file.name + index} className="relative group">
                {file.type.startsWith("image/") ? (
                  <img
                    src={file.preview}
                    alt={`preview ${file.name}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    onLoad={() => URL.revokeObjectURL(file.preview)} // Clean up for memory efficiency
                  />
                ) : (
                  <div className="w-24 h-24 flex flex-col items-center justify-center bg-gray-200 rounded-lg border border-gray-300 p-2">
                    <span className="text-xs text-gray-600 truncate w-full text-center">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
                <button
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md"
                  onClick={(e) => { 
                    e.stopPropagation(); // Prevent triggering dropzone
                    onRemoveFile(index); 
                  }}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <Button
        onClick={onProcess}
        disabled={isLoading || selectedFiles.length === 0 || isWebcamActive}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 disabled:opacity-50"
      >
        {isLoading 
          ? `Processing ${processingType}...` 
          : `Process ${selectedFiles.length} ${processingType === 'image' ? (selectedFiles.length > 1 ? 'Images' : 'Image') : (selectedFiles.length > 1 ? 'Videos' : 'Video')} with FastAPI`}
      </Button>
    </div>
  );
};

export default FileUploadArea; 