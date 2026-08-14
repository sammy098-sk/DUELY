export function AboutContent() {
  return (
    <div className="space-y-6 text-left">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-foreground">
        About Duely
      </h1>

      <div className="space-y-5 text-sm sm:text-base leading-relaxed text-muted-foreground font-sans">
        <p>
          Duely was built around a simple, quiet frustration every freelancer knows: you complete the project, deliver exceptional work, send a clean invoice, and then end up spending unnecessary hours chasing clients just to get paid.
        </p>

        <p>
          We believe independent professionals shouldn't have to act as their own collection agency. Duely monitors invoice due dates automatically, drafting and sending polite, escalation-aware follow-ups over Email and WhatsApp every 3 days until your invoice is settled.
        </p>

        <div className="my-8 rounded-2xl border border-border bg-card p-6 shadow-paper space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-500 font-sans">
            The Duely Workflow
          </h2>
          <ol className="text-xs sm:text-sm font-semibold space-y-2 text-foreground">
            <li className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 font-mono text-[10px]">1</span>
              <span>Create invoice via prompt or file import</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 font-mono text-[10px]">2</span>
              <span>Send directly to your client</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 font-mono text-[10px]">3</span>
              <span>Duely watches for settlement and chases payment automatically</span>
            </li>
          </ol>
        </div>

        <p>
          Duely is built for freelancers, solo creatives, consultants, developers, designers, and independent studios. We aren't trying to be a bloated enterprise accounting platform with hundreds of features you'll never use.
        </p>

        <p className="font-semibold text-foreground border-l-2 border-emerald-500 pl-4 py-1 italic font-serif">
          Duely handles the repetitive invoice follow-up work so independent professionals can focus on the work they actually get paid to do.
        </p>
      </div>
    </div>
  );
}
