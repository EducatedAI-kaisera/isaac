import { useEffect, useRef, useState } from 'react';

function useAutoSaveDocument(document, editorStateRef, updateDocumentFunction) {
  const intervalId = useRef(null);
  const [previousContent, setPreviousContent] = useState(null);

  useEffect(() => {
    // Only run if a document is selected
    if (!document) return;

    const hasContentChanged = () => {
      const currentContent = JSON.stringify(editorStateRef.current);
      return currentContent !== previousContent;
    };

    const saveDocument = () => {
      const content = JSON.stringify(editorStateRef.current);
      setPreviousContent(content);
      updateDocumentFunction({ content, id: document.id });
    };

    const autoSave = () => {
      if (hasContentChanged()) {
        saveDocument();
      }
    };

    intervalId.current = setInterval(autoSave, 7000);

    return () => clearInterval(intervalId.current);
  }, [document, editorStateRef, updateDocumentFunction, previousContent]);
}

export default useAutoSaveDocument;
