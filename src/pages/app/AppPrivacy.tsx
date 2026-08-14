import { AppShell } from "@/components/AppShell";
import { PrivacyContent } from "@/components/contents/PrivacyContent";

export default function AppPrivacyPage() {
  return (
    <AppShell pageTitle="Privacy Policy">
      <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-4xl mx-auto font-sans bg-background">
        <PrivacyContent />
      </div>
    </AppShell>
  );
}
