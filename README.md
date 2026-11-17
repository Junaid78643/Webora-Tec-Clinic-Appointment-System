# Appointment Booking Application

A simple full-stack appointment booking app built with Express and a static frontend. The backend stores bookings in a local JSON file to act as a lightweight database for the demo.

## Features

- View available services and time slots
- Submit a booking with name, contact details, service, and preferred time
- Client-side and server-side validation
- Prevent duplicate bookings for the same slot
- Show booking confirmation and an admin-style booking list

## Prerequisites

- Node.js 18 or newer

## How to run

1. Open a terminal in this folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open the app in your browser:
   ```text
   http://localhost:3000
   ```

## Project structure

- `server.js` – Express API and static frontend server
- `public/` – frontend HTML, CSS, and JavaScript
- `data/bookings.json` – lightweight booking storage

## API endpoints

- `GET /api/services` – returns the available services and slots
- `GET /api/bookings` – returns existing bookings
- `POST /api/bookings` – creates a new booking and validates input

## Notes

This demo uses a local JSON file instead of a production database so it can run without additional setup. The logic still includes backend validation and duplicate slot prevention.
