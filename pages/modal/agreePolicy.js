import { useState, useEffect } from "react";
import { KLAS } from "../../lib/klas";
import IonIcon from "@reacticons/ionicons";
import { motion } from "framer-motion";
import Spacer from "../components/spacer";

export default function IdCard() {
    return (
        <main>
            <h2 style={{ marginBottom: '20px', marginTop: '20px', marginBottom: 0 }}>변경된 개인정보 처리방침에<br />동의해주세요.</h2>
            <Spacer y={10} />
            <span style={{ opacity: .5, fontSize: '14px' }}>
                {process.env.NEXT_PUBLIC_LATEST_POLICY_DATE}에 개인정보 처리방침이 개정되었어요. 서비스 이용을 위해 다시 동의가 필요해요.
            </span>
            <Spacer y={10} />
            <span onClick={() => Android.openExternalPage("https://blog.yuntae.in/11cfc9b9-3eca-8078-96a0-c41c4ca9cb8f")}>개인정보 처리방침 전문 <IonIcon name="chevron-forward" style={{ position: 'relative', top: '2px' }} /></span>
            <Spacer y={20} />

            <div className="bottom-sheet" style={{ padding: 0, marginBottom: 0 }}>
                <button style={{ background: 'var(--button-background)', height: '50px' }} onClick={() => {
                    localStorage.setItem("policyAgreeDate", process.env.NEXT_PUBLIC_LATEST_POLICY_DATE);
                    Android.closeModal();
                }}>동의</button>
            </div>

            <style jsx global>{`
            body {
                background: transparent;
                padding: 0.3em 1.3em 1.3em 1.3em;
                margin:0;
                overflow: hidden;
                width: 90dvw;
            }
            `}
            </style>
        </main >
    );
}