const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'bookings.json');

const services = [
  {
    id: 'consultation',
    name: 'General Consultation',
    duration: '30 min',
    slots: [
      '2026-11-18T09:00',
      '2026-11-18T10:00',
      '2026-11-18T13:00',
      '2026-11-19T11:00'
    ]
  },
  {
    id: 'dentistry',
    name: 'Dental Checkup',
    duration: '45 min',
    slots: [
      '2026-11-18T09:30',
      '2026-11-18T12:30',
      '2026-11-19T09:00',
      '2026-11-19T14:00'
    ]
  },
  {
    id: 'therapy',
    name: 'Therapy Session',
    duration: '60 min',
    slots: [
      '2026-11-18T15:00',
      '2026-11-18T16:00',
      '2026-11-19T10:30',
      '2026-11-19T15:30'
    ]
  }
];

function readBookings() {
  try {
    const fileContents = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(fileContents || '[]');
  } catch (error) {
    return [];
  }
}

function writeBookings(bookings) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
}

function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/services', (req, res) => {
  res.json({ services });
});

app.get('/api/bookings', (req, res) => {
  const bookings = readBookings().map((booking) => ({
    ...booking,
    slotLabel: formatDateTime(booking.slot)
  }));

  res.json({ bookings });
});

app.post('/api/bookings', (req, res) => {
  const { name, contact, service, slot } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: 'Name is required.' });
  }

  if (!contact || !String(contact).trim()) {
    return res.status(400).json({ message: 'Contact details are required.' });
  }

  if (!service || !String(service).trim()) {
    return res.status(400).json({ message: 'Please choose a service.' });
  }

  if (!slot || !String(slot).trim()) {
    return res.status(400).json({ message: 'Please choose a preferred time.' });
  }

  const selectedService = services.find((item) => item.id === service);

  if (!selectedService) {
    return res.status(400).json({ message: 'The selected service is invalid.' });
  }

  if (!selectedService.slots.includes(slot)) {
    return res.status(400).json({ message: 'That time is not available for the selected service.' });
  }

  const bookings = readBookings();
  const isDuplicate = bookings.some((booking) => booking.slot === slot);

  if (isDuplicate) {
    return res.status(409).json({ message: 'That slot has already been booked. Please select another time.' });
  }

  const newBooking = {
    id: Date.now().toString(),
    name: String(name).trim(),
    contact: String(contact).trim(),
    service: selectedService.name,
    slot,
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);
  writeBookings(bookings);

  return res.status(201).json({
    message: 'Appointment booked successfully.',
    booking: {
      ...newBooking,
      slotLabel: formatDateTime(newBooking.slot)
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Appointment booking app running on http://localhost:${PORT}`);
});
