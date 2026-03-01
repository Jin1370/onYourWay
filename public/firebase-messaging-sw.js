//브라우저 백그라운드에서 브라우저가 꺼져있어도 알림 받을 수 있게 해줌(서비스 워커)

importScripts(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
    apiKey: "AIzaSyD9T16G6IOQyM6Pu33cV8xzrqR6JyRt5zY",
    authDomain: "onyourway-18dd2.firebaseapp.com",
    projectId: "onyourway-18dd2",
    messagingSenderId: "469664929655",
    appId: "1:469664929655:web:1d4ba45da256556b6a7372",
});

const messaging = firebase.messaging();

//background 메시지 오면 알림
messaging.onBackgroundMessage(function (payload) {
    console.log("백그라운드 메시지 수신", payload);
    const notificationTitle = payload.data.title || "기본 제목";
    const notificationOptions = {
        body: payload.data.body || "내용이 없습니다.",
        icon: payload.data.icon || "/default-icon.png",
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
