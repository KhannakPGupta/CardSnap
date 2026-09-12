const getBackendUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // If running locally in browser (localhost / 127.0.0.1), default to local backend port 8000
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000';
  }
  return 'https://cardsnap-backend-856868075880.asia-south2.run.app';
};

export const BACKEND_URL = getBackendUrl();
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

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

export async function resetContactsSheet() {
  const res = await fetch(`${API_BASE}/contacts/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Server error (${res.status}): Failed to reset contacts ledger`);
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse reset response.');
  }
}

export async function fetchLedgers() {
  const res = await fetch(`${API_BASE}/ledgers`);
  if (!res.ok) throw new Error(`Server error (${res.status}): Failed to fetch ledgers`);
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse ledgers response.');
  }
}

export async function activateLedger(filename) {
  const res = await fetch(`${API_BASE}/ledgers/activate/${encodeURIComponent(filename)}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error (${res.status}): Failed to activate ledger`);
  }
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse activation response.');
  }
}

export async function deleteLedger(filename) {
  const res = await fetch(`${API_BASE}/ledgers/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error (${res.status}): Failed to delete ledger`);
  }
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse delete response.');
  }
}

export async function fetchDuplicates() {
  const res = await fetch(`${API_BASE}/contacts/duplicates`);
  if (!res.ok) throw new Error(`Server error (${res.status}): Failed to fetch duplicates`);
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse duplicates response.');
  }
}

export async function mergeDuplicates(targetRowId, duplicateRowIds, mergedContact) {
  const res = await fetch(`${API_BASE}/contacts/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_row_id: targetRowId,
      duplicate_row_ids: duplicateRowIds,
      merged_contact: mergedContact
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error (${res.status}): Failed to merge contacts`);
  }
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse merge response.');
  }
}

export async function renameLedger(filename, newLabel) {
  const res = await fetch(`${API_BASE}/ledgers/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: filename,
      new_label: newLabel
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error (${res.status}): Failed to rename ledger`);
  }
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Failed to parse rename response.');
  }
}


