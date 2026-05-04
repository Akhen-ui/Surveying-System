//  PUBLIC MARKET VENDOR REGISTRATION — SCRIPT

let vendors = JSON.parse(localStorage.getItem('vendors')) || [];

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

  // ── READ VALUES (using new IDs from updated HTML) ──────────
  const business   = document.getElementById('v_business').value.trim();
  const product    = document.getElementById('v_product').value;
  const stall      = document.getElementById('v_stall').value.trim();
  const permit     = document.getElementById('v_permit').value.trim();
  const vendorName = document.getElementById('v_vendor').value.trim();
  const contact    = document.getElementById('v_contact').value.trim();
  const sanitary   = document.getElementById('v_sanitary').value;
  const remarks    = document.getElementById('v_remarks').value.trim();

  const cleanliness = Array.from(document.querySelectorAll('input[name="cleanliness"]:checked'))
    .map(cb => cb.value)
    .join(', ');

  const othersText = document.getElementById('cleanOthersText').value.trim();

  // ── VALIDATION ─────────────────────────────────────────────
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

  // ── BUILD VENDOR OBJECT ────────────────────────────────────
  const vendor = {
    id:          Date.now(),
    business,
    product,
    stall,
    permit,
    vendorName,
    contact,
    sanitary,
    cleanliness: cleanliness + (othersText ? `, Others: ${othersText}` : ''),
    remarks,
    registered:  new Date().toLocaleDateString()
  };

  // ── SAVE & RENDER ───────────────────────────────────────────
  vendors.push(vendor);
  localStorage.setItem('vendors', JSON.stringify(vendors));

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
    localStorage.setItem('vendors', JSON.stringify(vendors));
    renderTable();
    showToast('🗑 Vendor deleted.');
  }
}

// ── EXPORT TO EXCEL (.xlsx) ───────────────────────────────────
function exportToExcel() {
  if (vendors.length === 0) {
    showToast('⚠️ No vendors to export!');
    return;
  }

  // Build worksheet rows
  const headers = [
    '#', 'Business Name', 'Vendor Name', 'Product', 'Stall',
    'Permit No.', 'Contact', 'Sanitation Rating',
    'Cleanliness', 'Inspector Remarks', 'Registered Date'
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

  // Convert to worksheet XML
  const wsData = [headers, ...rows];
  const xmlRows = wsData.map(row =>
    '<Row>' + row.map(cell => {
      const isNum = typeof cell === 'number';
      return isNum
        ? `<Cell><Data ss:Type="Number">${cell}</Data></Cell>`
        : `<Cell><Data ss:Type="String">${String(cell).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</Data></Cell>`;
    }).join('') + '</Row>'
  ).join('');

  const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#5C3820" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF" ss:Bold="1"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Registered Vendors">
    <Table>
      ${xmlRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.download = `Vendor_Registry_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('📊 Exported to Excel successfully!');
}

// ── EXPORT BUTTON LISTENER ────────────────────────────────────
document.getElementById('exportVendorBtn').addEventListener('click', exportToExcel);

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
