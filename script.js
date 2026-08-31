document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.main-nav');
  const toggle = document.querySelector('.menu-toggle');

  if (menu) {
    if (window.innerWidth <= 850) {
      menu.classList.add('open');
    }
  }

  if (menu && toggle) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-current-year]').forEach(node => node.textContent = new Date().getFullYear());

  const form = document.querySelector('.vacancy-form');
  const acknowledgementBox = document.querySelector('.acknowledgement-box');
  const downloadButton = document.getElementById('downloadAck');
  const successTitle = document.querySelector('.acknowledgement-box h3');
  const successText = document.querySelector('.acknowledgement-box p');
  let currentDownloadUrl = '';

  const bservHelpers = window.bservHelpers || {};
  const slugify = bservHelpers.slugify || ((value) => String(value || 'applicant').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'applicant');
  const parseBackendMessage = bservHelpers.parseBackendMessage || ((message) => message || 'Submission failed. Please check your connection and try again.');

  const buildAcknowledgementHtml = (fullName, position, email, submittedOn, message) => {
    return `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Acknowledgement Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #1d3939; }
          .card { max-width: 700px; margin: 0 auto; border: 1px solid #dfe5df; padding: 32px; }
          .brand { color: #8b2d2d; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
          h1 { font-size: 28px; margin: 0 0 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          td { padding: 10px 0; border-bottom: 1px solid #eee; }
          td:first-child { font-weight: 700; width: 220px; }
          .note { margin-top: 28px; line-height: 1.7; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">Bihar State Educational Development & Research Council</div>
          <h1>Acknowledgement of Application</h1>
          <p>Thank you for submitting your application.</p>
          <table>
            <tr><td>Applicant Name</td><td>${fullName}</td></tr>
            <tr><td>Applied For</td><td>${position}</td></tr>
            <tr><td>Email</td><td>${email}</td></tr>
            <tr><td>Submitted On</td><td>${submittedOn}</td></tr>
          </table>
          <div class="note">${message}</div>
        </div>
      </body>
      </html>
    `;
  };

  const showAcknowledgement = (fullName, position, email, backendMessage = 'Your application has been received and is now under review.') => {
    const submittedOn = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (successTitle) {
      successTitle.textContent = 'Application submitted successfully';
    }

    if (successText) {
      successText.textContent = backendMessage;
    }

    const blob = new Blob([buildAcknowledgementHtml(fullName, position, email, submittedOn, backendMessage)], { type: 'text/html;charset=utf-8' });
    if (currentDownloadUrl) URL.revokeObjectURL(currentDownloadUrl);
    currentDownloadUrl = URL.createObjectURL(blob);

    if (downloadButton) {
      downloadButton.onclick = () => {
        const anchor = document.createElement('a');
        anchor.href = currentDownloadUrl;
        anchor.download = `acknowledgement-${slugify(fullName)}.html`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      };
    }

    if (acknowledgementBox) {
      acknowledgementBox.hidden = false;
    }
  };

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const fileInput = form.querySelector('input[type="file"]');
      const file = fileInput && fileInput.files && fileInput.files[0];

      const formData = new FormData(form); // reused for the POST; payload below is for the receipt only
      const names = Object.fromEntries(formData.entries());
      const fullName = names.full_name || 'Applicant';
      const position = names.position || 'Not specified';
      const email = names.email || 'Not provided';

      // Client-side resume checks (fast feedback; server re-validates in submit.php)
      if (file) {
        const MAX_RESUME_BYTES = 2 * 1024 * 1024;
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (!allowedTypes.includes(file.type)) {
          showAcknowledgement(fullName, position, email, 'Unsupported resume file type. Please upload a PDF, DOC or DOCX file.');
          return;
        }

        if (file.size > MAX_RESUME_BYTES) {
          showAcknowledgement(fullName, position, email, 'The selected resume exceeds the 2 MB limit. Please upload a smaller file.');
          return;
        }
      }

      // Local-only demo mode: no server or backend call is used.
      const receipt = `BSEDRC-LOCAL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const confirmationMessage = `Your application has been recorded locally. Receipt number: ${receipt}.`;

      showAcknowledgement(fullName, position, email, confirmationMessage);
      form.reset();
    });
  }
});
