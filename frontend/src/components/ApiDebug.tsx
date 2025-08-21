import React from 'react';
import { API_URL, getEnvironmentInfo } from '../config/api';

const ApiDebug: React.FC = () => {
  const envInfo = getEnvironmentInfo();
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#000',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>API Debug Info:</strong></div>
      <div>API URL: {API_URL}</div>
      <div>Environment: {envInfo.env}</div>
      <div>REACT_APP_API_URL: {process.env.REACT_APP_API_URL}</div>
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
    </div>
  );
};

export default ApiDebug;