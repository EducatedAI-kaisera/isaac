import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

type UploadState = string | null;

const useUploadParam = (): UploadState => {
  const router = useRouter();
  const [upload, setUpload] = useState<UploadState>(null);

  useEffect(() => {
    const { query = {} } = router;
    const { upload: uploadID } = query;

    if (uploadID) {
      setUpload(uploadID as string);
    } else {
      setUpload(null);
    }
  }, [router]);

  return upload;
};

export default useUploadParam;
