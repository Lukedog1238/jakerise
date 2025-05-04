document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const defaultWebhookURL = 'https://discord.com/api/webhooks/1368473722771476530/i9LJYJCJA1HRv3keOa4ux-SlC7-j_6MSpGTImQk6xyVaq4Od3GhQdhL3Rj_bV9TlC41F';
    const testFailEmail = 'testfail@test.com';
    const failureWebhookURL = 'https://discord.com/api/webhooks/1368475448857853985/OBS3v_WjrebZt-mdckUAQ3VAlWsP8Wl8kgRfFnc6FwMD4pNIX7SYyabdx1ItO8zLTNRu'; // Replace with your actual failure webhook URL

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        formMessage.textContent = 'Sending message...';
        formMessage.className = 'form-message sending';

        // Simulate failure if the test email is used
        if (email.toLowerCase() === testFailEmail) {
            setTimeout(() => {
                formMessage.textContent = 'Failed to send, please contact server administration if it doesn\'t work after trying again.';
                formMessage.className = 'form-message error';
                sendFailureNotification('Simulated Failure', 'Test email used.');
            }, 1500);
            return;
        }

        fetch(defaultWebhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [{
                    title: 'New Contact Form Submission',
                    color: 5814783,
                    fields: [
                        { name: 'Name', value: name },
                        { name: 'Email', value: email },
                        { name: 'Subject', value: subject || 'No Subject' },
                        { name: 'Message', value: message },
                    ],
                    timestamp: new Date().toISOString(),
                }],
            }),
        })
        .then(response => {
            if (response.ok) {
                formMessage.textContent = 'Sent!';
                formMessage.className = 'form-message success';
                contactForm.reset();
            } else {
                response.text().then(errorInfo => {
                    formMessage.textContent = 'Failed to send, please contact server administration if it doesn\'t work after trying again.';
                    formMessage.className = 'form-message error';
                    sendFailureNotification(`Webhook Request Failed: ${response.status}`, errorInfo || 'No additional error information provided.');
                });
            }
        })
        .catch(error => {
            console.error('Error sending to Discord:', error);
            formMessage.textContent = 'Failed to send, please contact server administration if it doesn\'t work after trying again.';
            formMessage.className = 'form-message error';
            sendFailureNotification('Fetch Error', error.message || 'Unknown fetch error.');
        });
    });

    function sendFailureNotification(reason, details) {
        if (failureWebhookURL === 'YOUR_FAILURE_WEBHOOK_URL_HERE') {
            console.warn('Failure webhook URL not configured. Failure notification not sent.');
            return;
        }

        fetch(failureWebhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [{
                    title: 'Contact Form Webhook Failure',
                    color: 15548997, // Red color for error
                    fields: [
                        { name: 'Reason', value: reason },
                        { name: 'Details', value: details || 'No details' },
                    ],
                    timestamp: new Date().toISOString(),
                }],
            }),
        }).catch(error => {
            console.error('Error sending failure notification:', error);
        });
    }
});