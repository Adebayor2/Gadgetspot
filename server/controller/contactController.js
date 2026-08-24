const { sendContactEmail } = require('../services/emailService');

const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, subject and message are required',
            });
        }

        const emailResult = await sendContactEmail({ name, email, subject, message });

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send message. Please try again later.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully',
        });
    } catch (error) {
        console.error('Contact submit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.',
        });
    }
};

module.exports = { submitContact };
