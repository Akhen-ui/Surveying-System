// Wait for the entire HTML document to load before running the script
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Target the form and the table body using their IDs
    const healthForm = document.getElementById('healthForm');
    const tableBody = document.getElementById('healthTableBody');
    const tableStatus = document.getElementById('healthTableStatus');
    let recordCount = 0;

    // 2. Add an event listener for the form submission
    healthForm.addEventListener('submit', function(event) {
        // Prevent the page from reloading
        event.preventDefault(); 

        // 3. Gather the data from the inputs
        const fullName = document.getElementById('h_fullname').value;
        const age = document.getElementById('h_age').value;
        
        // Get the selected gender radio button
        const genderElement = document.querySelector('input[name="gender"]:checked');
        const gender = genderElement ? genderElement.value : 'Not specified';
        
        // Get the vaccination status
        const vaccStatusElement = document.getElementById('h_vacc_status');
        const vaccStatus = vaccStatusElement.options[vaccStatusElement.selectedIndex].text;
        
        // Get all checked symptom checkboxes
        const checkedSymptoms = document.querySelectorAll('input[name="symptom"]:checked');
        let symptomsArray = [];
        checkedSymptoms.forEach(function(checkbox) {
            if (checkbox.value === 'others') {
                const otherText = document.getElementById('sympOthersText').value;
                symptomsArray.push('Others: ' + otherText);
            } else {
                symptomsArray.push(checkbox.nextElementSibling.nextElementSibling.innerText);
            }
        });
        const symptoms = symptomsArray.length > 0 ? symptomsArray.join(', ') : 'None';

        // Get the current date for the submission
        const currentDate = new Date().toLocaleDateString();

        // 4. Update the Table
        recordCount++; // Increase the record number
        
        // Remove the "No records yet." message if it's the first submission
        if (recordCount === 1) {
            tableBody.innerHTML = ''; 
            tableStatus.style.display = 'none';
        }

        // Create a new row (<tr>)
        const newRow = document.createElement('tr');

        // Add the cells (<td>) to the row
        newRow.innerHTML = `
            <td>${recordCount}</td>
            <td>${fullName}</td>
            <td>${age}</td>
            <td style="text-transform: capitalize;">${gender}</td>
            <td>${vaccStatus}</td>
            <td>${symptoms}</td>
            <td>${currentDate}</td>
            <td><span style="color: green; font-weight: bold;">Submitted</span></td>
        `;

        // Append the new row to the table body
        tableBody.appendChild(newRow);

        // Optional: Show a success message using your toast div
        const toast = document.getElementById('toast');
        toast.innerText = "Record added successfully!";
        toast.style.display = "block";
        setTimeout(() => toast.style.display = "none", 3000);

        // Clear the form for the next user
        healthForm.reset();
    });

    // Clear Form Button Functionality
    const clearBtn = document.getElementById('clearHealthBtn');
    if(clearBtn) {
        clearBtn.addEventListener('click', function() {
            healthForm.reset();
        });
    }
});

function exportToCSV() {
  const fullname = document.getElementById("h_fullname").value;
  const age = document.getElementById("h_age").value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "";
  const address = document.getElementById("h_address").value;
  const vaccStatus = document.getElementById("h_vacc_status").value;
  const lastCheckup = document.getElementById("h_last_checkup").value;
  const notes = document.getElementById("h_notes").value;

  // Get selected symptoms
  const checkedSymptoms = [...document.querySelectorAll('input[name="symptom"]:checked')]
    .map(cb => cb.value === "others"
      ? document.getElementById("sympOthersText").value
      : cb.value)
    .join(" | ");

  const headers = "Full Name,Age,Gender,Address,Vaccination Status,Last Checkup,Symptoms,Notes";
  const row = `"${fullname}","${age}","${gender}","${address}","${vaccStatus}","${lastCheckup}","${checkedSymptoms}","${notes}"`;

  const csvContent = headers + "\n" + row;

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "health_record.csv";
  a.click();

  URL.revokeObjectURL(url);
}