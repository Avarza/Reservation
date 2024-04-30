const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// Připojení k MongoDB
mongoose.connect("mongodb://localhost:27017/Prihlaseni")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));

// Schéma uživatele
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  verificationToken: String,
  isVerified: { type: Boolean, default: false }
});

// Model uživatele
const User = mongoose.model("User", userSchema);
const PORT = 8000;

const app = express();
//konverze na json 
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.set('view engine',  'ejs');
app.use(express.static("public"));


// Statické soubory
app.use(express.static(path.join(__dirname, 'public')));

// Úvodní stránka
app.get('/', (req, res) => {
    res.render('index');
});

// Stránka pro registraci
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Stránka pro přihlášení
app.get('/login', (req, res) => {
    res.render('login');
});

// Stránka pro reset hesla
app.get('/reset-password', (req, res) => {
    res.render('reset-password');
});
// Stránka pro reset hesla
app.get('/verify', (req, res) => {
    res.render('verify-email');
});

// Registrace uživatele
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
    // Kontrola délky hesla
    if (password.length < 8) {
        return res.status(400).send("Heslo musí mít alespoň 8 znaků.");
    }

    // Kontrola kombinace různých typů znaků
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        return res.status(400).send("Heslo musí obsahovat minimálně jedno velké písmeno, jedno malé písmeno, jednu číslici a jeden speciální znak.");
    }

        if (existingUser) {
            return res.status(400).send('Uživatel s touto e-mailovou adresou již existuje.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuidv4();

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken
        });

        // Odeslat e-mail s ověřovacím odkazem
        sendVerificationEmail(email, verificationToken);

        res.send('Registrace proběhla úspěšně. Zkontrolujte svůj e-mail pro ověření účtu.');
    } catch (error) {
        console.error('Chyba při registraci:', error);
        res.status(500).send('Došlo k chybě při registraci.');
    }
});

// Přihlášení uživatele
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Pokud uživatel není nalezen, poslat odpověď s kódem 404
            return res.status(404).send('Uživatel nenalezen.');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            // Pokud heslo nesouhlasí, poslat odpověď s kódem 401
            return res.status(401).send('Nesprávné heslo.');
        }

        // Pokud je přihlášení úspěšné, přesměrovat na domovskou stránku
        res.render('home');
    } catch (error) {
        // Pokud nastane interní chyba serveru, poslat odpověď s kódem 500
        res.status(500).send('Došlo k chybě při přihlašování.');
    }
});




// reset-password.js
const router = express.Router();

// Importovat funkci pro odeslání e-mailu pro resetování hesla
const { sendPasswordResetEmail } = require('./emailService');

// Koncový bod pro resetování hesla
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Zde můžete provést další kroky pro resetování hesla, jako je ověření existence uživatele v databázi
        // a odeslání e-mailu s instrukcemi pro resetování hesla

        // Odeslat e-mail pro resetování hesla
        await sendPasswordResetEmail(email);

        // Odpověď s úspěšným oznámením
        res.status(200).json({ message: 'Instrukce pro resetování hesla byly odeslány na váš e-mail.' });
    } catch (error) {
        console.error('Chyba při resetování hesla:', error);
        res.status(500).json({ error: 'Došlo k chybě při resetování hesla.' });
    }
});

module.exports = router;



app.listen(PORT, () => {
    console.log(`Server běží na adrese http://localhost:${PORT}`);
});