export function formatToTimeAgo(date: string): string {
    const formatter = new Intl.RelativeTimeFormat("ko");
    const diff = new Date(date).getTime() - new Date().getTime();

    const minInMs = 1000 * 60;
    const hourInMs = minInMs * 60;
    const dayInMs = hourInMs * 24;

    // 전체 차이값을 각 단위로 나눈 뒤 반올림/버림 처리
    const diffInDays = Math.round(diff / dayInMs);
    const diffInHours = Math.round(diff / hourInMs);
    const diffInMinutes = Math.round(diff / minInMs);

    if (Math.abs(diffInDays) >= 1) {
        return formatter.format(diffInDays, "days");
    } else if (Math.abs(diffInHours) >= 1) {
        return formatter.format(diffInHours, "hours");
    } else {
        return formatter.format(diffInMinutes, "minutes");
    }
}

export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function formatToWon(price: number): string {
    return price.toLocaleString("ko-KR") + "원";
}
