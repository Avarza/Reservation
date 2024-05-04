const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'jituskakroupova@gmail.com',
        pass: 'dghi buxp fmfk xryc'
    }
});



// Funkce pro odeslání ověřovacího e-mailu
async function sendVerificationEmail(email, verificationToken) {
    try {
        const mailOptions = {
            from: 'jituskakroupova@gmail.com', // E-mailová adresa odesílatele
            to: email, // E-mailová adresa příjemce
            subject: 'Ověření účtu', // Předmět e-mailu
            html: `<p>Klikněte na následující odkaz pro ověření účtu: <a href="http://localhost:8000/verify?token=${verificationToken}">Ověřit účet</a>            </p>` // Obsah e-mailu s ověřovacím odkazem
        };

        // Odeslání e-mailu
        const info = await transporter.sendMail(mailOptions);
        console.log('Ověřovací e-mail byl úspěšně odeslán:', info.response);
    } catch (error) {
        console.error('Chyba při odesílání ověřovacího e-mailu:', error);
    }
}


// Funkce pro odeslání e-mailu pro resetování hesla
async function sendPasswordResetEmail(email, resetLink) {
    try {
        const mailOptions = {
            from: 'jituskakroupova@gmail.com', // E-mailová adresa odesílatele
            to: email, // E-mailová adresa příjemce
            subject: 'Reset Password', // Předmět e-mailu
            html: `<p>Klikněte na následující odkaz pro resetování hesla: <a href="${resetLink}">${resetLink}</a></p>` // Obsah e-mailu
        };

        // Odeslání e-mailu
        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail o resetování hesla byl úspěšně odeslán:', info.response);
    } catch (error) {
        console.error('Chyba při odesílání e-mailu o resetování hesla:', error);
    }
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
