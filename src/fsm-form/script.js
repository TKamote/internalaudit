document.addEventListener('DOMContentLoaded', function() {
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  
  // Form submission handler
  document.getElementById('inspectionForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Collect form data
      const formData = new FormData(this);
      const inspectionData = {};
      
      for (const [key, value] of formData.entries()) {
          inspectionData[key] = value;
      }
      
      // In a real application, you would send this data to a server
      console.log('Inspection Data:', inspectionData);
      
      // Show success message
      const statusMessage = document.getElementById('statusMessage');
      statusMessage.style.display = 'block';
      statusMessage.textContent = 'Inspection saved successfully!';
      
      // In a real application, you might redirect or clear the form
      setTimeout(() => {
          statusMessage.style.display = 'none';
      }, 3000);
  });
});