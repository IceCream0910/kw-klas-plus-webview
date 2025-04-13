import { useEffect } from 'react';

const AdSense = ({ adClient, adSlot, format = "auto", responsive = "true" }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error", e);
        }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={{ display: "block", minWidth: '400px' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
        ></ins>
    );
};

export default AdSense;