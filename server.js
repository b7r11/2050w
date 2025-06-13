const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname)); // يخدم الملفات من نفس المجلد

// تحقق من الكود عند الإدخال
app.post('/verify-code', (req, res) => {
    const code = req.body.code;
    let codes = [];

    if (fs.existsSync('codes.json')) {
        codes = JSON.parse(fs.readFileSync('codes.json'));
    }

    if (codes.includes(code)) {
        // حذف الكود بعد استخدامه
        codes = codes.filter(c => c !== code);
        fs.writeFileSync('codes.json', JSON.stringify(codes, null, 2));
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// توريد يوزرات - تسليم 20 يوزر عشوائي وحذفهم من الملف
app.post('/supply-users', (req, res) => {
    const usersRaw = fs.readFileSync('users.json', 'utf-8');
    let users = usersRaw.trim() === '' ? [] : usersRaw.trim().split('\n').map(line => line.trim().replace(/^"|"$/g, ''));

    const selected = [];

    while (selected.length < 20 && users.length > 0) {
        const index = Math.floor(Math.random() * users.length);
        selected.push(users.splice(index, 1)[0]);
    }

    const usersToWrite = users.map(u => `"${u}"`).join('\n');
    fs.writeFileSync('users.json', usersToWrite);

    res.json({ success: true, users: selected });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));