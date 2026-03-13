import TabBar from "@/components/tab-bar";
import TabPageTitle from "@/components/tab-page-title";

export default function TabLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <TabPageTitle />
            {children}
            <TabBar />
        </div>
    );
}
