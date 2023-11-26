/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react';
import useShowPremiumFeature from '@hooks/useShowPremiumFeature';

const ReleaseModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentReleaseVersion = '0.0.1'; // Update this value for each release
  const showPremiumFeature = useShowPremiumFeature();

  const setModalSeenFlag = version => {
    localStorage.setItem('modalSeenVersion', version);
  };

  const getModalSeenFlag = () => {
    return localStorage.getItem('modalSeenVersion');
  };

  const toggleModal = () => {
    if (isModalOpen) {
      setModalSeenFlag(currentReleaseVersion);
    }
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    // Simulate user login or page load
    // Replace this condition with your actual condition to check if the user should see the modal
    if (getModalSeenFlag() !== currentReleaseVersion) {
      toggleModal();
    }
  }, []);

  return (
    <>
      {isModalOpen && showPremiumFeature && (
        <div className="fixed inset-0 z-50 ml-[200px] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="relative w-auto max-w-4xl mx-auto">
            <div className="relative flex flex-col w-full bg-white rounded-lg border border-gray-500/10 shadow-lg">
              <div className="flex items-center justify-center p-5 border-b border-solid rounded-t">
                <h3 className="text-lg text-indigo-600 font-semibold">
                  New in Isaac: Upload your own Documents & Library Chat 🥳🥳{' '}
                </h3>
              </div>
              <div className="relative p-6 flex-auto">
                {/* Add the list of updates and new features here */}
                <p className="mb-4 prose text-lg leading-relaxed text-gray-600">
                  You can now upload your own PDF documents to Isaac. For this, we added a new sub-folder to each
                  project called &quot;Library&quot;. To upload a new PDF, simply click on the &quot;+&quot; sign next
                  to the &quot;Library&quot; folder. Click on the document to view it in our brand new PDF reader.
                </p>
                <div className="flex gap-4">
                  <img alt="library_tutorial" className="rounded-md shadow-md h-36" src="/library_tutorial.png" />
                  <img alt="chat_tutorial" className="rounded-md shadow-md h-36" src="/chat_tutorial.png" />
                </div>
                <p className="mt-4 prose text-lg leading-relaxed text-gray-600">
                  {' '}
                  Below the chat there is now a switch that says &quot;Library Mode&quot;.Activating &quot;Library
                  Mode&quot;,enables Isaac to search your documents for answers. <br />
                  <br /> Remember, your uploaded documents are specific to each project. As a result, Isaac will only
                  access the documents from the currently selected project.
                </p>
              </div>
              <div className="flex items-center justify-end p-6 rounded-b">
                <button
                  className="bg-indigo-600 text-sm font-semibold hover:bg-indigo-700 rounded-md py-2 px-4 text-white inline-flex gap-2 items-center"
                  type="button"
                  onClick={toggleModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReleaseModal;
