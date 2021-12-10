import React, { useState } from 'react';
import { NavInlineButton } from './MapButtons';
import { useViewport } from '../contexts/ViewportContext';
import { share } from '../config/svg';
import { useSelector } from 'react-redux';
import { getURLParams } from '../utils';

export default function ShareButton() {
  const viewport = useViewport();
  const currentData = useSelector((state) => state.currentData);
  const mapParams = useSelector((state) => state.mapParams);
  const dataParams = useSelector((state) => state.dataParams);

  const [shared, setShared] = useState(false);

  const handleShare = async (params) => {
    const shareData = {
      title: 'The US Covid Atlas',
      text: 'Near Real-Time Exploration of the COVID-19 Pandemic.',
      url: `${window.location.href.split('?')[0]}${getURLParams(params)}`,
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      let copyText = document.querySelector('#share-url');
      copyText.value = `${shareData.url}`;
      copyText.style.display = 'block';
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      document.execCommand('copy');
      copyText.style.display = 'none';
      setShared(true);
      setTimeout(() => setShared(false), 5000);
    }
  };

  return (
    <NavInlineButton
      title="Share this Map"
      id="shareButton"
      shareNotification={shared}
      onClick={() =>
        handleShare({
          mapParams,
          dataParams,
          currentData,
          coords: viewport,
          dateIndex: dataParams.nIndex,
        })
      }
    >
      {share}
    </NavInlineButton>
  );
}
