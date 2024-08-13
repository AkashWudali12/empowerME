import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="spinner">
        <style jsx>{`
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #09f;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
      <p className="text-muted-foreground text-center">
        Please wait, this could take a few minutes...
      </p>
    </div>
  );
};
