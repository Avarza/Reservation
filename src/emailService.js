const nodemailer = require('nodemailer');

// Konfigurace transporteru pro odesílání e-mailů
const transporter = nodemailer.createTransport({
    host: 'smtp.example.com', // SMTP server
    port: 587, // Port
    secure: false, // secure: true pro TLS, false pro nezašifrované spojení
    auth: {
        user: 'your_email@example.com', // E-mailová adresa pro odesílání
        pass: 'your_password' // Heslo e-mailového účtu
    }
});

// Funkce pro odeslání e-mailu pro resetování hesla
async function sendPasswordResetEmail(email, resetLink) {
    try {
        const mailOptions = {
            from: 'your_email@example.com', // E-mailová adresa odesílatele
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

module.exports = { sendPasswordResetEmail };
