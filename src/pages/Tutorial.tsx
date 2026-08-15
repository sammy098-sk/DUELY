import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  User,
  Users,
  FilePlus,
  Send,
  BellRing,
  ArrowRight,
} from "lucide-react";

export default function TutorialPage() {
  const steps = [
    {
      step: 1,
      title: "Set up your business profile",
      description:
        "Add your business name, logo, signature, payment details and preferred currency.",
      icon: User,
      actionText: "Open Profile Settings",
      link: "/profile",
    },
    {
      step: 2,
      title: "Add a client",
      description:
        "Save your client's contact details so you don't have to enter them every time.",
      icon: Users,
      actionText: "Create Invoice & Client",
      link: "/invoices/new",
    },
    {
      step: 3,
      title: "Create your first invoice",
      description:
        "Use the AI invoice generator to create and review an invoice before sending it.",
      icon: FilePlus,
      actionText: "Build Invoice",
      link: "/invoices/new",
    },
    {
      step: 4,
      title: "Send the invoice",
      description:
        "Send it directly to your client and let Duely handle the follow-up.",
      icon: Send,
      actionText: "View Invoices",
      link: "/invoices",
    },
    {
      step: 5,
      title: "Let Duely chase payment",
      description:
        "Duely automatically sends follow-up reminders every 3 days until the invoice is paid.",
      icon: BellRing,
      actionText: null,
      link: null,
    },
  ];

  return (
    <AppShell pageTitle="Tutorial">
      <div className="flex-1 p-4 lg:p-8 bg-background">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Bar */}
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Tutorial
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Everything you need to start invoicing and getting paid with Duely.
            </p>
          </div>

          {/* Numbered Step Cards */}
          <div className="space-y-4">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-paper flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-border"
                >
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      {s.step}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-primary" />
                        <h2 className="font-serif text-base font-bold text-foreground">
                          {s.title}
                        </h2>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>

                  {s.link && s.actionText && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 text-xs font-semibold self-end sm:self-auto cursor-pointer"
                    >
                      <Link to={s.link}>
                        <span>{s.actionText}</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
