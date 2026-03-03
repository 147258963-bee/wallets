/**************************************************************
 * WALLETSPPOINTS - SISTEMA INTEGRADO (HTML + BACKEND)
 * Todo en un solo archivo para despliegue rápido.
 **************************************************************/

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const QRCode = require("qrcode");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "wp_2026_key";

// --- CONEXIÓN A BASE DE DATOS ---
mongoose.connect("mongodb://127.0.0.1:27017/walletspoints")
    .then(() => console.log("✅ Base de datos conectada"))
    .catch(err => console.log("❌ Error: MongoDB no detectado", err));

// --- MODELOS ---
const Negocio = mongoose.model("Negocio", new mongoose.Schema({
    nombre: String, email: String, password: String, comercioId: String, sector: String
}));

const Lectura = mongoose.model("Lectura", new mongoose.Schema({
    comercioId: String, sector: String, userId: String, fecha: { type: Date, default: Date.now }
}));

// --- API LOGIC ---
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const negocio = await Negocio.findOne({ email });
    if (!negocio || !(await bcrypt.compare(password, negocio.password))) return res.status(401).send("Error");
    const token = jwt.sign({ id: negocio._id, comercioId: negocio.comercioId, nombre: negocio.nombre, sector: negocio.sector }, SECRET);
    res.json({ token });
});

app.get("/api/data", async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, SECRET);
        const total = await Lectura.countDocuments({ comercioId: decoded.comercioId });
        const hoy = await Lectura.countDocuments({ comercioId: decoded.comercioId, fecha: { $gte: new Date().setHours(0,0,0,0) } });
        const qr = await QRCode.toDataURL(`wp:${decoded.sector}:${decoded.comercioId}`);
        res.json({ total, hoy, nombre: decoded.nombre, sector: decoded.sector, qr, id: decoded.comercioId });
    } catch (e) { res.status(401).send("No autorizado"); }
});

// --- INTERFAZ HTML (LO QUE SE VE EN EL NAVEGADOR) ---
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>WalletsPoints Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #0f172a; color: white; font-family: 'Inter', sans-serif; }
        .glass-card { 
            background: rgba(30, 41, 59, 0.7); 
            backdrop-filter: blur(10px); 
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 2rem;
        }
        .btn-primary {
            background: #f59e0b;
            color: #000;
            font-weight: 800;
            transition: all 0.2s;
        }
        .btn-primary:active { transform: scale(0.95); }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-4">

    <div id="login-screen" class="w-full max-w-sm glass-card p-8 shadow-2xl">
        <div class="text-center mb-8">
            <h1 class="text-5xl font-black text-yellow-500 tracking-tighter italic">WP🔥</h1>
            <p class="text-gray-400 text-sm mt-2">SISTEMA DE PUNTOS QR</p>
        </div>
        
        <div class="space-y-4">
            <input id="email" type="email" placeholder="Correo electrónico" class="w-full bg-slate-800 p-4 rounded-2xl border border-slate-700 outline-none focus:border-yellow-500">
            <input id="pass" type="password" placeholder="Contraseña" class="w-full bg-slate-800 p-4 rounded-2xl border border-slate-700 outline-none focus:border-yellow-500">
            <button onclick="handleLogin()" class="w-full btn-primary p-4 rounded-2xl shadow-lg shadow-yellow-500/20">ACCEDER AL PANEL</button>
        </div>
        <p class="text-center text-[10px] text-gray-500 mt-6 uppercase tracking-widest">WalletsPoints v1.0 - 2026</p>
    </div>

    <div id="main-dashboard" class="hidden w-full max-w-sm space-y-4">
        <div class="glass-card p-6 flex justify-between items-center">
            <div>
                <h2 id="biz-name" class="text-2xl font-bold text-white leading-tight"></h2>
                <span id="biz-sector" class="text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter"></span>
            </div>
            <button onclick="logout()" class="text-red-400 text-xs font-bold bg-red-400/10 px-3 py-1 rounded-lg">SALIR</button>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="glass-card p-5 text-center">
                <p class="text-gray-400 text-[10px] uppercase font-bold">Total Acumulado</p>
                <p id="kpi-total" class="text-3xl font-black text-yellow-500">0</p>
            </div>
            <div class="glass-card p-5 text-center border-b-4 border-green-500">
                <p class="text-gray-400 text-[10px] uppercase font-bold">Escaneos Hoy</p>
                <p id="kpi-hoy" class="text-3xl font-black text-green-400">0</p>
            </div>
        </div>

        <div class="bg-white p-8 rounded-[2.5rem] flex flex-col items-center shadow-2xl">
            <p class="text-slate-900 font-black text-xs mb-6 border-b-2 border-slate-100 pb-2">MOSTRAR AL CLIENTE</p>
            <div class="p-2 border-4 border-slate-900 rounded-xl">
                <img id="qr-display" src="" class="w-full aspect-square">
            </div>
            <p id="id-display" class="text-[9px] text-slate-400 mt-6 font-mono font-bold tracking-widest"></p>
        </div>
    </div>

    <script>
        const API = "/api";

        async function handleLogin() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('pass').value;
            
            try {
                const res = await fetch(API + '/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email, password})
                });
                
                if(res.ok) {
                    const data = await res.json();
                    localStorage.setItem('wp_auth_token', data.token);
                    renderApp();
                } else {
                    alert("⚠️ Error: Credenciales no válidas.");
                }
            } catch (err) { alert("Error de conexión con el servidor"); }
        }

        async function renderApp() {
            const token = localStorage.getItem('wp_auth_token');
            if(!token) return;

            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-dashboard').classList.remove('hidden');

            const res = await fetch(API + '/data', { 
                headers: {'Authorization': token} 
            });
            const data = await res.json();
            
            document.getElementById('biz-name').innerText = data.nombre;
            document.getElementById('biz-sector').innerText = data.sector;
            document.getElementById('kpi-total').innerText = data.total;
            document.getElementById('kpi-hoy').innerText = data.hoy;
            document.getElementById('qr-display').src = data.qr;
            document.getElementById('id-display').innerText = "ID DISPOSITIVO: " + data.id;
        }

        function logout() {
            localStorage.clear();
            location.reload();
        }

        // Auto-login si ya existe token
        if(localStorage.getItem('wp_auth_token')) renderApp();
    </script>
</body>
</html>
    `);
});

// --- INICIO DEL SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log("------------------------------------------");
    console.log("🔥 WALLETSPPOINTS SYSTEM ONLINE");
    console.log("📍 Accede aquí: http://localhost:" + PORT);
    console.log("------------------------------------------");
});