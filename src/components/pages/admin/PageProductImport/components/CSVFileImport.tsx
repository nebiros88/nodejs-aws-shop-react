import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';
// Buffer from Node.js is not available by default in the browser
import { Buffer as BufferPolyfill } from 'buffer';

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | null>();

  // place token into localStorage on component onMount and remove it on component destroy
  // React.useEffect(() => {
  //   const userLogin = import.meta.env.VITE_AUTH_LOGIN;
  //   const userPassword = import.meta.env.VITE_AUTH_PASSWORD;
  //   const token = `${userLogin}:${userPassword}`;
  //   const encodedToken = BufferPolyfill.from(token, 'utf-8').toString('base64');

  //   localStorage.setItem('authorization_token', encodedToken);

  //   return () => {
  //     localStorage.removeItem('authorization_token');
  //   };
  // }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log('uploadFile to', url);

    if (!file) {
      console.log('Please select a file to import!');
      return;
    }

    // Get the presigned URL
    const response = await axios({
      method: 'GET',
      url,
      params: {
        name: encodeURIComponent(file.name),
      },
      headers: {
        Authorization: `Basic ${localStorage.getItem('authorization_token')}`,
      },
    });

    console.log('File to upload: ', file.name);
    console.log('Uploading to: ', response.data);
    const result = await fetch(response.data, {
      method: 'PUT',
      body: file,
    });
    console.log('Result: ', result);
    setFile(null);
  };
  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
      >
        {title}
      </Typography>
      {!file ? (
        <input
          type="file"
          onChange={onFileChange}
        />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
