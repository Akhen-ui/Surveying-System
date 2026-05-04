// ============================================================
//  PUBLIC MARKET VENDOR REGISTRATION — SCRIPT
// ============================================================

let vendors = JSON.parse(localStorage.getItem('vendors')) || [];

// ── FORM SUBMIT ──────────────────────────────────────────────
document.getElementById('vendorForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Collect checked cleanliness options
  const cleanliness = Array.from(document.querySelectorAll('input[name="cleanliness"]:checked'))
    .map(cb => cb.value)
    .join(', ');

  const vendor = {
    id:          Date.now(),
    business:    document.querySelector('input[name="business"]').value.trim(),
    product:     document.querySelector('select[name="product"]').value,
    stall:       document.querySelector('input[name="stall"]').value.trim(),
    permit:      document.querySelector('input[name="permit"]').value.trim(),
    vendorName:  document.querySelector('input[name="vendor"]').value.trim(),
    contact:     document.querySelector('input[name="contact"]').value.trim(),
    sanitary:    document.querySelector('select[name="sanitary"]').value,
    checkup:     document.querySelector('input[name="checkup"]').value,
    cleanliness: cleanliness,
    others:      document.querySelector('input[name="others"]').value.trim(),
    remarks:     document.querySelector('textarea[name="remarks"]').value.trim(),
    registered:  new Date().toLocaleDateString()
  };

  // ── VALIDATION ──────────────────────────────────────────────
  if (!vendor.business || !vendor.stall || !vendor.permit || !vendor.vendorName || !vendor.contact) {
    alert('Please fill in all required fields.');
    return;
  }

  if (!vendor.product || vendor.product === 'Select Category') {
    alert('Please select a product category.');
    return;
  }

  if (!vendor.sanitary || vendor.sanitary === 'Select Status') {
    alert('Please select a sanitary practice rating.');
    return;
  }

  if (!vendor.checkup) {
    alert('Please enter the last medical checkup date.');
    return;
  }

  // ── SAVE & RENDER ───────────────────────────────────────────
  vendors.push(vendor);
  localStorage.setItem('vendors', JSON.stringify(vendors));

  // Show success alert
  const alertBox = document.getElementById('successAlert');
  alertBox.style.display = 'block';
  setTimeout(() => alertBox.style.display = 'none', 3000);

  this.reset();
  renderTable();
});

// ── RENDER TABLE ─────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('vendorTableBody');

  if (vendors.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-message">No vendors registered yet.</td></tr>';
    return;
  }

  tbody.innerHTML = vendors.map((vendor, index) => {
    const statusClass = `status-${vendor.sanitary.toLowerCase()}`;
    const isWarning   = vendor.sanitary === 'Poor' || vendor.sanitary === 'Fair';
    const rowClass    = isWarning ? 'row-warning' : '';

    return `
      <tr class="${rowClass}">
        <td>${index + 1}</td>
        <td>${vendor.business}</td>
        <td>${vendor.vendorName}</td>
        <td>${vendor.product}</td>
        <td>${vendor.permit}</td>
        <td>${vendor.stall}</td>
        <td><span class="${statusClass}">${vendor.sanitary}</span></td>
        <td>${vendor.registered}</td>
        <td>
          <button class="btn-delete" onclick="deleteVendor(${vendor.id})">Delete</button>
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
  }
}

// ── EXPORT TO CSV / EXCEL ─────────────────────────────────────
function exportToExcel() {
  if (vendors.length === 0) {
    alert('No vendors to export!');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Business Name,Vendor Name,Product,Stall,Permit No.,Contact,Sanitation Rating,Medical Checkup,Cleanliness,Inspector Remarks,Registered Date\n';

  vendors.forEach(vendor => {
    const row = [
      `"${vendor.business}"`,
      `"${vendor.vendorName}"`,
      `"${vendor.product}"`,
      `"${vendor.stall}"`,
      `"${vendor.permit}"`,
      `"${vendor.contact}"`,
      `"${vendor.sanitary}"`,
      `"${vendor.checkup}"`,
      `"${vendor.cleanliness}"`,
      `"${vendor.remarks}"`,
      `"${vendor.registered}"`
    ].join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link       = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Vendor_Registry_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ── INITIAL RENDER ────────────────────────────────────────────
renderTable();
