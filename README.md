# Ashil Mobile Hairdresser Booking

## Purpose

Let clients book, verify, reschedule, or cancel barber appointments from a mobile-friendly site.
Built for Ashil's barbershop/mobile hairdresser and their customers.
Solves manual scheduling conflicts by showing real-time availability and enforcing slot exclusivity.

## Scope (MVP)

- Show available dates/times and block booked slots
- Book appointments with confirmation codes
- Manage appointments (lookup, reschedule, cancel)

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui
- Backend: Next.js API routes, Prisma ORM
- Database: PostgreSQL

## Architecture (high level)

Client -> Next.js API Routes -> Prisma -> PostgreSQL

## Data Model (core entities only)

- BookedAppointment
- AvailabilityRange

## Setup

npm install
npm run dev

.env
ashil_DATABASE_URL=

## Core Flows

- Read: load calendar availability; lookup appointment by confirmation code
- Write: book appointment -> verify -> confirm; reschedule (cancel old + create new); cancel appointment

## Constraints / Decisions

- Source of truth: PostgreSQL + Prisma models; availability derived from bookings
- Time model: store UTC in DB, display in Asia/Dubai timezone
- Slot model: fixed one-hour slots (09:00, 11:00, 13:00, 15:00, 17:00) on Mon-Fri; pending/confirmed block slots
- Tradeoffs: minimal data captured (no customer name stored), confirmation-code based access only
