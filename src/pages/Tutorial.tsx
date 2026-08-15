import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useTheme } from "@/hooks/useTheme";
import { DuelyFooter } from "@/components/DuelyFooter";
import {
  Building2,
  UserRound,
  FileText,
  BellRing,
  TrendingUp,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface StepData {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  link?: string;
  linkLabel?: string;
  numberLeft: boolean;
}

const tutorialSteps: StepData[] = [
  {
    number: "01",
    title: "Set up your profile",
    description:
      "Add your business name, logo, signature, and payment details. This information appears on every invoice you send.",
    icon: Building2,
    link: "/profile",
    linkLabel: "Go to Profile",
    numberLeft: true,
  },
  {
    number: "02",
    title: "Add your first client",
    description:
      "Save their name, email, and WhatsApp number so Duely knows exactly who to remind — and how to reach them.",
    icon: UserRound,
    link: "/invoices/new",
    linkLabel: "Add a client",
    numberLeft: false,
  },
  {
    number: "03",
    title: "Create an invoice",
    description:
      "Describe it in plain language or fill in the details yourself. Duely handles the formatting, numbering, and totals.",
    icon: FileText,
    link: "/invoices/new",
    linkLabel: "Create invoice",
    numberLeft: true,
  },
  {
    number: "04",
    title: "Sit back — reminders are automatic",
    description:
      "Every 3 days, Duely checks unpaid invoices and sends a reminder by email and WhatsApp, with the tone escalating the longer an invoice remains unpaid.",
    icon: BellRing,
    numberLeft: false,
  },
  {
    number: "05",
    title: "Get paid, stay on top of it",
    description:
      "Mark invoices as paid as money comes in, and watch your Dashboard track outstanding, overdue, and collected totals in real time.",
    icon: TrendingUp,
    link: "/dashboard",
    linkLabel: "Open Dashboard",
    numberLeft: true,
  },
];

export default function TutorialPage() {
  const { resolvedTheme } = useTheme();

  return (
    <AppShell pageTitle="Tutorial">
      <div className="flex-1 p-6 lg:p-12 bg-background flex flex-col justify-between">
        <div className="mx-auto max-w-5xl space-y-4 w-full">
          {/* Editorial Page Header */}
          <div className="text-center max-w-2xl mx-auto pt-4 pb-8 space-y-3">
            <span className="label-caps font-bold text-xs tracking-widest text-emerald-600 dark:text-emerald-400">
              GETTING STARTED
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              How Duely works
            </h1>
            <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
              From setting up your business to getting paid, here&apos;s everything you need to get the most out of Duely.
            </p>
          </div>

          {/* Editorial Step Sections */}
          <div className="divide-y divide-border/40">
            {tutorialSteps.map((step) => (
              <TutorialStepItem key={step.number} step={step} />
            ))}
          </div>

          {/* Shared Authenticated DuelyFooter */}
          <div className="pt-8">
            <DuelyFooter isDark={resolvedTheme === "dark"} context="authenticated" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TutorialStepItem({ step }: { step: StepData }) {
  const Icon = step.icon;
  const isNumberLeft = step.numberLeft;

  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 lg:gap-16">
        {/* Number Block */}
        <div
          className={`relative flex items-center justify-start ${
            isNumberLeft ? "md:order-1 md:justify-start" : "md:order-2 md:justify-end"
          }`}
        >
          {/* Subtle Background Icon */}
          <Icon
            aria-hidden="true"
            className="absolute size-28 sm:size-36 lg:size-44 text-muted-foreground/10 pointer-events-none select-none -z-10"
          />

          {/* Oversized Gradient Number */}
          <span className="font-serif text-7xl sm:text-8xl lg:text-[10rem] font-extrabold tracking-tighter leading-none select-none bg-gradient-to-br from-emerald-500 via-emerald-600 to-foreground dark:from-emerald-400 dark:via-emerald-500 dark:to-foreground bg-clip-text text-transparent">
            {step.number}
          </span>
        </div>

        {/* Text Block */}
        <div
          className={`space-y-3 ${
            isNumberLeft ? "md:order-2" : "md:order-1"
          }`}
        >
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {step.title}
          </h2>

          {/* Decorative Green Accent Underline */}
          <div className="h-0.5 w-12 bg-emerald-500 dark:bg-emerald-400 rounded-full" />

          <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
            {step.description}
          </p>

          {step.link && step.linkLabel && (
            <div className="pt-2">
              <Link
                to={step.link}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
              >
                <span>{step.linkLabel}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
