import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Frontend Test</h1>
      <p className="mb-4">If you can see this, the frontend is working correctly!</p>
      <div className="bg-blue-100 p-4 rounded-lg">
        <p>This is a test component to verify React and TypeScript integration.</p>
      </div>
    </div>
  );
};

export default TestComponent;
