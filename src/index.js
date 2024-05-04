const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

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

app.set('view engine', 'ejs');
app.use(express.static("public"));


// Statické soubory
app.use(express.static(path.join(__dirname, 'public')));

// Úvodní stránka
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/gallery', (req, res) => {
    res.render('gallery');
});

app.get('/contacts', (req, res) => {
    res.render('contacts');
});
/* // vyhledávání
app.get('/search', (req, res) => {
    res.render('search');
}); */

app.get('/signup', (req, res) => {
    res.render('signup');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/reset-password', (req, res) => {
    res.render('reset-password');
});
app.get('/new-password', (req, res) => {
    res.render('new-password');
});
app.get('/add-room', (req, res) => {
    res.render('add-room');
});
app.get('/verify', (req, res) => {
    res.render('verify-email');
});
app.get('/detail-pokoje', (req, res) => {
    res.render('detail-pokoje');
});
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        // Kontrola délky hesla
          if (password.length < 8) {
             return res.status(400).send("Heslo musí mít alespoň 8 znaků.");
         }

        // Kontrola  různých typů znaků
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

        const { sendVerificationEmail } = require('./emailService.js');

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
            return res.status(404).send('Uživatel nenalezen.');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            // špatné heslo
            return res.status(401).send('Nesprávné heslo.');
        }

        // po přihlášení přesměrovat na home stránku
        res.render('home');
    } catch (error) {
        // interní chyba serveru
        res.status(500).send('Došlo k chybě při přihlašování.');
    }
});




// import fce pro poslání mailu na reset hesla
const { sendPasswordResetEmail } = require('./emailService');

// generování resetovacího tokenu
function generateResetToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 20; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;

}
// middleware pro analýzu těla požadavku
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// generování tokenu k resetování hesla
app.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        const resetToken = generateResetToken();
        await sendPasswordResetEmail(email, resetToken);
        res.status(200).json({ message: 'Instrukce pro resetování hesla byly odeslány na váš e-mail.' });
    } catch (error) {
        console.error('Chyba při resetování hesla:', error);
        res.status(500).json({ error: 'Došlo k chybě při resetování hesla.' });
    }
});

// import modelu Pokoj
const Pokoj = require('./models/Pokoj');

//  přidání pokoje
app.post('/add-room', async (req, res) => {
    try {
        const { nazev, popis, cena, fotky } = req.body;

        const novyPokoj = new Pokoj({
            nazev,
            popis,
            cena,
            fotky: fotky.split(',') // rozdělení fotek
        });

        // přidání pokoje do databáze
        await novyPokoj.save();

        // info pro klienta
        res.send('Pokoj byl úspěšně přidán.');
    } catch (error) {
        console.error('Chyba při přidávání pokoje:', error);
        res.status(500).send('Došlo k chybě při přidávání pokoje.');
    }
});

// schéma pro token
const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        expires: '1h',
        default: Date.now
    }
});

// model Tokenu
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// zadání nového hesla
app.post('/new-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        // najde resetovací token v databázi
        const resetToken = await Token.findOne({ token });

        // nenalezen token
        if (!resetToken) {
            return res.status(400).send('Invalid or expired reset token.');
        }

        // aktualizace hesla v db
        const user = await User.findById(resetToken.userId);

        // špatný uživatel
        if (!user) {
            return res.status(400).send('User not found.');
        }

        // nastavení new hesla uživatele
        user.password = password;

        // uložení do db
        await user.save();

        // mazání resetTokenu
        await resetToken.remove();

        // info pro uživatele
        res.status(200).send('Your password has been successfully updated.');
    } catch (error) {
        console.error('Error setting new password:', error);
        res.status(500).send('An error occurred while setting your new password.');
    }
});
app.listen(PORT, () => {
    console.log(`Server běží na adrese http://localhost:${PORT}`);
});
