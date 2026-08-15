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
      message: 'Backend unavailable or network error.',
      offline: true
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

  let data;
  try {
    data = await res.json();
  } catch (err) {
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): Failed to process business card.`);
    }
    throw new Error('Failed to parse response from server.');
  }

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

  let data;
  try {
    data = await res.json();
  } catch (err) {
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): Failed to save contact.`);
    }
    throw new Error('Failed to parse response from server.');
  }

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to save contact.');
  }

  return data;
}

export async function fetchContacts() {
  const res = await fetch(`${API_BASE}/contacts`);
  if (!res.ok) throw new Error(`Server error (${res.status}): Failed to fetch contacts`);
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse contacts response.');
  }
}

export async function updateContact(rowId, contactData) {
  const res = await fetch(`${API_BASE}/contacts/${rowId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });
  if (!res.ok) throw new Error(`Server error (${res.status}): Failed to update contact`);
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse update response.');
  }
}

export async function deleteContact(rowId) {
  const res = await fetch(`${API_BASE}/contacts/${rowId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Server error (${res.status}): Failed to delete contact`);
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse delete response.');
  }
}

