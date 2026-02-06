// API Tester JavaScript

// Enhanced API Tester JavaScript

document.addEventListener('DOMContentLoaded', function () {
  const apiForm = document.getElementById('apiForm');
  const responseBox = document.getElementById('responseBox');
  const statusBadge = document.getElementById('statusBadge');
  const loader = document.getElementById('loader');
  const responseDetails = document.getElementById('responseDetails');
  const sendBtn = document.getElementById('sendBtn');

  function showLoader(show) {
    loader.style.display = show ? 'inline-block' : 'none';
    sendBtn.disabled = show;
  }

  function showStatus(status, text) {
    if (!text) {
      statusBadge.style.display = 'none';
      statusBadge.className = 'api-tester-status-badge';
      statusBadge.textContent = '';
      return;
    }
    statusBadge.style.display = 'inline-block';
    statusBadge.textContent = text;
    statusBadge.className = 'api-tester-status-badge ' + (status === 'success' ? 'success' : status === 'error' ? 'error' : '');
  }

  apiForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    responseBox.textContent = '';
    showStatus();
    showLoader(true);

    const method = document.getElementById('method').value;
    const url = document.getElementById('url').value;
    let headers = {};
    let body = document.getElementById('body').value;

    // Parse headers
    try {
      const headersInput = document.getElementById('headers').value.trim();
      if (headersInput) {
        headers = JSON.parse(headersInput);
      }
    } catch (err) {
      showLoader(false);
      showStatus('error', 'Invalid headers');
      responseBox.textContent = 'Invalid headers JSON.';
      responseDetails.open = true;
      return;
    }

    // Parse body
    let fetchBody = undefined;
    if (body && method !== 'GET') {
      try {
        fetchBody = JSON.stringify(JSON.parse(body));
        headers['Content-Type'] = 'application/json';
      } catch (err) {
        showLoader(false);
        showStatus('error', 'Invalid body');
        responseBox.textContent = 'Invalid body JSON.';
        responseDetails.open = true;
        return;
      }
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: fetchBody,
      });
      const contentType = res.headers.get('content-type') || '';
      let data;
      let statusText = res.status + ' ' + res.statusText;
      if (res.ok) {
        showStatus('success', statusText);
      } else {
        showStatus('error', statusText);
      }
      if (contentType.includes('application/json')) {
        data = await res.json();
        responseBox.textContent = JSON.stringify(data, null, 2);
      } else {
        data = await res.text();
        responseBox.textContent = data;
      }
      responseDetails.open = true;
    } catch (error) {
      showStatus('error', 'Network Error');
      responseBox.textContent = 'Error: ' + error;
      responseDetails.open = true;
    } finally {
      showLoader(false);
    }
  });
});
