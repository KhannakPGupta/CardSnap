const API_BASE = '/api';

export async function fetchConfigStatus() {
  try {
    const res = await fetch(`${API_BASE}/config/status`);
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  } catch (error) {
    console.error('Config status error:', error);
    return {
      google_sheets_configured: false,
      spreadsheet_id: null,
      contact_count: null,
      message: 'Backend unavailable or network error.'
    };
  }
}

export async function scanCard(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to process business card.');
  }

  return data;
}

export async function saveContact(contactData) {
  const res = await fetch(`${API_BASE}/save-contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to save contact to Google Sheet.');
  }

  return data;
}

export async function fetchContacts() {
  const res = await fetch(`${API_BASE}/contacts`);
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return await res.json();
}

export async function updateContact(rowId, contactData) {
  const res = await fetch(`${API_BASE}/contacts/${rowId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });
  if (!res.ok) throw new Error('Failed to update contact');
  return await res.json();
}

export async function deleteContact(rowId) {
  const res = await fetch(`${API_BASE}/contacts/${rowId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete contact');
  return await res.json();
}

