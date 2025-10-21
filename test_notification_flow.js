// Test script for the complete notification flow
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testCompleteNotificationFlow() {
    try {
        console.log('🧪 Testing Complete Notification Flow...\n');

        // Step 1: Test sending notification via admin API
        console.log('1. Testing admin notification sending...');

        const form = new FormData();
        form.append('statusUpdate', 'shortlist');
        form.append('companyName', 'Google');
        form.append('customMessage', '');
        form.append('excelFile', fs.createReadStream('sample_students.csv'));

        const sendResponse = await axios.post('http://localhost:4000/api/admin/send-notification', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('✅ Notification sent successfully:', sendResponse.data);

        // Step 2: Test fetching notifications for a user
        console.log('\n2. Testing notification fetching...');

        // Assuming we have a user with ID 'u1' (from the sample data)
        const fetchResponse = await axios.get('http://localhost:4000/api/notifications/u1');
        console.log('✅ Notifications fetched:', fetchResponse.data);

        // Step 3: Test marking notification as read
        if (fetchResponse.data.length > 0) {
            console.log('\n3. Testing mark as read...');
            const notificationId = fetchResponse.data[0].id;
            const markReadResponse = await axios.put(`http://localhost:4000/api/notifications/${notificationId}/read`);
            console.log('✅ Notification marked as read:', markReadResponse.data);
        }

        console.log('\n🎉 All tests passed! Notification system is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testCompleteNotificationFlow();
