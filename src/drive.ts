export class DriveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DriveError';
  }
}

async function getOrCreateAppFolder(accessToken: string): Promise<string> {
  const q = encodeURIComponent(`name="Bhej App Files" and mimeType="application/vnd.google-apps.folder" and trashed=false`);
  const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const listData = await listRes.json();

  if (listData.files && listData.files.length > 0) {
    return listData.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Bhej App Files',
      mimeType: 'application/vnd.google-apps.folder',
    })
  });
  const createData = await createRes.json();
  return createData.id;
}

export async function uploadFileToDrive(file: File, accessToken: string): Promise<{ fileId: string, downloadUrl: string }> {
  try {
    const folderId = await getOrCreateAppFolder(accessToken);

    // 1. Create file metadata
    const metadataRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: file.name,
        parents: [folderId],
      })
    });
    
    if (!metadataRes.ok) {
      throw new Error(`Failed to create file metadata: ${await metadataRes.text()}`);
    }
    
    const createdFile = await metadataRes.json();
    const fileId = createdFile.id;

    // 2. Upload file content
    const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,webContentLink,webViewLink`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file
    });
    
    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Upload error response:", errorText);
      throw new Error(`Upload failed: ${uploadRes.statusText}. Details: ${errorText}`);
    }
    
    const uploadData = await uploadRes.json();

    // Grant public read permission so receiver can download without OAuth of sender
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      })
    });

    return {
      fileId,
      downloadUrl: uploadData.webContentLink || `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    };
  } catch (err: any) {
    console.error('Drive upload error:', err);
    throw new DriveError(err.message || 'Failed to upload file to Google Drive');
  }
}

export async function deleteDriveFile(fileId: string, accessToken: string): Promise<void> {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete file: ${res.statusText}`);
    }
  } catch (err) {
    console.error("Error deleting drive file", err);
  }
}
