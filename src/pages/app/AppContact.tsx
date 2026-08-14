import { AppShell } from "@/components/AppShell";
import { ContactContent } from "@/components/contents/ContactContent";

export default function AppContactPage() {
  return (
    <AppShell pageTitle="Contact Us">
      <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-4xl mx-auto font-sans bg-background">
        <ContactContent />
      </div>
    </AppShell>
  );
}
