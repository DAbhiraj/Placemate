// Test script for notification system
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testNotificationAPI() {
    try {
        console.log('Testing notification API...');

        // Create form data
        const form = new FormData();
        form.append('statusUpdate', 'shortlist');
        form.append('companyName', 'Google');
        form.append('customMessage', 'Test notification message');
        form.append('excelFile', fs.createReadStream('sample_students.csv'));

        // Send request
        const response = await axios.post('http://localhost:4000/api/admin/send-notification', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testNotificationAPI();
