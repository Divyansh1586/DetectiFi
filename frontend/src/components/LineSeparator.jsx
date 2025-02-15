const LineSeparator = () => {
    return (
      <div className="flex items-center justify-center w-full gap-4 px-10">
        <div className="h-0.5 bg-gray-400 flex-1">
          <div className="w-full h-full bg-gray-400" style={{ 
            transform: 'matrix(1, 0, 0, 1, 0, 0)',
            borderRadius: '9999px' 
          }}></div>
        </div>
        
        <div className="text-gray-400 text-2xl font-bold flex-shrink-0">×</div>
        
        <div className="h-0.5 bg-gray-400 flex-1">
          <div className="w-full h-full bg-gray-400" style={{ 
            transform: 'matrix(1, 0, 0, 1, 0, 0)',
            borderRadius: '9999px' 
          }}></div>
        </div>
      </div>
    );
  };
  
  export default LineSeparator;