import { useState } from 'react';

const Orders = () => {
    let accessToken = localStorage.getItem('accessToken');
    const [purpose, setPurpose] = useState('');
  const [name, setName] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handlePurposeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPurpose(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);

        // Validate each file
        const validFiles = files.filter((file) => {
          // Check file type
          if (!file.type.startsWith('image/')) {
            setMessage(`File ${file.name} is not an image.`);
            return false;
          }
  
          // Check file size (5MB limit)
          if (file.size > 5 * 1024 * 1024) {
            setMessage(`File ${file.name} exceeds the 5MB size limit.`);
            return false;
          }
  
          return true;
        });
  
        setImages(validFiles);
  
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      setMessage('Please select at least one image');
      return;
    }

    const formData = new FormData();
    formData.append('purpose', purpose);
    formData.append('name', name);
    images.forEach((image) => {
      formData.append('images', image);
    });

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
    });

    // Handle upload completion
    xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            const uploadedFileNames = JSON.parse(xhr.responseText); // Get uploaded file names
            setUploadedFiles(uploadedFileNames); // Update state with uploaded file names
            setMessage('Files uploaded successfully');
        } else {
          setMessage('Failed to upload files');
        }
        setUploadProgress(0); // Reset progress
    });

    // Handle upload errors
    xhr.addEventListener('error', () => {
        setMessage('Failed to upload files');
        setUploadProgress(0); // Reset progress
      });
  
    // Open and send the request
    xhr.open('POST', 'http://localhost:8010/uploadto');
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.send(formData);
  };

  return (
    <div>
      <h2>Upload Files</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Purpose:</label>
          <input type="text" value={purpose} onChange={handlePurposeChange} />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={handleNameChange} />
        </div>
        <div>
          <label>Images:</label>
          <input type="file" multiple onChange={handleImageChange} />
        </div>
        <button type="submit">Upload</button>
      </form>
      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
        <div
          style={{
            width: `${uploadProgress}%`,
            height: '10px',
            backgroundColor: '#76c7c0',
            borderRadius: '5px',
          }}
        ></div>
      </div>
      )}

        {uploadedFiles.length > 0 && (
        <div>
            <h3>Uploaded Files:</h3>
            <ul>
            {uploadedFiles.map((file, index) => (
                <li key={index}>
                <img
                    src={`http://localhost:8010/uploads/${file}`} // Display the image
                    alt={file}
                    style={{ width: '100px', height: 'auto' }}
                />
                <span>{file}</span>
                </li>
            ))}
            </ul>
        </div>
        )}


      {message && <p>{message}</p>}
    </div>
  );
};

export default Orders;