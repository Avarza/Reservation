const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'jituskakroupova@gmail.com',
        pass: 'dghi buxp fmfk xryc'
    }
});

// fce pro ověření mailu
async function sendVerificationEmail(email, verificationToken) {
    try {
        const mailOptions = {
            from: 'jituskakroupova@gmail.com',
            to: email,
            subject: 'Ověření účtu',
            html: `<p>Klikněte na následující odkaz pro ověření účtu: <a href="http://localhost:8000/verify?token=${verificationToken}">Ověřit účet</a></p>`
        };

        // odeslání e-mailu
        const info = await transporter.sendMail(mailOptions);
        console.log('Ověřovací e-mail byl úspěšně odeslán:', info.response);
    } catch (error) {
        console.error('Chyba při odesílání ověřovacího e-mailu:', error);
    }
}


// fce pro reset hesla
async function sendPasswordResetEmail(email, resetLink) {
    try {
        const mailOptions = {
            from: 'jituskakroupova@gmail.com', to: email,
            subject: 'Reset Password',
            html: `<p>Klikněte na následující odkaz pro resetování hesla: <a href="http://localhost:8000/new-password?token=${resetLink}">Klikněte zde pro nastavení nového hesla</a></p>`
        };


        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail o resetování hesla byl úspěšně odeslán:', info.response);
    } catch (error) {
        console.error('Chyba při odesílání e-mailu o resetování hesla:', error);
    }
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
