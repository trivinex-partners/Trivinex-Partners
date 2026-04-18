/* =============================================
   TRIVINEX PARTNERS — script.js
   ============================================= */

/* ---- CONFIG ---- */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwGHBEi65urnxmQLxIp_TZ4O1Y9wJ5K-6mC1SHLwZQGb0A4kEyQPKzrn9tkuPl7WKgW/exec';
const WHATSAPP_NUMBER   = '9779821367407'; // Replace with your WhatsApp number (with country code, no +)

/* ---- NAVBAR SCROLL ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---- SCROLL REVEAL ---- */
const revealEls = document.querySelectorAll(
  '.problem-card, .benefit-card, .sol-item, .step, .trust-badge-card, .section-title, .section-label, .section-sub'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay) : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ---- ROLE SELECTION ---- */
let currentRole = 'webdev';

function selectRole(role, btn) {
  currentRole = role;

  // Update button states
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Toggle skill sections
  const webSkills   = document.getElementById('webSkills');
  const videoSkills = document.getElementById('videoSkills');

  if (role === 'webdev') {
    webSkills.style.display   = 'block';
    videoSkills.style.display = 'none';
  } else {
    webSkills.style.display   = 'none';
    videoSkills.style.display = 'block';
  }
}

/* ---- AI TOGGLE ---- */
let usesAI = false;

function toggleAI(value) {
  usesAI = value;
  document.getElementById('aiYes').classList.toggle('active', value);
  document.getElementById('aiNo').classList.toggle('active', !value);

  const aiInput = document.getElementById('aiTools');
  if (value) {
    aiInput.style.display = 'block';
    aiInput.style.opacity = '0';
    aiInput.style.transform = 'translateY(-8px)';
    requestAnimationFrame(() => {
      aiInput.style.transition = 'opacity .3s, transform .3s';
      aiInput.style.opacity    = '1';
      aiInput.style.transform  = 'translateY(0)';
    });
  } else {
    aiInput.style.opacity    = '0';
    aiInput.style.transform  = 'translateY(-8px)';
    setTimeout(() => { aiInput.style.display = 'none'; }, 300);
  }
}

/* ---- EMAIL VALIDATION ---- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ---- GET CHECKED SKILLS ---- */
function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(el => el.value);
}

/* ---- SUBMIT FORM ---- */
async function submitForm() {
  // Gather values
  const fullName    = document.getElementById('fullName').value.trim();
  const email       = document.getElementById('email').value.trim();
  const countryCode = document.getElementById('countryCode').value;
  const phone       = document.getElementById('phone').value.trim();
  const aiTools     = document.getElementById('aiTools').value.trim();
  const payment     = document.querySelector('input[name="payment"]:checked');
  const emailError  = document.getElementById('emailError');

  // --- VALIDATION ---
  let valid = true;

  if (!fullName) { flashError('fullName'); valid = false; }

  emailError.textContent = '';
  if (!email) {
    emailError.textContent = 'Email is required.';
    flashError('email');
    valid = false;
  } else if (!isValidEmail(email)) {
    emailError.textContent = 'Please enter a valid email address.';
    flashError('email');
    valid = false;
  }

  // Skills
  const skillsName = currentRole === 'webdev' ? 'webSkill' : 'videoTool';
  const skills     = getCheckedValues(skillsName);
  if (skills.length === 0) {
    const section = currentRole === 'webdev'
      ? document.getElementById('webSkills')
      : document.getElementById('videoSkills');
    section.style.outline = '1.5px solid #f87171';
    section.style.borderRadius = '10px';
    setTimeout(() => { section.style.outline = ''; }, 2500);
    valid = false;
  }

  if (usesAI === false && document.getElementById('aiYes').classList.contains('active') === false && document.getElementById('aiNo').classList.contains('active') === false) {
    // Neither selected
    valid = false;
  }

  if (!payment) {
    document.querySelector('.payment-options').style.outline = '1.5px solid #f87171';
    document.querySelector('.payment-options').style.borderRadius = '10px';
    setTimeout(() => { document.querySelector('.payment-options').style.outline = ''; }, 2500);
    valid = false;
  }

  if (!valid) {
    shakeBtn();
    return;
  }

  // --- LOADING STATE ---
  setLoading(true);

  // Build data object
  const formData = {
    name:       fullName,
    email:      email,
    phone:      phone ? `${countryCode}${phone}` : 'Not provided',
    role:       currentRole === 'webdev' ? 'Web Developer' : 'Video Editor',
    skills:     skills.join(', '),
    ai:         usesAI ? `Yes — ${aiTools || 'Not specified'}` : 'No',
    payment:    payment.value,
    timestamp:  new Date().toLocaleString()
  };

  // --- SEND TO GOOGLE SHEETS ---
  try {
    if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
      
        body: JSON.stringify(formData)
      });
    }
  } catch (e) {
    console.warn('Google Sheets submission failed (non-critical):', e);
  }

  // --- REDIRECT TO WHATSAPP ---
  const waMessage = encodeURIComponent(
    `🚀 *New Freelancer Application*\n\n` +
    `👤 *Name:* ${formData.name}\n` +
    `📧 *Email:* ${formData.email}\n` +
    `📱 *Phone:* ${formData.phone}\n` +
    `💼 *Role:* ${formData.role}\n` +
    `🛠️ *Skills/Tools:* ${formData.skills}\n` +
    `🤖 *Uses AI:* ${formData.ai}\n` +
    `💳 *Payment:* ${formData.payment}`
  );

  const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  // Small delay for UX
  setTimeout(() => {
    setLoading(false);
    showSuccessPopup();
    window.open(waURL, '_blank');
    resetForm();
  }, 1200);
}

/* ---- HELPERS ---- */
function flashError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#f87171';
  el.style.boxShadow   = '0 0 0 3px rgba(248,113,113,0.15)';
  el.addEventListener('input', () => {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }, { once: true });
}

function shakeBtn() {
  const btn = document.querySelector('.btn-submit');
  btn.style.animation = 'none';
  btn.offsetHeight; // reflow
  btn.style.animation = 'shakeBtn 0.5s ease';
  btn.addEventListener('animationend', () => { btn.style.animation = ''; }, { once: true });
}

function setLoading(on) {
  const btnText    = document.getElementById('btnText');
  const btnArrow   = document.getElementById('btnArrow');
  const btnSpinner = document.getElementById('btnSpinner');
  if (on) {
    btnText.textContent    = 'Submitting...';
    btnArrow.style.display = 'none';
    btnSpinner.style.display = 'block';
  } else {
    btnText.textContent      = 'Submit Application';
    btnArrow.style.display   = '';
    btnSpinner.style.display = 'none';
  }
}

function resetForm() {
  document.getElementById('fullName').value = '';
  document.getElementById('email').value    = '';
  document.getElementById('phone').value    = '';
  document.getElementById('aiTools').value  = '';
  document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
  document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
  document.getElementById('emailError').textContent = '';
  document.getElementById('aiYes').classList.remove('active');
  document.getElementById('aiNo').classList.remove('active');
  document.getElementById('aiTools').style.display = 'none';
  usesAI = false;
  selectRole('webdev', document.querySelector('[data-role="webdev"]'));
}

function showSuccessPopup() {
  document.getElementById('successPopup').classList.add('active');
}

function closePopup() {
  document.getElementById('successPopup').classList.remove('active');
}

/* ---- SHAKE ANIMATION INJECTION ---- */
const style = document.createElement('style');
style.textContent = `
@keyframes shakeBtn {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-8px); }
  40%     { transform: translateX(8px); }
  60%     { transform: translateX(-5px); }
  80%     { transform: translateX(5px); }
}`;
document.head.appendChild(style);

/* ---- CLOSE POPUP ON OVERLAY CLICK ---- */
document.getElementById('successPopup').addEventListener('click', function(e) {
  if (e.target === this) closePopup();
});
