document.getElementById('applicationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('firstName', document.getElementById('firstName').value);
  formData.append('lastName', document.getElementById('lastName').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('image1', document.getElementById('image1').files[0]);
  formData.append('image2', document.getElementById('image2').files[0]);

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      document.getElementById('message').innerHTML = '<p class="text-green-500">Application submitted successfully!</p>';
      document.getElementById('applicationForm').reset();
    } else {
      document.getElementById('message').innerHTML = `<p class="text-red-500">${result.error}</p>`;
    }
  } catch (error) {
    document.getElementById('message').innerHTML = '<p class="text-red-500">An error occurred. Please try again.</p>';
  }
});