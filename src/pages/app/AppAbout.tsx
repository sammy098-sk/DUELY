import { AppShell } from "@/components/AppShell";
import { AboutContent } from "@/components/contents/AboutContent";

export default function AppAboutPage() {
  return (
    <AppShell pageTitle="About Duely">
      <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-4xl mx-auto font-sans bg-background">
        <AboutContent />
      </div>
    </AppShell>
  );
}
