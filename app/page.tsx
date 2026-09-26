'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Wallet, 
  LogOut, 
  MessageCircle, 
  ShoppingCart,
  Menu,
  X,
  CheckCircle2,
  Users,
  PlusCircle,
  KeyRound,
  Clock,
  Trash2,
  RefreshCw,
  UserPlus
} from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  desc: string;
  precio: number;
}

interface CredencialInventario {
  id: number;
  productoId: string;
  correo: string;
  pass: string;
  pin: string;
  estado: 'disponible' | 'vendida';
}

interface Compra {
  id: string;
  producto: string;
  correo: string;
  pass: string;
  pin: string;
  precio: number;
  vencimiento: string;
  estado: string;
}

interface Usuario {
  email: string;
  pass: string;
  nombre: string;
  rol: 'cliente' | 'admin';
  estado: 'activo' | 'pendiente';
  saldo: number;
}

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyYkIo1Evq1dNRo4j9djZEaCRPAPvOsNbxQr5kI2Zsaqlsny4giZOMSILVBCggeJECTnQ/exec";

export default function VisbackDashboard() {
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'app'>('login');
  
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);

  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [adminNuevoNombre, setAdminNuevoNombre] = useState('');
  const [adminNuevoEmail, setAdminNuevoEmail] = useState('');
  const [adminNuevoPass, setAdminNuevoPass] = useState('');
  const [adminNuevoEstado, setAdminNuevoEstado] = useState<'activo' | 'pendiente'>('activo');

  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState<'inicio' | 'compras' | 'billetera' | 'admin'>('inicio');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [usuariosRegistrados, setUsuariosRegistrados] = useState<Usuario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([
    { id: 'netflix', nombre: 'Netflix Perfil 1M', desc: 'Respetar 1 Dispositivo', precio: 55.00 },
    { id: 'disney', nombre: 'Disney+ 1M', desc: 'Respetar 1 Dispositivo', precio: 20.00 }
  ]);
  const [inventarioCredenciales, setInventarioCredenciales] = useState<CredencialInventario[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);

  const [productoAConfirmar, setProductoAConfirmar] = useState<Producto | null>(null);
  const [compraExitosa, setCompraExitosa] = useState<Compra | null>(null);

  const [nuevoProdId, setNuevoProdId] = useState('');
  const [nuevoProdNombre, setNuevoProdNombre] = useState('');
  const [nuevoProdDesc, setNuevoProdDesc] = useState('');
  const [nuevoProdPrecio, setNuevoProdPrecio] = useState('');

  const [credProdId, setCredProdId] = useState<string>('netflix');
  const [credCorreo, setCredCorreo] = useState('');
  const [credPass, setCredPass] = useState('');
  const [credPin, setCredPin] = useState('');
  const [textoMasivo, setTextoMasivo] = useState('');

  const [cantidadesRecarga, setCantidadesRecarga] = useState<{ [key: string]: string }>({});
  const whatsappNumber = "5217734092937";

  const sincronizarConGoogleSheets = () => {
    fetch(GOOGLE_SHEET_URL + "?t=" + Date.now())
      .then(res => res.json())
      .then((data: any) => {
        if (data.productos && Array.isArray(data.productos) && data.productos.length > 0) {
          const formP: Producto[] = data.productos.map((p: any) => ({
            id: String(p.id || '').trim().toLowerCase(),
            nombre: String(p.nombre || '').trim(),
            desc: String(p.desc || '').trim(),
            precio: Number(p.precio) || 0
          })).filter((p: any) => p.id && p.id !== '0');
          setProductos(formP);
          if (formP.length > 0 && !formP.some(p => p.id === credProdId)) {
            setCredProdId(formP[0].id);
          }
        }

        if (data.inventario && Array.isArray(data.inventario)) {
          const formI: CredencialInventario[] = data.inventario.map((i: any) => ({
            id: Number(i.id) || Date.now(),
            productoId: String(i.productoid || i.productoId || '').trim().toLowerCase(),
            correo: String(i.correo || '').trim(),
            pass: String(i.pass || '').trim(),
            pin: String(i.pin || 'N/A').trim(),
            estado: (String(i.estado || '').trim().toLowerCase() === 'vendida' ? 'vendida' : 'disponible')
          })).filter((i: any) => i.productoId && i.productoId !== '0');
          setInventarioCredenciales(formI);
        }

        if (data.usuarios && Array.isArray(data.usuarios)) {
          const formU: Usuario[] = data.usuarios.map((u: any) => ({
            email: String(u.email || '').trim(),
            pass: String(u.pass || '').trim(),
            nombre: String(u.nombre || '').trim(),
            rol: (String(u.rol || '').trim() === 'admin' ? 'admin' : 'cliente'),
            estado: (String(u.estado || '').trim() === 'pendiente' ? 'pendiente' : 'activo'),
            saldo: Number(u.saldo) || 0
          }));
          if (!formU.some(u => u.email === 'admin@visback.com')) {
            formU.unshift({ email: 'admin@visback.com', pass: 'admin123', nombre: 'Administrador', rol: 'admin', estado: 'activo', saldo: 500.00 });
          }
          setUsuariosRegistrados(formU);
        }
      })
      .catch((err: any) => console.error("Error al sincronizar:", err));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('visback_usuario_actual');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUsuarioActual(parsedUser);
          setViewMode('app');
          setActiveTab(parsedUser.rol === 'admin' ? 'admin' : 'inicio');
        } catch (e) {
          console.error(e);
        }
      }
    }
    sincronizarConGoogleSheets();
  }, []);

  useEffect(() => {
    if (activeTab === 'inicio' || activeTab === 'admin') {
      sincronizarConGoogleSheets();
    }
  }, [activeTab]);

  const obtenerStock = (productoId: string) => {
    const idBusqueda = String(productoId).trim().toLowerCase();
    return inventarioCredenciales.filter(c => {
      const idInv = String(c.productoId || '').trim().toLowerCase();
      const estado = String(c.estado || '').trim().toLowerCase();
      return idInv === idBusqueda && estado === 'disponible';
    }).length;
  };

  const handleLogin = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const emailVal = loginEmailRef.current?.value.trim() || '';
    const passVal = loginPasswordRef.current?.value.trim() || '';

    const encontrado = usuariosRegistrados.find(
      u => u.email.toLowerCase() === emailVal.toLowerCase() && u.pass === passVal
    ) || (emailVal === 'admin@visback.com' && passVal === 'admin123' ? { email: 'admin@visback.com', pass: 'admin123', nombre: 'Administrador', rol: 'admin', estado: 'activo', saldo: 500 } : null);

    if (!encontrado) {
      alert(`Acceso denegado. Correo o contraseña incorrectos.`);
      return;
    }
    setUsuarioActual(encontrado as Usuario);
    setViewMode('app');
    setActiveTab(encontrado.rol === 'admin' ? 'admin' : 'inicio');

    if (typeof window !== 'undefined') {
      localStorage.setItem('visback_usuario_actual', JSON.stringify(encontrado));
    }
  };

  const handleRegisterWhatsAppOnly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNombre || !regEmail || !regPassword) {
      alert("Completa todos los campos.");
      return;
    }

    const mensaje = encodeURIComponent(`Hola Visback Stream, me quiero registrar.\n\nNombre: ${regNombre}\nCorreo: ${regEmail}\nContraseña: ${regPassword}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank');
    setRegNombre('');
    setRegEmail('');
    setRegPassword('');
    setViewMode('login');
  };

  const agregarClienteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNuevoNombre || !adminNuevoEmail || !adminNuevoPass) {
      alert("Completa todos los campos del cliente.");
      return;
    }
    const nuevoCliente: Usuario = {
      email: adminNuevoEmail,
      pass: adminNuevoPass,
      nombre: adminNuevoNombre,
      rol: 'cliente',
      estado: adminNuevoEstado,
      saldo: 0.00
    };
    setUsuariosRegistrados(prev => [...prev, nuevoCliente]);
    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_usuario', ...nuevoCliente })
      });
    } catch (err) { console.error(err); }
    setAdminNuevoNombre('');
    setAdminNuevoEmail('');
    setAdminNuevoPass('');
    alert("¡Cliente agregado con éxito!");
  };

  const eliminarUsuario = async (email: string) => {
    if (email === 'admin@visback.com') {
      alert("No se puede eliminar al administrador principal.");
      return;
    }
    if (confirm(`¿Eliminar al usuario ${email}?`)) {
      setUsuariosRegistrados(prev => prev.filter(u => u.email !== email));
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_usuario', email })
        });
      } catch (err) { console.error(err); }
    }
  };

  const ajustarSaldoUsuario = async (email: string, tipo: 'agregar' | 'quitar') => {
    const montoStr = cantidadesRecarga[email];
    const monto = parseFloat(montoStr);
    if (!monto || isNaN(monto) || monto <= 0) {
      alert("Ingresa una cantidad válida de saldo.");
      return;
    }
    let saldoFinalCalculado = 0;
    const usuariosActualizados = usuariosRegistrados.map(u => {
      if (u.email === email) {
        let nuevoSaldo = tipo === 'agregar' ? u.saldo + monto : u.saldo - monto;
        if (nuevoSaldo < 0) nuevoSaldo = 0;
        saldoFinalCalculado = nuevoSaldo;
        if (usuarioActual?.email === email) {
          const actualizado = { ...u, saldo: nuevoSaldo };
          setUsuarioActual(actualizado);
          localStorage.setItem('visback_usuario_actual', JSON.stringify(actualizado));
        }
        return { ...u, saldo: nuevoSaldo };
      }
      return u;
    });
    setUsuariosRegistrados(usuariosActualizados);
    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_saldo', email, saldo: saldoFinalCalculado })
      });
    } catch (err) { console.error(err); }
    setCantidadesRecarga(prev => ({ ...prev, [email]: '' }));
    alert("¡Saldo actualizado con éxito!");
  };

  const agregarProductoAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoProdId || !nuevoProdNombre || !nuevoProdPrecio) {
      alert("Rellena el ID, nombre y precio.");
      return;
    }
    const nuevoProducto: Producto = {
      id: nuevoProdId.trim().toLowerCase(),
      nombre: nuevoProdNombre,
      desc: nuevoProdDesc || 'Servicio de streaming',
      precio: parseFloat(nuevoProdPrecio)
    };
    setProductos(prev => [...prev, nuevoProducto]);
    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_producto', ...nuevoProducto })
      });
    } catch (err) { console.error(err); }
    setNuevoProdId('');
    setNuevoProdNombre('');
    setNuevoProdDesc('');
    setNuevoProdPrecio('');
    alert("¡Producto agregado con éxito!");
  };

  const eliminarProducto = async (id: string) => {
    if (confirm("¿Eliminar este producto?")) {
      setProductos(prev => prev.filter(p => p.id !== id));
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_producto', id })
        });
      } catch (err) { console.error(err); }
    }
  };

  const agregarCredencialInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credCorreo || !credPass) {
      alert("Ingresa correo y contraseña.");
      return;
    }
    const nuevaCred: CredencialInventario = {
      id: Date.now(),
      productoId: String(credProdId).trim().toLowerCase(),
      correo: credCorreo,
      pass: credPass,
      pin: credPin || 'N/A',
      estado: 'disponible'
    };
    setInventarioCredenciales(prev => [...prev, nuevaCred]);
    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_credencial', ...nuevaCred })
      });
    } catch (err) { console.error(err); }
    setCredCorreo('');
    setCredPass('');
    setCredPin('');
    alert("¡Credencial agregada al inventario!");
    setTimeout(sincronizarConGoogleSheets, 1000);
  };

  const agregarCredencialMasiva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoMasivo.trim()) {
      alert("Pega al menos una credencial.");
      return;
    }
    const lineas = textoMasivo.split('\n');
    let agregadas = 0;
    const nuevasCreds: CredencialInventario[] = [];
    lineas.forEach((linea, index) => {
      const limpia = linea.trim();
      if (!limpia) return;
      const partes = limpia.split(/[,|\s]+/);
      if (partes.length >= 2) {
        nuevasCreds.push({
          id: Date.now() + index,
          productoId: String(credProdId).trim().toLowerCase(),
          correo: partes[0],
          pass: partes[1],
          pin: partes[2] || 'N/A',
          estado: 'disponible'
        });
        agregadas++;
      }
    });
    if (agregadas === 0) {
      alert("Formato no válido.");
      return;
    }
    setInventarioCredenciales(prev => [...prev, ...nuevasCreds]);
    for (const cred of nuevasCreds) {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_credencial', ...cred })
        });
      } catch (err) { console.error(err); }
    }
    setTextoMasivo('');
    alert(`¡Se agregaron ${agregadas} cuentas masivamente!`);
    setTimeout(sincronizarConGoogleSheets, 1500);
  };

  const eliminarCredencial = async (id: number) => {
    if (confirm("¿Eliminar esta credencial?")) {
      setInventarioCredenciales(prev => prev.filter(c => c.id !== id));
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_credencial', id })
        });
      } catch (err) { console.error(err); }
    }
  };

  const ejecutarCompraFinal = async () => {
    if (!productoAConfirmar || !usuarioActual) return;
    if (usuarioActual.saldo < productoAConfirmar.precio) {
      alert("Saldo insuficiente.");
      return;
    }
    const credencialDisponible = inventarioCredenciales.find(
      c => String(c.productoId).trim().toLowerCase() === String(productoAConfirmar.id).trim().toLowerCase() && String(c.estado).trim().toLowerCase() === 'disponible'
    );
    if (!credencialDisponible) {
      alert("Sin stock disponible.");
      setProductoAConfirmar(null);
      return;
    }
    setInventarioCredenciales(prev => prev.map(c => 
      c.id === credencialDisponible.id ? { ...c, estado: 'vendida' } : c
    ));
    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vender_credencial', id: credencialDisponible.id })
      });
    } catch (err) { console.error(err); }

    const nuevoSaldo = usuarioActual.saldo - productoAConfirmar.precio;
    const actualizado = { ...usuarioActual, saldo: nuevoSaldo };
    setUsuarioActual(actualizado);
    localStorage.setItem('visback_usuario_actual', JSON.stringify(actualizado));
    setUsuariosRegistrados(prev => prev.map(u => u.email === usuarioActual.email ? { ...u, saldo: nuevoSaldo } : u));
    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_saldo', email: usuarioActual.email, saldo: nuevoSaldo })
      });
    } catch (err) { console.error(err); }

    const nuevaCompra: Compra = {
      id: `#${Math.floor(100000 + Math.random() * 900000)}`,
      producto: productoAConfirmar.nombre,
      correo: credencialDisponible.correo,
      pass: credencialDisponible.pass,
      pin: credencialDisponible.pin,
      precio: productoAConfirmar.precio,
      vencimiento: '24/10/2026',
      estado: 'Activa'
    };
    setCompras(prev => [nuevaCompra, ...prev]);
    setProductoAConfirmar(null);
    setCompraExitosa(nuevaCompra);
  };

  if (viewMode === 'login') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl text-white mx-auto shadow-lg">V</div>
            <h1 className="text-2xl font-extrabold text-white">Visback Stream</h1>
          </div>
          <div className="space-y-4">
            <input type="email" placeholder="Correo electrónico" ref={loginEmailRef} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" />
            <input type="password" placeholder="Contraseña" ref={loginPasswordRef} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" />
            <button type="button" onClick={() => handleLogin()} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg hover:bg-purple-700 transition-all cursor-pointer">Entrar</button>
          </div>
          <div className="text-center pt-2">
            <button type="button" onClick={() => setViewMode('register')} className="text-purple-400 text-xs font-semibold hover:underline">¿No tienes cuenta? Solicítala por WhatsApp</button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'register') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <h1 className="text-xl font-bold text-white text-center">Solicitar Cuenta</h1>
          <form onSubmit={handleRegisterWhatsAppOnly} className="space-y-4">
            <input type="text" placeholder="Tu nombre completo" value={regNombre} onChange={e => setRegNombre(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />
            <input type="email" placeholder="Correo deseado" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />
            <input type="password" placeholder="Contraseña deseada" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 cursor-pointer">
              <MessageCircle size={18} /> Enviar Solicitud por WhatsApp
            </button>
          </form>
          <button onClick={() => setViewMode('login')} className="w-full text-slate-400 text-xs text-center hover:underline">Volver al Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {menuAbierto && <div onClick={() => setMenuAbierto(false)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-950 text-white p-5 z-50 transition-transform shadow-2xl flex flex-col justify-between ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h1 className="font-bold text-lg">Visback</h1>
            <button onClick={() => setMenuAbierto(false)} className="p-2 bg-slate-800 rounded-lg text-slate-300"><X size={20} /></button>
          </div>
          <nav className="space-y-2">
            {usuarioActual?.rol === 'admin' && (
              <button onClick={() => { setActiveTab('admin'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'admin' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>
                <Users size={20} /> Panel Admin
              </button>
            )}
            <button onClick={() => { setActiveTab('inicio'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'inicio' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>
              <ShoppingBag size={20} /> Catálogo
            </button>
            <button onClick={() => { setActiveTab('compras'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'compras' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>
              <ShoppingCart size={20} /> Mis Compras
            </button>
            <button onClick={() => { setActiveTab('billetera'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'billetera' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>
              <Wallet size={20} /> Billetera
            </button>
          </nav>
        </div>
        <button onClick={() => { setUsuarioActual(null); setViewMode('login'); localStorage.removeItem('visback_usuario_actual'); }} className="w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all">
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(true)} className="bg-slate-950 text-white px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer">
              <Menu size={18} className="text-purple-400" /> Menú
            </button>
            <button onClick={sincronizarConGoogleSheets} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <RefreshCw size={14} /> Sincronizar Stock
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-xl font-bold text-sm">
              ${usuarioActual?.saldo.toFixed(2) || '0.00'} MXN
            </span>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {activeTab === 'admin' && usuarioActual?.rol === 'admin' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-6 text-white shadow-xl">
                <h3 className="text-2xl font-bold">Panel de Administración 🛡️</h3>
                <p className="text-amber-100 text-sm mt-1">Control de productos, clientes, saldo e inventario vinculado por ID.</p>
              </div>

              {/* Agregar Producto */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <PlusCircle size={20} className="text-purple-600" /> Agregar Producto al Catálogo
                </h4>
                <form onSubmit={agregarProductoAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="text" placeholder="ID (ej. netflix)" value={nuevoProdId} onChange={e => setNuevoProdId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono" />
                  <input type="text" placeholder="Nombre (ej. Netflix 1M)" value={nuevoProdNombre} onChange={e => setNuevoProdNombre(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="number" placeholder="Precio ($ MXN)" value={nuevoProdPrecio} onChange={e => setNuevoProdPrecio(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="text" placeholder="Descripción" value={nuevoProdDesc} onChange={e => setNuevoProdDesc(e.target.value)} className="sm:col-span-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <button type="submit" className="sm:col-span-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer">Guardar Producto</button>
                </form>
              </div>

              {/* Agregar Credencial Individual */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <KeyRound size={20} className="text-amber-600" /> Agregar Cuenta Individual al Inventario
                </h4>
                <form onSubmit={agregarCredencialInventario} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select value={credProdId} onChange={e => setCredProdId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold">
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} (ID: {p.id}) - Stock: {obtenerStock(p.id)}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Correo" value={credCorreo} onChange={e => setCredCorreo(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="text" placeholder="Contraseña" value={credPass} onChange={e => setCredPass(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="text" placeholder="PIN (Opcional)" value={credPin} onChange={e => setCredPin(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <button type="submit" className="sm:col-span-2 lg:col-span-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer">Guardar Credencial y Aumentar Stock</button>
                </form>
              </div>

              {/* Carga Masiva */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <KeyRound size={20} className="text-purple-600" /> Carga Masiva de Credenciales
                </h4>
                <form onSubmit={agregarCredencialMasiva} className="space-y-4">
                  <div className="max-w-xs">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seleccionar Servicio:</label>
                    <select value={credProdId} onChange={e => setCredProdId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold">
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} (Stock: {obtenerStock(p.id)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cuentas (Una por renglón: correo pass pin):</label>
                    <textarea rows={4} placeholder="correo1@gmail.com pass123 1234&#10;correo2@gmail.com pass456 5678" value={textoMasivo} onChange={e => setTextoMasivo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono" />
                  </div>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-sm cursor-pointer">Cargar Masivamente</button>
                </form>
              </div>

              {/* Inventario Tabla */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800">Inventario Actual en la Nube ({inventarioCredenciales.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b text-xs">
                        <th className="p-3">ID Producto</th>
                        <th className="p-3">Credencial</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {inventarioCredenciales.map(c => (
                        <tr key={c.id}>
                          <td className="p-3 font-mono font-bold text-purple-600">{c.productoId}</td>
                          <td className="p-3 font-mono text-xs">{c.correo} / {c.pass}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{c.estado}</span></td>
                          <td className="p-3 text-center">
                            <button onClick={() => eliminarCredencial(c.id)} className="bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gestión de Usuarios y Saldo */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Users size={20} className="text-purple-600" /> Gestión de Clientes y Saldos ({usuariosRegistrados.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b text-xs">
                        <th className="p-3">Nombre / Correo</th>
                        <th className="p-3">Saldo Actual</th>
                        <th className="p-3">Recargar / Ajustar Saldo</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {usuariosRegistrados.map(u => (
                        <tr key={u.email}>
                          <td className="p-3">
                            <div className="font-bold">{u.nombre}</div>
                            <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                          </td>
                          <td className="p-3 font-bold text-emerald-600">${u.saldo.toFixed(2)}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <input type="number" placeholder="Monto" value={cantidadesRecarga[u.email] || ''} onChange={e => setCantidadesRecarga({ ...cantidadesRecarga, [u.email]: e.target.value })} className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs" />
                              <button onClick={() => ajustarSaldoUsuario(u.email, 'agregar')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer">+</button>
                              <button onClick={() => ajustarSaldoUsuario(u.email, 'quitar')} className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer">-</button>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {u.email !== 'admin@visback.com' && (
                              <button onClick={() => eliminarUsuario(u.email)} className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer">Eliminar</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inicio' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl">
                <h3 className="text-2xl font-bold">Bienvenido, {usuarioActual?.nombre} 👋</h3>
                <p className="text-purple-200 text-sm mt-1">Elige tus servicios de streaming favoritos con entrega automática instantánea.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productos.map(p => {
                  const stockActual = obtenerStock(p.id);
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stockActual > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          Stock: {stockActual}
                        </span>
                        <h4 className="font-bold text-slate-800 text-lg mt-3">{p.nombre}</h4>
                        <p className="text-slate-500 text-sm mb-4">{p.desc}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xl font-bold text-slate-900">${p.precio.toFixed(2)}</span>
                        <button onClick={() => setProductoAConfirmar(p)} disabled={stockActual === 0} className={`font-medium px-4 py-2 rounded-xl text-sm cursor-pointer transition-all ${stockActual > 0 ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                          {stockActual > 0 ? 'Comprar' : 'Agotado'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'compras' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-lg">Tus Compras y Credenciales Activas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b text-xs">
                      <th className="p-3">Pedido</th>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Credenciales</th>
                      <th className="p-3">Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {compras.map(c => (
                      <tr key={c.id}>
                        <td className="p-3 font-bold">{c.id}</td>
                        <td className="p-3 font-semibold">{c.producto}</td>
                        <td className="p-3 font-mono text-xs space-y-1">
                          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border">
                            <span>Correo: <strong>{c.correo}</strong></span>
                            <button onClick={() => { navigator.clipboard.writeText(c.correo); alert("¡Copiado!"); }} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer">Copiar</button>
                          </div>
                          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border">
                            <span>Pass: <strong>{c.pass}</strong></span>
                            <button onClick={() => { navigator.clipboard.writeText(c.pass); alert("¡Copiado!"); }} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer">Copiar</button>
                          </div>
                          {c.pin !== 'N/A' && (
                            <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border">
                              <span>PIN: <strong className="text-purple-600">{c.pin}</strong></span>
                              <button onClick={() => { navigator.clipboard.writeText(c.pin); alert("¡Copiado!"); }} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer">Copiar</button>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1 w-max">
                            <Clock size={14} /> {c.vencimiento}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'billetera' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Saldo disponible</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">${usuarioActual?.saldo.toFixed(2)} MXN</h3>
              </div>
              <a href={`https://wa.me/${whatsappNumber}?text=Hola%20Visback%20Stream,%20quiero%20recargar%20saldo.`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-sm cursor-pointer">
                <MessageCircle size={18} /> Solicitar Recarga por WhatsApp
              </a>
            </div>
          )}
        </main>
      </div>

      {productoAConfirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-extrabold">Confirmar Compra</h3>
            <p className="text-sm">¿Deseas comprar <strong>{productoAConfirmar.nombre}</strong> por ${productoAConfirmar.precio.toFixed(2)} MXN?</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setProductoAConfirmar(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 py-2.5 rounded-xl font-bold text-sm cursor-pointer">No</button>
              <button onClick={ejecutarCompraFinal} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold text-sm cursor-pointer shadow-md">Sí</button>
            </div>
          </div>
        </div>
      )}

      {compraExitosa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-extrabold">¡Compra Exitosa!</h3>
            <div className="bg-slate-50 p-4 rounded-2xl font-mono text-xs text-left space-y-2 border">
              <div>Correo: <strong>{compraExitosa.correo}</strong></div>
              <div>Contraseña: <strong>{compraExitosa.pass}</strong></div>
              {compraExitosa.pin !== 'N/A' && <div>PIN: <strong className="text-purple-600">{compraExitosa.pin}</strong></div>}
            </div>
            <button onClick={() => setCompraExitosa(null)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-bold text-sm cursor-pointer shadow-md">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}