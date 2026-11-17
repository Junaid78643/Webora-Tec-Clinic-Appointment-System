const servicesContainer = document.getElementById('servicesContainer');
const serviceSelect = document.getElementById('serviceSelect');
const slotSelect = document.getElementById('slotSelect');
const bookingsContainer = document.getElementById('bookingsContainer');
const bookingForm = document.getElementById('bookingForm');
const messageBox = document.getElementById('message');

const serviceIcons = {
  consultation: '🩺',
  dentistry: '🦷',
  therapy: '💙'
};

const state = {
  services: [],
  selectedServiceId: '',
  selectedSlot: ''
};

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function resetMessage() {
  messageBox.textContent = '';
  messageBox.className = 'message';
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function renderServices() {
  servicesContainer.innerHTML = '';

  state.services.forEach((service) => {
    const card = document.createElement('div');
    card.className = `service-card ${state.selectedServiceId === service.id ? 'active' : ''}`;
    card.innerHTML = `
      <div class="service-header">
        <div class="service-icon">${serviceIcons[service.id] || '✦'}</div>
        <h3>${service.name}</h3>
      </div>
      <div class="service-meta">
        <span>${service.duration}</span>
        <span>${service.slots.length} slots</span>
      </div>
      <div class="slot-list">
        ${service.slots
          .map(
            (slot) => `
              <button
                type="button"
                class="slot-pill ${state.selectedSlot === slot && state.selectedServiceId === service.id ? 'selected' : ''}"
                data-service-id="${service.id}"
                data-slot="${slot}"
              >
                ${formatDateTime(slot)}
              </button>
            `
          )
          .join('')}
      </div>
    `;

    card.addEventListener('click', (event) => {
      const target = event.target.closest('.slot-pill');
      if (target) {
        state.selectedServiceId = target.dataset.serviceId;
        state.selectedSlot = target.dataset.slot;
        serviceSelect.value = state.selectedServiceId;
        slotSelect.value = state.selectedSlot;
        renderServices();
        renderSlotOptions();
        return;
      }

      const nextServiceId = service.id;
      state.selectedServiceId = nextServiceId;
      state.selectedSlot = '';
      serviceSelect.value = nextServiceId;
      renderServices();
      renderSlotOptions();
    });

    servicesContainer.appendChild(card);
  });
}

function renderSlotOptions() {
  const selectedService = state.services.find((service) => service.id === serviceSelect.value) || null;
  const currentSlots = selectedService ? selectedService.slots : [];

  slotSelect.innerHTML = '<option value="">Choose a time</option>' +
    currentSlots
      .map((slot) => `<option value="${slot}">${formatDateTime(slot)}</option>`)
      .join('');

  if (state.selectedSlot && currentSlots.includes(state.selectedSlot)) {
    slotSelect.value = state.selectedSlot;
  } else {
    slotSelect.value = '';
  }
}

function renderBookings(bookings) {
  if (!bookings.length) {
    bookingsContainer.innerHTML = '<div class="empty-state">No bookings yet. The next appointment will appear here.</div>';
    return;
  }

  bookingsContainer.innerHTML = bookings
    .slice()
    .sort((a, b) => new Date(a.slot) - new Date(b.slot))
    .map(
      (booking) => `
        <div class="booking-item">
          <div>
            <strong>${booking.name}</strong>
            <span>${booking.contact}</span>
          </div>
          <div>
            <strong>${booking.service}</strong>
            <span>${booking.slotLabel}</span>
          </div>
          <div>
            <strong>ID</strong>
            <span>${booking.id}</span>
          </div>
        </div>
      `
    )
    .join('');
}

async function loadData() {
  const servicesResponse = await fetch('/api/services');
  const servicesData = await servicesResponse.json();
  state.services = servicesData.services;

  state.services.forEach((service) => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = service.name;
    serviceSelect.appendChild(option);
  });

  const bookingsResponse = await fetch('/api/bookings');
  const bookingsData = await bookingsResponse.json();
  renderBookings(bookingsData.bookings);
  renderServices();
  renderSlotOptions();
}

serviceSelect.addEventListener('change', (event) => {
  state.selectedServiceId = event.target.value;
  state.selectedSlot = '';
  renderServices();
  renderSlotOptions();
});

slotSelect.addEventListener('change', (event) => {
  state.selectedSlot = event.target.value;
  renderServices();
});

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  resetMessage();

  const payload = {
    name: document.getElementById('name').value,
    contact: document.getElementById('contact').value,
    service: serviceSelect.value,
    slot: slotSelect.value
  };

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(result.message || 'Unable to create booking.', 'error');
      return;
    }

    showMessage(`Confirmed: ${result.booking.service} on ${result.booking.slotLabel}.`, 'success');
    bookingForm.reset();
    state.selectedServiceId = '';
    state.selectedSlot = '';
    renderServices();
    renderSlotOptions();

    const bookingsResponse = await fetch('/api/bookings');
    const bookingsData = await bookingsResponse.json();
    renderBookings(bookingsData.bookings);
  } catch (error) {
    showMessage('Something went wrong while booking your appointment.', 'error');
  }
});

loadData();
