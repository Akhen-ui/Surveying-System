// ── BARANGAY HEALTH MONITORING — SCRIPT ──────────────────────

// In-memory store for all submitted health records
let healthRecords = [];

// ── TOAST HELPER ─────────────────────────────────────────────
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ── FORM SUBMIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

    const healthForm  = document.getElementById('healthForm');
    const tableBody   = document.getElementById('healthTableBody');
    const tableStatus = document.getElementById('healthTableStatus');

    healthForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // ── READ VALUES ──────────────────────────────────────────
    const fullName = document.getElementById('h_fullname').value.trim();
    const age      = document.getElementById('h_age').value.trim();
    const address  = document.getElementById('h_address').value.trim();

    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender   = genderEl ? genderEl.value : '';

    const vaccStatusEl = document.getElementById('h_vacc_status');
    const vaccStatus   = vaccStatusEl.options[vaccStatusEl.selectedIndex].text;
    const vaccValue    = vaccStatusEl.value;

    const lastCheckup = document.getElementById('h_last_checkup').value;
    const notes       = document.getElementById('h_notes').value.trim();

    // Build symptoms list
    const checkedSymptoms = document.querySelectorAll('input[name="symptom"]:checked');
    let symptomsArray = [];
    checkedSymptoms.forEach(function (cb) {
        if (cb.value === 'others') {
        const txt = document.getElementById('sympOthersText').value.trim();
        if (txt) symptomsArray.push('Others: ' + txt);
        } else {
        // grab the visible label span (skip the dot span)
        const labelSpan = cb.parentElement.querySelectorAll('span:not(.dot)')[0];
        symptomsArray.push(labelSpan ? labelSpan.innerText : cb.value);
        }
    });
    const symptoms = symptomsArray.length > 0 ? symptomsArray.join(', ') : 'None';

    // ── BASIC VALIDATION ─────────────────────────────────────
    if (!fullName || !age || !address) {
        showToast('⚠️ Please fill in all required fields.');
        return;
    }
    if (!gender) {
        showToast('⚠️ Please select a gender.');
        return;
    }
    if (!vaccValue) {
        showToast('⚠️ Please select a vaccination status.');
        return;
    }
    if (!lastCheckup) {
        showToast('⚠️ Please enter the last medical checkup date.');
        return;
    }
    if (checkedSymptoms.length === 0) {
        showToast('⚠️ Please select at least one symptom (or "None").');
        return;
    }

    // ── SAVE RECORD ───────────────────────────────────────────
    const record = {
        id:          Date.now(),
        fullName,
        age,
        gender,
        address,
        vaccStatus,
        vaccValue,
        lastCheckup,
        symptoms,
        notes,
        date:        new Date().toLocaleDateString()
    };

    healthRecords.push(record);
    renderHealthTable();

    showToast('✅ Health record submitted successfully!');
    healthForm.reset();
    });

  // ── CLEAR BUTTON ─────────────────────────────────────────────
    const clearBtn = document.getElementById('clearHealthBtn');
    if (clearBtn) {
    clearBtn.addEventListener('click', function () {
        healthForm.reset();
        showToast('🔄 Form cleared.');
    });
    }

  // ── PRINT BUTTON ─────────────────────────────────────────────
    const printBtn = document.getElementById('printHealthBtn');
    if (printBtn) {
    printBtn.addEventListener('click', function () {
        window.print();
    });
    }

  // ── RENDER TABLE (initial) ────────────────────────────────────
    renderHealthTable();
});

// ── RENDER HEALTH TABLE ───────────────────────────────────────
function renderHealthTable() {
    const tbody   = document.getElementById('healthTableBody');
    const status  = document.getElementById('healthTableStatus');

    if (healthRecords.length === 0) {
        status.textContent = 'No records yet.';
        status.style.display = '';
        tbody.innerHTML = '';
        return;
    }

    status.style.display = 'none';

    tbody.innerHTML = healthRecords.map((rec, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(rec.fullName)}</td>
            <td>${escapeHtml(rec.age)}</td>
            <td style="text-transform:capitalize;">${escapeHtml(rec.gender)}</td>
            <td>${escapeHtml(rec.vaccStatus)}</td>
            <td>${escapeHtml(rec.symptoms)}</td>
            <td>${escapeHtml(rec.date)}</td>
            <td class="status-submitted">Submitted</td>
        </tr>
    `).join('');
}

// ── EXPORT TO CSV (reads from healthRecords array) (Edited Function) ────────────
function exportToCSV() {
    if (healthRecords.length === 0) {
        showToast('⚠️ No records to export! Submit at least one record first.');
        return;
    }

    const headers = [
    'No.',
    'Full Name',
    'Age',
    'Gender',
    'Address',
    'Vaccination Status',
    'Last Checkup',
    'Symptoms',
    'Notes',
    'Date Submitted'
    ];

    const rows = healthRecords.map((rec, i) => [
    i + 1,
    rec.fullName,
    rec.age,
    rec.gender,
    rec.address,
    rec.vaccStatus,
    rec.lastCheckup,
    rec.symptoms,
    rec.notes,
    rec.date
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
    a.download = `Health_Records_${new Date().toISOString().split('T')[0]}.csv`;
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
