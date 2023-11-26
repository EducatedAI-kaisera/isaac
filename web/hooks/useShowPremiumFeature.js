import { useState, useEffect } from 'react';
import { useUser } from '@context/user';

const useShowPremiumFeature = () => {
  const { user } = useUser();
  const [showFeature, setShowFeature] = useState(false);

  useEffect(() => {
    const targetTimestamp = new Date('2023-04-19T01:47:04.759674Z');
    const conditionMet = user?.plan !== 'Researcher' && new Date(user?.created_at) > targetTimestamp;

    setShowFeature(!conditionMet);
  }, [user]);

  return showFeature;
};

export default useShowPremiumFeature;
