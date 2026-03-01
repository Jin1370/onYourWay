//서버에서 푸시를 보내기 위한 설정

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const firebaseAdminConfig = {
    credential: cert({
        //자격
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
};

const app = getApps().length
    ? getApps()[0]
    : initializeApp(firebaseAdminConfig);

export const messaging = getMessaging(app);
