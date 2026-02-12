import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

//cookie: 웹사이트를 방문했을 때 만들어진 정보를 저장하는 파일
//iron session이 nextjs로부터 오는 쿠키를 받아서 carrot-market라는 쿠키가 존재하는지 검사.
//존재하지 않으면 새로 만들고, 존재하면 비밀번호를 이용해서 내용을 복호화
interface SessionContent {
    id?: number;
}
export default async function getSession() {
    return await getIronSession<SessionContent>(await cookies(), {
        cookieName: "carrot-market",
        password: process.env.COOKIE_PASSWORD!, // !: null 또는 undefined가 아니라고 알려주는 역할
    });
}

export async function logIn(id: any) {
    const session = await getSession();
    session.id = id; //쿠키 내용 수정
    await session.save(); //쿠키 저장
}
