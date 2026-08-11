# Invoice Guardian

build Duely is the invoice reminder app we've been building together for freelancers — the idea came from that tweet screenshot you shared about a "boring but deadly accurate invoice reminder bot."



Here's what it does:



- **Freelancers create and send invoices** — client info, line items/services, tax, discounts, due dates, all through a clean builder with live totals

- **It chases payment automatically** — every 3 days, a background job checks unpaid invoices and sends reminders via **email (Resend)** and **WhatsApp (Twilio)**, so you never have to manually follow up

- **The reminders are AI-drafted and escalate in tone** — friendly nudge in the first week, firmer once it's overdue, final notice if it drags on

- **Everything's trackable** — a dashboard with outstanding/overdue/paid totals, a reminder history log per invoice so you can see exactly what was sent and when, and downloadable PDF invoices with your business/bank details

Design-wise it has its own identity now: a "ledger" aesthetic — paper background, navy ink, serif headers, monospace for money, and a rotated rubber-stamp badge (PAID / OVERDUE / AWAITING / DRAFT) instead of a generic status pill.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ledger-drew-remind.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1164f157-f2c0-411f-955a-6e2b3fe8abf0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
