import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <div className="w-4 h-4 bg-primary-foreground rounded-sm transform rotate-45"></div>
        </div>
        <span className="text-foreground font-semibold text-xl">PLAMENTO</span>
      </div>
      <div className="spinner"></div>
      <p className="text-muted-foreground">Loading, please wait...</p>
    </div>
  );
};

export default LoadingScreen;
