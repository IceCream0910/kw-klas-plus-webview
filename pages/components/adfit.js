import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const Adfit = () => {
    const [version, setVersion] = useState("");

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const version = userAgent.split('AndroidApp_v')[1];
        if (version) {
            setVersion(version.trim());
        } else {
            setVersion("알 수 없음");
        }

        if (!document.querySelector(".adfit1")?.querySelector("ins")) {
            const ins = document.createElement("ins");
            const scr = document.createElement("script");
            ins.className = "kakao_ad_area";
            ins.style.display = "none";
            ins.style.width = "100%";
            scr.async = true;
            scr.type = "text/javascript";
            scr.src = "https://t1.daumcdn.net/kas/static/ba.min.js";
            ins.setAttribute("data-ad-width", "320");
            ins.setAttribute("data-ad-height", "100");
            ins.setAttribute("data-ad-unit", "DAN-MlQ4i2b2KsKLj9hy");
            document.querySelector(".adfit1")?.appendChild(ins);
            document.querySelector(".adfit1")?.appendChild(scr);
        }
    }, []);

    return (
        <>
            <div className='adfit1' style={{ margin: '20px 0', position: 'relative' }}>
                <div
                    style={{
                        display: `${version == process.env.NEXT_PUBLIC_ANDROID_LATEST_VERSION ? 'none' : 'block'}`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 10,
                        backgroundColor: 'transparent'
                    }}
                    onClick={(e) => e.preventDefault()}
                />
            </div>
        </>
    );
};

export default Adfit;