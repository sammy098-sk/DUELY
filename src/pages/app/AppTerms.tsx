import { AppShell } from "@/components/AppShell";
import { TermsContent } from "@/components/contents/TermsContent";

export default function AppTermsPage() {
  return (
    <AppShell pageTitle="Terms of Use">
      <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-4xl mx-auto font-sans bg-background">
        <TermsContent />
      </div>
    </AppShell>
  );
}
