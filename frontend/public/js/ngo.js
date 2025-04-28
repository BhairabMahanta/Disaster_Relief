const modal = document.getElementById('modal');
const joinUsBtn = document.getElementById('join-us-btn');
const closeBtn = document.querySelector('.close-btn');

const ngoFormSection = document.getElementById('ngo-form-section');
const volunteerFormSection = document.getElementById('volunteer-form-section');

const joinNgoBtn = document.getElementById('join-ngo-btn');
const joinVolunteerBtn = document.getElementById('join-volunteer-btn');

// Show Modal
joinUsBtn.addEventListener('click', () => modal.classList.remove('hidden'));

// Close Modal
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
