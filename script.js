document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.main-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (menu && toggle) toggle.addEventListener('click', () => { const open = menu.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
  document.querySelectorAll('[data-current-year]').forEach(node => node.textContent = new Date().getFullYear());

  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz7BxT0xPXT7O8wQev0zTnyCM6ogvCiVMTziKrBIRtYt_toUEBjEVCJrrSNhJ0duVxV/exec';
  const form = document.querySelector('.vacancy-form');
  const acknowledgementBox = document.querySelector('.acknowledgement-box');
  const downloadButton = document.getElementById('downloadAck');
  const successTitle = document.querySelector('.acknowledgement-box h3');
  const successText = document.querySelector('.acknowledgement-box p');
  let currentDownloadUrl = '';

  const slugify = (value) => {
    return String(value || 'applicant')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'applicant';
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

    const acknowledgementHtml = `
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
          <div class="note">${backendMessage}</div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([acknowledgementHtml], { type: 'text/html;charset=utf-8' });
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

      let payload = Object.fromEntries(new FormData(form).entries());
      const fullName = payload.full_name || 'Applicant';
      const position = payload.position || 'Not specified';
      const email = payload.email || 'Not provided';

      if (file) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        payload = {
          ...payload,
          FullName: payload.full_name,
          DOB: payload.dob,
          Mobile: payload.phone,
          Email: payload.email,
          Position: payload.position,
          Address: payload.address,
          Qualification: payload.qualification,
          Experience: payload.experience,
          Reason: payload.motivation,
          resumeBlob: base64,
          resumeFileName: file.name,
          resumeMimeType: file.type
        };
      } else {
        payload = {
          ...payload,
          FullName: payload.full_name,
          DOB: payload.dob,
          Mobile: payload.phone,
          Email: payload.email,
          Position: payload.position,
          Address: payload.address,
          Qualification: payload.qualification,
          Experience: payload.experience,
          Reason: payload.motivation
        };
      }

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          mode: 'cors'
        });

        const text = await response.text();
        let backendMessage = 'Your application has been received and is now under review.';

        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed && parsed.message) {
              backendMessage = parsed.message;
            }
          } catch (error) {
            if (text.toLowerCase().includes('success')) {
              backendMessage = text;
            }
          }
        }

        showAcknowledgement(fullName, position, email, backendMessage);
      } catch (error) {
        console.warn('Google Apps Script submit failed, local acknowledgement will still show.', error);
        showAcknowledgement(fullName, position, email);
      }

      form.reset();
    });
  }
});
