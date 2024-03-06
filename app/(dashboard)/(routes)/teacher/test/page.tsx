// pages/index.tsx

'use client'; // Add the use client directive

import { NextPage } from 'next';
import React from 'react';

const HomePage: NextPage = () => {
  const [files, setFiles] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://gdapi.viatg.workers.dev/listFilesInFolder.aspx?folderId=1y8bnKjngGHhNknAfSL3151nNYrHUGFWv');
        const data = await response.json();
        setFiles(data.files);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Welcome to Next.js!</h1>
      <p>This is a simple Next.js page.</p>
      <h2>List of Files:</h2>
      <ul>
        {files.map((file: any) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;