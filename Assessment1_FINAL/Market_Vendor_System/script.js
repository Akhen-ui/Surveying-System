// ── PUBLIC MARKET VENDOR REGISTRATION — SCRIPT ───────────────

let vendors = [];

// ── TOAST HELPER ─────────────────────────────────────────────
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── FORM SUBMIT ──────────────────────────────────────────────
document.getElementById('vendorForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // ── READ VALUES ───────────────────────────────────────────
  const business   = document.getElementById('v_business').value.trim();
  const product    = document.getElementById('v_product').value;
  const stall      = document.getElementById('v_stall').value.trim();
  const permit     = document.getElementById('v_permit').value.trim();
  const vendorName = document.getElementById('v_vendor').value.trim();
  const contact    = document.getElementById('v_contact').value.trim();
  const sanitary   = document.getElementById('v_sanitary').value;
  const remarks    = document.getElementById('v_remarks').value.trim();

  const cleanChecked = Array.from(document.querySelectorAll('input[name="cleanliness"]:checked'));
  const cleanParts   = cleanChecked.map(cb => {
    if (cb.value === 'Others') {
      const txt = document.getElementById('cleanOthersText').value.trim();
      return txt ? 'Others: ' + txt : 'Others';
    }
    return cb.value;
  });
  const cleanliness = cleanParts.join(', ');

  // ── VALIDATION ────────────────────────────────────────────
  if (!business || !stall || !permit || !vendorName || !contact) {
    showToast('⚠️ Please fill in all required fields.');
    return;
  }
  if (!product) {
    showToast('⚠️ Please select a product category.');
    return;
  }
  if (!sanitary) {
    showToast('⚠️ Please select a sanitary practice rating.');
    return;
  }

  // ── BUILD VENDOR OBJECT ───────────────────────────────────
  const vendor = {
    id:          Date.now(),
    business,
    product,
    stall,
    permit,
    vendorName,
    contact,
    sanitary,
    cleanliness,
    remarks,
    registered:  new Date().toLocaleDateString()
  };

  // ── SAVE & RENDER ─────────────────────────────────────────
  vendors.push(vendor);
  showToast('✅ Vendor registered successfully!');
  this.reset();
  renderTable();
});

// ── CLEAR BUTTON ─────────────────────────────────────────────
document.getElementById('clearVendorBtn').addEventListener('click', function () {
  document.getElementById('vendorForm').reset();
  showToast('🔄 Form cleared.');
});

// ── RENDER TABLE ─────────────────────────────────────────────
function renderTable() {
  const tbody  = document.getElementById('vendorTableBody');
  const status = document.getElementById('vendorTableStatus');

  if (vendors.length === 0) {
    status.textContent = 'No vendors registered yet.';
    tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No vendors registered yet.</td></tr>';
    return;
  }

  status.textContent = `Showing ${vendors.length} registered vendor${vendors.length > 1 ? 's' : ''}.`;

  tbody.innerHTML = vendors.map((vendor, index) => {
    const sanitaryLower = vendor.sanitary.toLowerCase();
    const statusClass   = `status-${sanitaryLower}`;
    const isWarning     = vendor.sanitary === 'Poor' || vendor.sanitary === 'Fair';
    const rowClass      = isWarning ? 'row-warning' : '';

    return `
      <tr class="${rowClass}">
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(vendor.business)}</strong></td>
        <td>${escapeHtml(vendor.vendorName)}</td>
        <td>${escapeHtml(vendor.product)}</td>
        <td>${escapeHtml(vendor.permit)}</td>
        <td>${escapeHtml(vendor.stall)}</td>
        <td><span class="${statusClass}">${escapeHtml(vendor.sanitary)}</span></td>
        <td>${escapeHtml(vendor.registered)}</td>
        <td>
          <button class="btn-delete" onclick="deleteVendor(${vendor.id})">🗑 Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── DELETE VENDOR ─────────────────────────────────────────────
function deleteVendor(id) {
  if (confirm('Are you sure you want to delete this vendor?')) {
    vendors = vendors.filter(v => v.id !== id);
    renderTable();
    showToast('🗑 Vendor deleted.');
  }
}

// ── EXPORT TO CSV (reads from vendors array) (Edited Function) ───────────────────
function exportToCSV() {
  if (vendors.length === 0) {
    showToast('⚠️ No vendors to export! Register at least one vendor first.');
    return;
  }

  const headers = [
    'No.',
    'Business Name',
    'Vendor Name',
    'Product Type',
    'Stall Number',
    'Permit No.',
    'Contact',
    'Sanitary Rating',
    'Cleanliness',
    'Inspector Remarks',
    'Registered Date'
  ];

  const rows = vendors.map((v, i) => [
    i + 1,
    v.business,
    v.vendorName,
    v.product,
    v.stall,
    v.permit,
    v.contact,
    v.sanitary,
    v.cleanliness,
    v.remarks,
    v.registered
  ]);

  const csvContent = [headers, ...rows]
    .map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `Vendor_Registry_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('📥 CSV exported successfully!');
}

// ── SECURITY: ESCAPE HTML ─────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── INITIAL RENDER ────────────────────────────────────────────
renderTable();