// Simple Express server with mock auth and checkout endpoints.
// Save as server.js and run `node server.js`.


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
app.use(cors());
app.use(bodyParser.json());


let users = {}; // in-memory users: { id: { id, email, password } }
let nextUserId = 1;


app.post('/api/signup', (req, res)=>{
const { email, password } = req.body; if(!email || !password) return res.status(400).json({ message:'Email and password required.' });
if(Object.values(users).find(u=> u.email === email)) return res.status(409).json({ message:'User already exists.' });
const id = 'u'+(nextUserId++);
const user = { id, email, password };
users[id] = user;
return res.json({ message:'Account created (mock).', user: { id:user.id, email:user.email } });
});


app.post('/api/login', (req, res)=>{
const { email, password } = req.body; if(!email || !password) return res.status(400).json({ message:'Email and password required.' });
const user = Object.values(users).find(u=> u.email === email && u.password === password);
if(!user) return res.status(401).json({ message:'Invalid credentials.' });
return res.json({ message:'Login successful (mock).', user: { id:user.id, email:user.email } });
});


app.post('/api/checkout', (req, res)=>{
const { userId, cart } = req.body; if(!userId) return res.status(401).json({ message:'Login required.' });
if(!users[userId]) return res.status(401).json({ message:'User not found.' });
// simulate payment processing delay
setTimeout(()=>{
return res.json({ message:'Payment simulated successfully. Order created (mock).' });
}, 900);
});


const PORT = 3000;
app.listen(PORT, ()=> console.log('Mock backend running on http://localhost:'+PORT));