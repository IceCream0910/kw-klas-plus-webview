import { useEffect, useState } from "react";
import IonIcon from "@reacticons/ionicons";
import Spacer from "../components/spacer";

function Header({ title }) {
    const [version, setVersion] = useState("");
    const [isCompatible, setIsCompatible] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const version = userAgent.split('AndroidApp_v')[1];
        if (version) {
            setVersion(version.trim());
        }
    }, []);

    useEffect(() => {
        if (!version) return;
        if (!version.includes('.') && version >= 21) {
            setIsCompatible(true);
        }
    }, [version]);

    useEffect(() => {
        console.log(isCompatible);
    }, [isCompatible]);

    if (!isCompatible && process.env.NEXT_PUBLIC_DEVELOPMENT !== 'true') return null;

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 'calc(100% - 40px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px 20px 20px',
                background: 'linear-gradient(to bottom, var(--background) 65%, transparent 100%)',
                zIndex: 1000
            }}>
                {title}
                <button style={{ width: 'fit-content' }} onClick={() => Android.openOptionsMenu()}>
                    <IonIcon name='ellipsis-vertical' style={{ fontSize: '20px', color: 'var(--text-color)', position: 'relative', top: '2px' }} />
                </button>
            </div>

            <Spacer y={50} />
        </>
    );

}

export default Header;