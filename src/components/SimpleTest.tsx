
import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Website is Working!</h1>
      <p>If you can see this, the basic React app is functioning.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default SimpleTest;
