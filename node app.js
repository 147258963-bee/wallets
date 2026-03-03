<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin | Wallet Points Pro</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background-color: #0f172a; color: white; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
        .tier-silver { background: linear-gradient(135deg, #64748b 0%, #334155 100%); }
        .tier-gold { background: linear-gradient(135deg, #f59e0b 0%, #92400e 100%); }
        .tier-platinum { background: linear-gradient(135deg, #6366f1 0%, #312e81 100%); }
        .hidden { display: none; }
    </style>
</head>
<body class="pb-20">

    <div id="loginScreen" class="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6">
        <div class="glass p-8 rounded-3xl w-full max-w-md text-center">
            <h1 class="text-3xl font-black text-indigo-400 mb-6">ADMIN ACCESS</h1>
            <input type="password" id="adminPass" placeholder="Clave de acceso" class="w-full p-4 rounded-xl bg-slate-800 border-none mb-4 outline-none">
            <button onclick="checkLogin()" class="w-full bg-indigo-600 py-4 rounded-xl font-bold">Entrar al Sistema</button>
        </div>
    </div>

    <div id="mainContent" class="hidden">
        <header class="p-6 flex justify-between items-center sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-40">
            <div>
                <h1 class="text-2xl font-black text-indigo-400">WALLET<span class="text-white">POINTS</span></h1>
                <p class="text-[10px] uppercase text-slate-500 font-bold">Business Intelligence v2.0</p>
            </div>
            <div class="flex gap-2">
                <button onclick="exportarDatos()" class="bg-slate-700 p-3 rounded-xl text-xs">💾 Exportar</button>
                <button onclick="toggleScanner()" class="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/40">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" stroke-width="2" stroke-linecap="round"></path></svg>
                </button>
            </div>
        </header>

        <main class="px-6 space-y-8">
            <section class="grid grid-cols-2 gap-4">
                <div class="glass p-4 rounded-2xl">
                    <p class="text-[10px] text-slate-400 uppercase font-bold">Clientes</p>
                    <h3 id="dashClientes" class="text-2xl font-black">0</h3>
                </div>
                <div class="glass p-4 rounded-2xl">
                    <p class="text-[10px] text-slate-400 uppercase font-bold">Puntos Totales</p>
                    <h3 id="dashPuntos" class="text-2xl font-black text-indigo-400">0</h3>
                </div>
            </section>

            <section class="glass p-6 rounded-[2rem]">
                <h2 class="text-sm font-bold text-slate-400 uppercase mb-4">Registro de Miembro</h2>
                <form id="mainForm" class="space-y-3">
                    <input type="text" id="nombre" placeholder="Nombre Completo" required class="w-full bg-slate-800/50 p-4 rounded-xl outline-none">
                    <div class="grid grid-cols-2 gap-3">
                        <input type="text" id="rut" placeholder="RUT (ID)" required class="w-full bg-slate-800/50 p-4 rounded-xl outline-none">
                        <input type="tel" id="telefono" placeholder="WhatsApp (Ej: 569...)" required class="w-full bg-slate-800/50 p-4 rounded-xl outline-none">
                    </div>
                    <div class="p-3 bg-slate-900/50 rounded-xl border border-indigo-500/30">
                        <label class="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" id="terms" required class="mt-1 accent-indigo-500">
                            <span class="text-[10px] text-slate-300">Confirmo que el cliente acepta unirse al plan de fidelización y ha leído las <b>Políticas de Privacidad y Protección de Datos</b>.</span>
                        </label>
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 py-4 rounded-xl font-black uppercase text-xs">Registrar e Iniciar Fidelización</button>
                </form>
            </section>

            <section class="glass p-6 rounded-[2rem]">
                <h2 class="text-sm font-bold text-slate-400 uppercase mb-4">Catálogo de Productos (<span id="countProd">0</span>/1000)</h2>
                <div class="space-y-2 mb-4">
                    <input type="text" id="p_nombre" placeholder="Nombre Producto" class="w-full bg-slate-800/50 p-3 rounded-lg outline-none text-sm">
                    <input type="text" id="p_desc" placeholder="Descripción" class="w-full bg-slate-800/50 p-3 rounded-lg outline-none text-sm">
                    <input type="number" id="p_precio" placeholder="Precio $" class="w-full bg-slate-800/50 p-3 rounded-lg outline-none text-sm">
                    <button onclick="agregarProducto()" class="w-full bg-emerald-600 py-2 rounded-lg text-xs font-bold">Añadir al Catálogo</button>
                </div>
                <div id="productContainer" class="max-h-40 overflow-y-auto space-y-2"></div>
            </section>

            <button onclick="enviarMasivo()" class="w-full bg-white text-black py-4 rounded-2xl font-black flex justify-center items-center gap-2">
                📢 ENVIAR OFERTA MASIVA WHATSAPP
            </button>

            <div id="walletList" class="grid gap-4"></div>
        </main>
    </div>

    <script>
        // --- BASE DE DATOS LOCAL ---
        let clientes = JSON.parse(localStorage.getItem('wp_clientes')) || [];
        let productos = JSON.parse(localStorage.getItem('wp_productos')) || [];
        const CLAVE_MAESTRA = "Socrates147258.#";

        // --- SEGURIDAD ---
        function checkLogin() {
            const pass = document.getElementById('adminPass').value;
            if(pass === CLAVE_MAESTRA) {
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('mainContent').classList.remove('hidden');
                render();
            } else {
                alert("Clave incorrecta. Acceso denegado.");
            }
        }

        // --- LÓGICA DE PRODUCTOS ---
        function agregarProducto() {
            if(productos.length >= 1000) return alert("Límite de catálogo alcanzado");
            const n = document.getElementById('p_nombre').value;
            const d = document.getElementById('p_desc').value;
            const p = document.getElementById('p_precio').value;

            if(!n || !p) return alert("Faltan datos");

            productos.push({ n, d, p });
            localStorage.setItem('wp_productos', JSON.stringify(productos));
            renderProductos();
        }

        function renderProductos() {
            const container = document.getElementById('productContainer');
            document.getElementById('countProd').innerText = productos.length;
            container.innerHTML = productos.map((prod, i) => `
                <div class="flex justify-between items-center bg-slate-800 p-2 rounded text-[10px]">
                    <span><b>${prod.n}</b> - $${prod.p}</span>
                    <button onclick="borrarProd(${i})" class="text-red-400">✖</button>
                </div>
            `).join('');
        }

        // --- LÓGICA DE CLIENTES ---
        document.getElementById('mainForm').onsubmit = (e) => {
            e.preventDefault();
            const nuevo = {
                nombre: document.getElementById('nombre').value,
                rut: document.getElementById('rut').value,
                telefono: document.getElementById('telefono').value,
                usos: 0,
                fecha: new Date().toLocaleDateString()
            };
            clientes.push(nuevo);
            localStorage.setItem('wp_clientes', JSON.stringify(clientes));
            render();
            e.target.reset();
        };

        function enviarMasivo() {
            if(clientes.length === 0) return alert("No hay clientes registrados.");
            const oferta = prompt("Escribe la oferta masiva:");
            if(!oferta) return;
            
            alert("Se abrirá WhatsApp para cada cliente. Por seguridad de spam, debes confirmar cada envío.");
            clientes.forEach(c => {
                const url = `https://wa.me/${c.telefono.replace('+', '')}?text=${encodeURIComponent(oferta)}`;
                window.open(url, '_blank');
            });
        }

        function render() {
            const list = document.getElementById('walletList');
            const dashC = document.getElementById('dashClientes');
            const dashP = document.getElementById('dashPuntos');
            
            list.innerHTML = '';
            let totalPuntos = 0;

            clientes.forEach((c, i) => {
                totalPuntos += c.usos;
                const card = document.createElement('div');
                card.className = `tier-silver p-5 rounded-3xl relative`;
                card.innerHTML = `
                    <h3 class="font-black uppercase">${c.nombre}</h3>
                    <p class="text-[10px] opacity-70">${c.rut} | ${c.telefono}</p>
                    <div class="flex justify-between items-center mt-4">
                        <span class="text-2xl font-black">${c.usos} PTS</span>
                        <button onclick="sumarPunto(${i})" class="bg-white text-black px-4 py-2 rounded-xl font-bold">+1 Punto</button>
                    </div>
                `;
                list.appendChild(card);
            });

            dashC.innerText = clientes.length;
            dashP.innerText = totalPuntos;
            renderProductos();
        }

        function sumarPunto(i) {
            clientes[i].usos++;
            localStorage.setItem('wp_clientes', JSON.stringify(clientes));
            render();
        }

        function exportarDatos() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clientes));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "base_datos_clientes.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }

        // Scanner (Simplificado para el ejemplo)
        const html5QrCode = new Html5Qrcode("reader");
        function toggleScanner() { /* Igual al código anterior */ }
    </script>
</body>
</html>
