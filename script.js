let appointments = [];
let currentWeekStart = new Date();
let caseList = [];
let collaboratoriList = [];
let selectedFolderPath = '';

function showSection(id) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';

  if (id === 'planning') {
    renderPlanning();
  }
}

function addAppointment() {
  const name = document.getElementById('name').value.toUpperCase();
  const date = document.getElementById('date').value;
  const arrivalTime = document.getElementById('arrivalTime').value;
  const appointmentTime = document.getElementById('appointmentTime').value;
  const arrivalMode = document.getElementById('arrivalMode').value;
  const transport = document.getElementById('transport').value;
  const collaborator = document.getElementById('collaboratorSelect').value.toUpperCase();

  const appointment = {
    id: Date.now(),
    name,
    date,
    arrivalTime,
    appointmentTime,
    arrivalMode,
    transport,
    collaborator
  };
  appointments.push(appointment);
  renderAppointments();
  saveToLocalStorage();
}

function renderAppointments() {
  const appointmentsList = document.getElementById('appointments-list');
  appointmentsList.innerHTML = '';

  // Ordina gli appuntamenti per data e orario
  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.appointmentTime}`);
    const dateB = new Date(`${b.date}T${b.appointmentTime}`);
    return dateA - dateB;
  });

  sortedAppointments.forEach(appt => {
    const apptElement = document.createElement('div');
    apptElement.className = 'appointment';
    apptElement.innerHTML = `
      <p>${formatAppointment(appt)}</p>
      <button onclick="editAppointment(${appt.id})">Modifica</button>
      <button onclick="deleteAppointment(${appt.id})">Elimina</button>
    `;
    appointmentsList.appendChild(apptElement);
  });

  renderPlanning();
}

function renderPlanning() {
  const planningGrid = document.querySelector('.planning-grid');
  planningGrid.innerHTML = '';
  const startOfWeek = getMonday(new Date(currentWeekStart));
  const monthDisplay = document.getElementById('month-display');
  monthDisplay.textContent = startOfWeek.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const column = document.createElement('div');
    column.className = 'planning-column';
    column.innerHTML = `<h2>${date.toLocaleDateString('it-IT', { weekday: 'long' })}<span>${date.getDate()}</span></h2>`;

    // Ordina gli appuntamenti per data e orario
    const sortedAppointments = appointments
      .filter(appt => new Date(appt.date).toDateString() === date.toDateString())
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.appointmentTime}`);
        const dateB = new Date(`${b.date}T${b.appointmentTime}`);
        return dateA - dateB;
      });

    sortedAppointments.forEach(appt => {
      const apptElement = document.createElement('div');
      apptElement.className = 'appointment';
      apptElement.innerHTML = `
        <p>${formatAppointment(appt)}</p>
      `;
      column.appendChild(apptElement);
    });
    planningGrid.appendChild(column);
  }
}

function getMonday(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

function editAppointment(id) {
  const appointment = appointments.find(appt => appt.id === id);
  if (appointment) {
    document.getElementById('name').value = appointment.name;
    document.getElementById('date').value = appointment.date;
    document.getElementById('arrivalTime').value = appointment.arrivalTime;
    document.getElementById('appointmentTime').value = appointment.appointmentTime;
    document.getElementById('arrivalMode').value = appointment.arrivalMode;
    document.getElementById('transport').value = appointment.transport;
    document.getElementById('collaboratorSelect').value = appointment.collaborator;

    deleteAppointment(id);
  }
}

function deleteAppointment(id) {
  appointments = appointments.filter(appt => appt.id !== id);
  renderAppointments();
  saveToLocalStorage();
}

function changeWeek(offset) {
  currentWeekStart.setDate(currentWeekStart.getDate() + offset * 7);
  renderPlanning();
}

function calculateArrivalTime() {
  const arrivalMode = document.getElementById('arrivalMode').value;
  const transport = document.getElementById('transport').value;
  const arrivalTime = document.getElementById('arrivalTime').value;

  if (!arrivalTime) return;

  const arrivalDateTime = new Date(`1970-01-01T${arrivalTime}`);
  let calculatedTime;

  if (arrivalMode === 'aereo') {
    if (transport === 'NCC') {
      calculatedTime = new Date(arrivalDateTime.getTime() + 60 * 60 * 1000);
    } else if (transport === 'Taxi') {
      calculatedTime = new Date(arrivalDateTime.getTime() + 80 * 60 * 1000);
    } else if (transport === 'Mezzi pubblici') {
      calculatedTime = new Date(arrivalDateTime.getTime() + 120 * 60 * 1000);
    }
  } else if (arrivalMode === 'treno') {
    if (transport === 'NCC' || transport === 'Taxi') {
      calculatedTime = new Date(arrivalDateTime.getTime() + 20 * 60 * 1000);
    } else if (transport === 'Mezzi pubblici') {
      calculatedTime = new Date(arrivalDateTime.getTime() + 30 * 60 * 1000);
    }
  }

  if (calculatedTime) {
    document.getElementById('appointmentTime').value = calculatedTime.toTimeString().substring(0, 5);
  }
}

function addCase() {
  const newCase = document.getElementById('newCase').value;
  if (newCase) {
    caseList.push(newCase);
    document.getElementById('newCase').value = '';
    renderCaseList();
    saveToLocalStorage();
  }
}

function renderCaseList() {
  const caseListElement = document.getElementById('case-list');
  const caseSelectElement = document.getElementById('caseSelect');
  caseListElement.innerHTML = '';
  caseSelectElement.innerHTML = '<option value="">Seleziona casa</option>';
  caseList.forEach(casa => {
    const caseElement = document.createElement('li');
    caseElement.textContent = casa;
    caseListElement.appendChild(caseElement);

    const optionElement = document.createElement('option');
    optionElement.value = casa;
    optionElement.textContent = casa;
    caseSelectElement.appendChild(optionElement);
  });
}

function updateName() {
  const caseSelect = document.getElementById('caseSelect');
  const nameInput = document.getElementById('name');
  nameInput.value = caseSelect.value;
}

function addCollaboratore() {
  const newCollaboratore = document.getElementById('newCollaboratore').value;
  if (newCollaboratore) {
    collaboratoriList.push(newCollaboratore);
    document.getElementById('newCollaboratore').value = '';
    renderCollaboratoriList();
    saveToLocalStorage();
  }
}

function renderCollaboratoriList() {
  const collaboratoriListElement = document.getElementById('collaboratori-list');
  const collaboratorSelectElement = document.getElementById('collaboratorSelect');
  const filterCollaboratorSelectElement = document.getElementById('filterCollaboratorSelect');
  collaboratoriListElement.innerHTML = '';
  collaboratorSelectElement.innerHTML = '<option value="">Seleziona collaboratore</option>';
  filterCollaboratorSelectElement.innerHTML = '<option value="">Tutti i collaboratori</option>';
  collaboratoriList.forEach(collaboratore => {
    const collaboratoriElement = document.createElement('li');
    collaboratoriElement.textContent = collaboratore;
    collaboratoriListElement.appendChild(collaboratoriElement);

    const optionElement = document.createElement('option');
    optionElement.value = collaboratore;
    optionElement.textContent = collaboratore;
    collaboratorSelectElement.appendChild(optionElement);

    const filterOptionElement = document.createElement('option');
    filterOptionElement.value = collaboratore;
    filterOptionElement.textContent = collaboratore;
    filterCollaboratorSelectElement.appendChild(filterOptionElement);
  });
}

document.getElementById('selectFolder').addEventListener('change', (event) => {
  const folderPath = event.target.files[0].webkitRelativePath;
  selectedFolderPath = folderPath.substring(0, folderPath.indexOf('/'));
});

function saveData() {
  const data = {
    appointments,
    caseList,
    collaboratoriList
  };
  const dataStr = JSON.stringify(data);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = selectedFolderPath ? `${selectedFolderPath}/planning_dati.json` : 'planning_dati.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadData() {
  if (!selectedFolderPath) {
    alert('Seleziona prima una cartella di salvataggio.');
    return;
  }
  const filePath = `${selectedFolderPath}/planning_dati.json`;
  fetch(filePath)
    .then(response => response.json())
    .then(data => {
      appointments = data.appointments || [];
      caseList = data.caseList || [];
      collaboratoriList = data.collaboratoriList || [];
      renderAppointments();
      renderCaseList();
      renderCollaboratoriList();
    })
    .catch(error => {
      console.error('Errore durante il caricamento del file:', error);
      alert('Errore durante il caricamento del file.');
    });
}

function filterAppointments() {
  const collaborator = document.getElementById('filterCollaboratorSelect').value;
  let filteredAppointments = appointments;

  if (collaborator) {
    filteredAppointments = appointments.filter(appt => appt.collaborator === collaborator);
  }

  renderFilteredAppointments(filteredAppointments);
}

function sortAppointments(order) {
  let sortedAppointments = [...appointments];

  if (order === 'asc') {
    sortedAppointments.sort((a, b) => new Date(`${a.date}T${a.appointmentTime}`) - new Date(`${b.date}T${b.appointmentTime}`));
  } else if (order === 'desc') {
    sortedAppointments.sort((a, b) => new Date(`${b.date}T${b.appointmentTime}`) - new Date(`${a.date}T${a.appointmentTime}`));
  }

  renderFilteredAppointments(sortedAppointments);
}

function filterAppointmentsToday() {
  const filterToday = document.getElementById('filterToday').checked;
  const today = new Date().toISOString().split('T')[0];
  let filteredAppointments = appointments;

  if (filterToday) {
    filteredAppointments = appointments.filter(appt => appt.date >= today);
  }

  renderFilteredAppointments(filteredAppointments);
}

function renderFilteredAppointments(filteredAppointments) {
  const appointmentsList = document.getElementById('appointments-list');
  appointmentsList.innerHTML = '';

  filteredAppointments.forEach(appt => {
    const apptElement = document.createElement('div');
    apptElement.className = 'appointment';
    apptElement.innerHTML = `
      <p>${formatAppointment(appt)}</p>
      <button onclick="editAppointment(${appt.id})">Modifica</button>
      <button onclick="deleteAppointment(${appt.id})">Elimina</button>
    `;
    appointmentsList.appendChild(apptElement);
  });

  renderPlanning();
}

function formatAppointment(appointment) {
  const options = { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' };
  const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', options);
  return `
    <span style="font-weight: bold; color: blue;">${appointment.name}</span> - 
    ${formattedDate} - 
    ${appointment.arrivalTime} - 
    ${appointment.appointmentTime} - 
    ${appointment.arrivalMode} + ${appointment.transport} - 
    <span style="font-weight: bold; color: red;">${appointment.collaborator}</span>
  `;
}

function applyFontSizeSettings() {
  const planningSection = document.getElementById('planning');
  const appointmentsList = document.getElementById('appointments-list');
  const planningAppointments = document.querySelectorAll('.planning-column .appointment');

  const planningFontSize = localStorage.getItem('planningFontSize');
  const appointmentFontSize = localStorage.getItem('appointmentFontSize');

  if (planningFontSize) {
    planningSection.style.fontSize = `${planningFontSize}px`;
  }

  if (appointmentFontSize) {
    appointmentsList.style.fontSize = `${appointmentFontSize}px`;
    planningAppointments.forEach(appt => {
      appt.style.fontSize = `${appointmentFontSize}px`;
    });
  }
}

function increaseFontSize() {
  const planningSection = document.getElementById('planning');
  const currentFontSize = window.getComputedStyle(planningSection).fontSize;
  const newFontSize = parseFloat(currentFontSize) + 1;
  planningSection.style.fontSize = `${newFontSize}px`;
  localStorage.setItem('planningFontSize', newFontSize);
}

function decreaseFontSize() {
  const planningSection = document.getElementById('planning');
  const currentFontSize = window.getComputedStyle(planningSection).fontSize;
  const newFontSize = parseFloat(currentFontSize) - 1;
  planningSection.style.fontSize = `${newFontSize}px`;
  localStorage.setItem('planningFontSize', newFontSize);
}

function increaseAppointmentFontSize() {
  const appointmentsList = document.getElementById('appointments-list');
  const currentFontSize = window.getComputedStyle(appointmentsList).fontSize;
  const newFontSize = parseFloat(currentFontSize) + 1;
  appointmentsList.style.fontSize = `${newFontSize}px`;
  localStorage.setItem('appointmentFontSize', newFontSize);

  const planningAppointments = document.querySelectorAll('.planning-column .appointment');
  planningAppointments.forEach(appt => {
    appt.style.fontSize = `${newFontSize}px`;
  });
}

function decreaseAppointmentFontSize() {
  const appointmentsList = document.getElementById('appointments-list');
  const currentFontSize = window.getComputedStyle(appointmentsList).fontSize;
  const newFontSize = parseFloat(currentFontSize) - 1;
  appointmentsList.style.fontSize = `${newFontSize}px`;
  localStorage.setItem('appointmentFontSize', newFontSize);

  const planningAppointments = document.querySelectorAll('.planning-column .appointment');
  planningAppointments.forEach(appt => {
    appt.style.fontSize = `${newFontSize}px`;
  });
}

function saveToLocalStorage() {
  const data = {
    appointments,
    caseList,
    collaboratoriList
  };
  localStorage.setItem('planningData', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const dataStr = localStorage.getItem('planningData');
  if (dataStr) {
    const data = JSON.parse(dataStr);
    appointments = data.appointments || [];
    caseList = data.caseList || [];
    collaboratoriList = data.collaboratoriList || [];
    renderAppointments();
    renderCaseList();
    renderCollaboratoriList();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  showSection('home');
  renderCaseList();
  renderCollaboratoriList();
  applyFontSizeSettings();
  document.getElementById('increaseFontSize').addEventListener('click', increaseFontSize);
  document.getElementById('decreaseFontSize').addEventListener('click', decreaseFontSize);
  document.getElementById('increaseAppointmentFontSize').addEventListener('click', increaseAppointmentFontSize);
  document.getElementById('decreaseAppointmentFontSize').addEventListener('click', decreaseAppointmentFontSize);
});