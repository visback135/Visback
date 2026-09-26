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
  UserPlus,
  KeyRound,
  Clock,
  Trash2
} from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  desc: string;
  precio: number;
}

interface CredencialInventario {
  id: number;
  productoId: number;
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

  const [usuariosRegistrados, setUsuariosRegistrados] = useState<Usuario[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visback_usuarios_db');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [
      { email: 'admin@visback.com', pass: 'admin123', nombre: 'Administrador', rol: 'admin', estado: 'activo', saldo: 500.00 },
      { email: 'cliente@visback.com', pass: '123456', nombre: 'Brandon Beltran', rol: 'cliente', estado: 'activo', saldo: 125.00 }
    ];
  });

  const [productos, setProductos] = useState<Producto[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visback_prods_db');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [
      { id: 1, nombre: 'Netflix Perfil 1M', desc: 'Respetar 1 Dispositivo', precio: 45.00 },
      { id: 2, nombre: 'Crunchyroll Fan 1M', desc: 'Cuenta Completa 1 Mes', precio: 38.00 },
      { id: 3, nombre: 'Max Perfil 1M', desc: 'Respetar 1 Dispositivo', precio: 9.00 },
      { id: 4, nombre: 'ViX Premium 1M', desc: 'Premium 5 Perfiles', precio: 10.00 },
    ];
  });

  const [inventarioCredenciales, setInventarioCredenciales] = useState<CredencialInventario[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visback_inv_db');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [];
  });

  const [compras, setCompras] = useState<Compra[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visback_compras_db');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('visback_usuarios_db', JSON.stringify(usuariosRegistrados));
    }
  }, [usuariosRegistrados]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('visback_prods_db', JSON.stringify(productos));
    }
  }, [productos]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('visback_inv_db', JSON.stringify(inventarioCredenciales));
    }
  }, [inventarioCredenciales]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('visback_compras_db', JSON.stringify(compras));
    }
  }, [compras]);

  const [credProdId, setCredProdId] = useState<number>(1);

  useEffect(() => {
    if (productos.length > 0 && (credProdId === 1 || !productos.some(p => p.id === credProdId))) {
      setCredProdId(productos[0].id);
    }
  }, [productos]);

  const sincronizarConGoogleSheets = () => {
    fetch(GOOGLE_SHEET_URL + "?t=" + Date.now())
      .then(res => res.json())
      .then(data => {
        if (data.usuarios && Array.isArray(data.usuarios) && data.usuarios.length > 0) {
          const formU: Usuario[] = data.usuarios.map((u: any) => ({
            email: u.email || '',
            pass: u.pass || '',
            nombre: u.nombre || '',
            rol: (u.rol === 'admin' ? 'admin' : 'cliente'),
            estado: (u.estado === 'pendiente' ? 'pendiente' : 'activo'),
            saldo: Number(u.saldo) || 0
          }));
          if (!formU.some(u => u.email === 'admin@visback.com')) {
            formU.unshift({ email: 'admin@visback.com', pass: 'admin123', nombre: 'Administrador', rol: 'admin', estado: 'activo', saldo: 500.00 });
          }
          setUsuariosRegistrados(formU);
        }

        if (data.productos && Array.isArray(data.productos) && data.productos.length > 0) {
          const formP: Producto[] = data.productos.map((p: any) => ({
            id: Number(p.id) || Date.now(),
            nombre: p.nombre || '',
            desc: p.desc || '',
            precio: Number(p.precio) || 0
          }));
          setProductos(formP);
          if (formP.length > 0 && !formP.some(p => p.id === credProdId)) {
            setCredProdId(formP[0].id);
          }
        }

        if (data.inventario && Array.isArray(data.inventario) && data.inventario.length > 0) {
          const formI: CredencialInventario[] = data.inventario.map((i: any) => ({
            id: Number(i.id) || Date.now(),
            productoId: Number(i.productoId) || 0,
            correo: i.correo || '',
            pass: i.pass || '',
            pin: i.pin || 'N/A',
            estado: (String(i.estado).trim().toLowerCase() === 'vendida' ? 'vendida' : 'disponible')
          }));
          setInventarioCredenciales(formI);
        }
      })
      .catch(err => console.error("Aviso: Usando respaldo local", err));
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

  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState<'inicio' | 'compras' | 'billetera' | 'admin'>('inicio');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [productoAConfirmar, setProductoAConfirmar] = useState<Producto | null>(null);
  const [compraExitosa, setCompraExitosa] = useState<Compra | null>(null);

  const [nuevoProdNombre, setNuevoProdNombre] = useState('');
  const [nuevoProdDesc, setNuevoProdDesc] = useState('');
  const [nuevoProdPrecio, setNuevoProdPrecio] = useState('');

  const [credCorreo, setCredCorreo] = useState('');
  const [credPass, setCredPass] = useState('');
  const [credPin, setCredPin] = useState('');
  const [textoMasivo, setTextoMasivo] = useState('');

  const [cantidadesRecarga, setCantidadesRecarga] = useState<{ [key: string]: string }>({});
  const whatsappNumber = "5217734092937";

  const obtenerStock = (productoId: number) => {
    return inventarioCredenciales.filter(c => Number(c.productoId) === Number(productoId) && String(c.estado).trim().toLowerCase() === 'disponible').length;
  };

  const handleLogin = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const emailVal = loginEmailRef.current?.value.trim() || '';
    const passVal = loginPasswordRef.current?.value.trim() || '';

    const encontrado = usuariosRegistrados.find(
      u => u.email.toLowerCase() === emailVal.toLowerCase() && u.pass === passVal
    );

    if (!encontrado) {
      alert(`Acceso denegado. Correo o contraseña incorrectos.`);
      return;
    }
    setUsuarioActual(encontrado);
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

    const mensaje = encodeURIComponent(`Hola Visback Stream, me quiero registrar. \n\nNombre: ${regNombre}\nCorreo deseado: ${regEmail}\nContraseña deseada: ${regPassword}\n\nSolicito la creación y activación de mi cuenta.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank');

    setRegNombre('');
    setRegEmail('');
    setRegPassword('');
    setViewMode('login');
  };

  const agregarClienteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNuevoNombre || !adminNuevoEmail || !adminNuevoPass) {
      alert("Por favor completa el nombre, correo y contraseña del cliente.");
      return;
    }
    if (usuariosRegistrados.some(u => u.email.toLowerCase() === adminNuevoEmail.toLowerCase())) {
      alert("Ya existe un usuario registrado con este correo.");
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
        body: JSON.stringify({ action: 'add', ...nuevoCliente })
      });
    } catch (err) {
      console.error(err);
    }

    setAdminNuevoNombre('');
    setAdminNuevoEmail('');
    setAdminNuevoPass('');
    setAdminNuevoEstado('activo');
    alert(`¡Cliente ${nuevoCliente.nombre} creado con éxito y guardado en Google Sheets!`);
  };

  const eliminarUsuario = async (email: string) => {
    if (email === 'admin@visback.com') {
      alert("No se puede eliminar al administrador principal.");
      return;
    }
    if (confirm(`¿Estás seguro de eliminar al usuario ${email}?`)) {
      setUsuariosRegistrados(prev => prev.filter(u => u.email !== email));

      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', email })
        });
      } catch (err) {
        console.error(err);
      }
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
          if (typeof window !== 'undefined') {
            localStorage.setItem('visback_usuario_actual', JSON.stringify(actualizado));
          }
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
        body: JSON.stringify({ action: 'update_saldo', email: email, saldo: saldoFinalCalculado })
      });
    } catch (err) {
      console.error("Error al actualizar saldo en Sheets:", err);
    }

    setCantidadesRecarga(prev => ({ ...prev, [email]: '' }));
    alert(`¡Saldo actualizado con éxito y guardado en Google Sheets!`);
  };

  const agregarProductoAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoProdNombre || !nuevoProdPrecio) {
      alert("Rellena el nombre y el precio del producto.");
      return;
    }
    const nuevoProducto: Producto = {
      id: Date.now(),
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
    } catch (err) {
      console.error("Error al guardar producto en Sheets:", err);
    }

    setNuevoProdNombre('');
    setNuevoProdDesc('');
    setNuevoProdPrecio('');
    alert("¡Producto agregado con éxito y guardado en Google Sheets!");
  };

  const eliminarProducto = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto del catálogo y de Google Sheets?")) {
      setProductos(prev => prev.filter(p => p.id !== id));
      setInventarioCredenciales(prev => prev.filter(c => c.productoId !== id));

      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_producto', id: id })
        });
      } catch (err) {
        console.error("Error al eliminar producto en Sheets:", err);
      }

      alert("Producto eliminado con éxito.");
    }
  };

  const agregarCredencialInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credCorreo || !credPass) {
      alert("Ingresa al menos el correo y la contraseña.");
      return;
    }

    const nuevaCred: CredencialInventario = {
      id: Date.now(),
      productoId: Number(credProdId),
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
    } catch (err) {
      console.error(err);
    }

    setCredCorreo('');
    setCredPass('');
    setCredPin('');
    alert("¡Credencial agregada al inventario!");
  };

  const agregarCredencialMasiva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoMasivo.trim()) {
      alert("Pega al menos una credencial.");
      return;
    }

    const lineas = textoMasivo.split('\n');
    let agregadas = 0;
    const nuevasCredenciales: CredencialInventario[] = [];

    lineas.forEach((linea, index) => {
      const limpia = linea.trim();
      if (!limpia) return;

      const partes = limpia.split(/[,|\s]+/);
      if (partes.length >= 2) {
        const correo = partes[0];
        const pass = partes[1];
        const pin = partes[2] || 'N/A';

        nuevasCredenciales.push({
          id: Date.now() + index,
          productoId: Number(credProdId),
          correo,
          pass,
          pin,
          estado: 'disponible'
        });
        agregadas++;
      }
    });

    if (agregadas === 0) {
      alert("Formato no válido.");
      return;
    }

    setInventarioCredenciales(prev => [...prev, ...nuevasCredenciales]);

    for (const cred of nuevasCredenciales) {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_credencial', ...cred })
        });
      } catch (err) {
        console.error(err);
      }
    }

    setTextoMasivo('');
    alert(`¡Se agregaron ${agregadas} cuentas al inventario!`);
  };

  const eliminarCredencial = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta credencial del inventario y de Google Sheets?")) {
      setInventarioCredenciales(prev => prev.filter(c => c.id !== id));

      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_credencial', id: id })
        });
      } catch (err) {
        console.error("Error al eliminar credencial en Sheets:", err);
      }

      alert("Credencial eliminada con éxito.");
    }
  };

  const ejecutarCompraFinal = async () => {
    if (!productoAConfirmar || !usuarioActual) return;
    if (usuarioActual.saldo < productoAConfirmar.precio) {
      alert("Saldo insuficiente.");
      return;
    }

    const credencialDisponible = inventarioCredenciales.find(
      c => Number(c.productoId) === Number(productoAConfirmar.id) && String(c.estado).trim().toLowerCase() === 'disponible'
    );

    if (!credencialDisponible) {
      alert("Lo sentimos, este producto se ha quedado sin stock disponible.");
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
    } catch (err) {
      console.error(err);
    }

    const nuevoSaldo = usuarioActual.saldo - productoAConfirmar.precio;
    const usuarioActualizado = { ...usuarioActual, saldo: nuevoSaldo };
    setUsuarioActual(usuarioActualizado);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('visback_usuario_actual', JSON.stringify(usuarioActualizado));
    }

    setUsuariosRegistrados(prev => prev.map(u => u.email === usuarioActual.email ? { ...u, saldo: nuevoSaldo } : u));

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_saldo', email: usuarioActual.email, saldo: nuevoSaldo })
      });
    } catch (err) {
      console.error(err);
    }

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
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4 py-8 font-sans overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 my-auto relative z-10">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl text-white mx-auto shadow-lg shadow-purple-600/30">V</div>
            <h1 className="text-2xl font-extrabold text-white">Visback Stream</h1>
            <p className="text-slate-400 text-sm">Sincronizado con Google Sheets</p>
          </div>
          <div className="space-y-4 relative z-20">
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              ref={loginEmailRef}
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" 
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              ref={loginPasswordRef}
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" 
            />
            <button 
              type="button"
              onClick={() => handleLogin()}
              className="w-full block bg-purple-600 text-white font-bold py-3.5 rounded-xl text-sm text-center cursor-pointer hover:bg-purple-700 active:bg-purple-800 transition-all shadow-lg shadow-purple-600/30"
            >
              Entrar
            </button>
          </div>
          <div className="text-center pt-4 border-t border-slate-800 relative z-20">
            <button 
              type="button"
              onClick={() => setViewMode('register')}
              className="w-full block py-3 px-4 bg-purple-600 text-white font-bold rounded-xl text-xs text-center cursor-pointer hover:bg-purple-700 transition-all shadow-md shadow-purple-600/30"
            >
              ¿No tienes cuenta? Solicítala por WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'register') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4 py-12 font-sans overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 my-auto mb-16">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-white">Solicitar Cuenta</h1>
            <p className="text-slate-400 text-sm">Envía tus datos por WhatsApp para que el administrador te registre</p>
          </div>
          <form onSubmit={handleRegisterWhatsAppOnly} className="space-y-4">
            <input type="text" placeholder="Tu nombre completo" value={regNombre} onChange={e => setRegNombre(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500" />
            <input type="email" placeholder="Correo deseado" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500" />
            <input type="password" placeholder="Contraseña deseada" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500" />
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm cursor-pointer hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30">
              <MessageCircle size={18} /> Enviar Solicitud por WhatsApp
            </button>
          </form>
          <div className="text-center pt-4 border-t border-slate-800">
            <button 
              type="button"
              onClick={() => setViewMode('login')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs cursor-pointer transition-all border border-slate-700"
            >
              ¿Ya tienes cuenta? Volver al Login
            </button>
          </div>
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
              <button onClick={() => { setActiveTab('admin'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'admin' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:bg-slate-900'}`}>
                <Users size={20} /> Panel Admin
              </button>
            )}
            <button onClick={() => { setActiveTab('inicio'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'inicio' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:bg-slate-900'}`}>
              <ShoppingBag size={20} /> Catálogo
            </button>
            <button onClick={() => { setActiveTab('compras'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'compras' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:bg-slate-900'}`}>
              <ShoppingCart size={20} /> Mis Compras
            </button>
            <button onClick={() => { setActiveTab('billetera'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'billetera' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:bg-slate-900'}`}>
              <Wallet size={20} /> Billetera
            </button>
          </nav>
        </div>
        <button onClick={() => { 
          setUsuarioActual(null); 
          setViewMode('login'); 
          if (typeof window !== 'undefined') {
            localStorage.removeItem('visback_usuario_actual');
          }
        }} className="w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all flex items-center justify-center gap-2">
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <button onClick={() => setMenuAbierto(true)} className="bg-slate-950 text-white px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer">
            <Menu size={18} className="text-purple-400" /> Menú
          </button>
          <div className="flex items-center gap-3">
            <span className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-xl font-bold text-sm">
              ${usuarioActual?.saldo.toFixed(2) || '0.00'} MXN
            </span>
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {usuarioActual?.nombre.charAt(0)}
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {activeTab === 'admin' && usuarioActual?.rol === 'admin' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-6 text-white shadow-xl">
                <h3 className="text-2xl font-bold">Panel de Administración 🛡️ (Sincronizado a Google Sheets)</h3>
                <p className="text-amber-100 text-sm mt-1">Controla productos, stock, clientes y saldos 100% en la nube.</p>
              </div>

              {/* Agregar nuevo servicio */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <PlusCircle size={20} className="text-purple-600" /> Agregar Nuevo Servicio al Catálogo
                </h4>
                <form onSubmit={agregarProductoAdmin} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nombre del servicio (Ej. Disney+ 1M)" value={nuevoProdNombre} onChange={e => setNuevoProdNombre(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="text" placeholder="Descripción (Ej. Respetar dispositivo)" value={nuevoProdDesc} onChange={e => setNuevoProdDesc(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="number" placeholder="Precio ($ MXN)" value={nuevoProdPrecio} onChange={e => setNuevoProdPrecio(e.target.value)} className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <button type="submit" className="sm:col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-all shadow-md shadow-purple-600/20">
                    Publicar Producto en la Tienda y Google Sheets
                  </button>
                </form>
              </div>

              {/* Carga Unitaria */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <KeyRound size={20} className="text-amber-600" /> Agregar Cuenta Individual (Suma Stock Automático)
                </h4>
                <form onSubmit={agregarCredencialInventario} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select 
                    value={credProdId} 
                    onChange={e => setCredProdId(Number(e.target.value))} 
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                  >
                    {productos.map(p => (
                      <option key={p.id} value={Number(p.id)}>{p.nombre} (Stock: {obtenerStock(p.id)})</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Correo de la cuenta" value={credCorreo} onChange={e => setCredCorreo(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="text" placeholder="Contraseña" value={credPass} onChange={e => setCredPass(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="text" placeholder="PIN (Opcional)" value={credPin} onChange={e => setCredPin(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <button type="submit" className="sm:col-span-2 lg:col-span-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-all shadow-md shadow-emerald-600/25">
                    Guardar Credencial en Google Sheets y Sumar Stock
                  </button>
                </form>
              </div>

              {/* Carga Masiva */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2 text-purple-700">
                  <KeyRound size={20} /> Carga Masiva de Credenciales (Suma Stock Automático)
                </h4>
                <p className="text-slate-500 text-xs">
                  Pega tu lista de cuentas completa. Cada línea representa una cuenta con formato: <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-600 font-bold">correo pass pin</code>.
                </p>
                <form onSubmit={agregarCredencialMasiva} className="space-y-4">
                  <div className="max-w-xs">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seleccionar Servicio Destino:</label>
                    <select 
                      value={credProdId} 
                      onChange={e => setCredProdId(Number(e.target.value))} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                    >
                      {productos.map(p => (
                        <option key={p.id} value={Number(p.id)}>{p.nombre} (Stock actual: {obtenerStock(p.id)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lista de Cuentas (Una por renglón):</label>
                    <textarea 
                      rows={5}
                      placeholder="cuenta1@gmail.com pass123 1111&#10;cuenta2@gmail.com pass456 2222"
                      value={textoMasivo}
                      onChange={e => setTextoMasivo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-sm cursor-pointer transition-all shadow-md shadow-purple-600/20">
                    🚀 Cargar Todas a Google Sheets y Aumentar Stock Masivamente
                  </button>
                </form>
              </div>

              {/* Inventario */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <KeyRound size={20} className="text-purple-600" /> Inventario de Cuentas en la Nube ({inventarioCredenciales.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                        <th className="p-3">Servicio</th>
                        <th className="p-3">Correo / Pass / PIN</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {inventarioCredenciales.map(c => {
                        const prod = productos.find(p => Number(p.id) === Number(c.productoId));
                        return (
                          <tr key={c.id}>
                            <td className="p-3 font-semibold">{prod ? prod.nombre : `Desconocido (ID: ${c.productoId})`}</td>
                            <td className="p-3 font-mono text-xs">{c.correo} / {c.pass} / {c.pin}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {c.estado}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button onClick={() => eliminarCredencial(c.id)} className="bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-lg text-xs font-bold cursor-pointer">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Agregar Cliente Manual */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <UserPlus size={20} className="text-amber-600" /> Registrar Cliente Oficial (Sincroniza a Google Sheets)
                </h4>
                <form onSubmit={agregarClienteAdmin} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input type="text" placeholder="Nombre del cliente" value={adminNuevoNombre} onChange={e => setAdminNuevoNombre(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="email" placeholder="Correo electrónico" value={adminNuevoEmail} onChange={e => setAdminNuevoEmail(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="password" placeholder="Contraseña" value={adminNuevoPass} onChange={e => setAdminNuevoPass(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <select value={adminNuevoEstado} onChange={e => setAdminNuevoEstado(e.target.value as 'activo' | 'pendiente')} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                    <option value="activo">Estado: Activo</option>
                    <option value="pendiente">Estado: Pendiente</option>
                  </select>
                  <button type="submit" className="sm:col-span-2 lg:col-span-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-all shadow-md shadow-amber-600/25">
                    Crear Cuenta de Cliente en la Nube
                  </button>
                </form>
              </div>

              {/* Clientes y Ajuste de Saldos */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Users size={20} className="text-amber-600" /> Clientes y Gestión de Saldo ({usuariosRegistrados.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Correo</th>
                        <th className="p-3">Saldo Actual</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-center">Ajustar Saldo ($ MXN)</th>
                        <th className="p-3 text-center">Acción Cuenta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {usuariosRegistrados.map((u, i) => (
                        <tr key={i}>
                          <td className="p-3 font-semibold">{u.nombre}</td>
                          <td className="p-3 text-slate-600 font-mono text-xs">{u.email}</td>
                          <td className="p-3 font-bold text-purple-600">${u.saldo.toFixed(2)}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-800'}`}>{u.estado}</span></td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <input 
                                type="number" 
                                placeholder="Monto" 
                                value={cantidadesRecarga[u.email] || ''} 
                                onChange={(e) => setCantidadesRecarga({ ...cantidadesRecarga, [u.email]: e.target.value })} 
                                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs" 
                              />
                              <button 
                                onClick={() => ajustarSaldoUsuario(u.email, 'agregar')} 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-xs font-bold cursor-pointer"
                                title="Agregar saldo"
                              >
                                + Agregar
                              </button>
                              <button 
                                onClick={() => ajustarSaldoUsuario(u.email, 'quitar')} 
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-xs font-bold cursor-pointer"
                                title="Quitar saldo"
                              >
                                - Quitar
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {u.email !== 'admin@visback.com' && (
                              <button onClick={() => eliminarUsuario(u.email)} className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1 mx-auto">
                                <Trash2 size={14} /> Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Productos en Catálogo */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-purple-600" /> Productos en el Catálogo ({productos.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                        <th className="p-3">Servicio</th>
                        <th className="p-3">Precio</th>
                        <th className="p-3">Stock Automático</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {productos.map(p => (
                        <tr key={p.id}>
                          <td className="p-3 font-semibold">{p.nombre}</td>
                          <td className="p-3">${p.precio.toFixed(2)}</td>
                          <td className="p-3"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold text-xs">{obtenerStock(p.id)} disponibles</span></td>
                          <td className="p-3 text-center">
                            <button onClick={() => eliminarProducto(p.id)} className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all">Eliminar</button>
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
              <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Bienvenido, {usuarioActual?.nombre} 👋</h3>
                  <p className="text-purple-200 text-sm mt-1">Elige tus servicios de streaming favoritos con entrega automática.</p>
                </div>
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
                        <button 
                          onClick={() => setProductoAConfirmar(p)} 
                          disabled={stockActual === 0}
                          className={`font-medium px-4 py-2 rounded-xl text-sm shadow-md transition-all ${stockActual > 0 ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-purple-600/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
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
              <h3 className="font-bold text-lg">Tus Compras Activas y Vencimientos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                      <th className="p-3">Pedido</th>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Credenciales de Acceso</th>
                      <th className="p-3">Vencimiento</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {compras.map(c => (
                      <tr key={c.id}>
                        <td className="p-3 font-bold">{c.id}</td>
                        <td className="p-3 font-semibold">{c.producto}</td>
                        <td className="p-3 font-mono text-xs text-slate-600 space-y-1">
                          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border">
                            <span>Correo: <strong>{c.correo}</strong></span>
                            <button onClick={() => { navigator.clipboard.writeText(c.correo); alert("¡Correo copiado!"); }} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer">Copiar</button>
                          </div>
                          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border">
                            <span>Pass: <strong>{c.pass}</strong></span>
                            <button onClick={() => { navigator.clipboard.writeText(c.pass); alert("¡Contraseña copiada!"); }} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer">Copiar</button>
                          </div>
                          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border">
                            <span>PIN: <strong className="text-purple-600">{c.pin}</strong></span>
                            <button onClick={() => { navigator.clipboard.writeText(c.pin); alert("¡PIN copiado!"); }} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer">Copiar</button>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200">
                            <Clock size={14} /> {c.vencimiento}
                          </div>
                        </td>
                        <td className="p-3"><span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">{c.estado}</span></td>
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
              <a 
                href={`https://wa.me/${whatsappNumber}?text=Hola%20Visback%20Stream,%20quiero%20realizar%20una%20recarga%20de%20saldo.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-sm"
              >
                <MessageCircle size={18} /> Solicitar Recarga por WhatsApp
              </a>
            </div>
          )}
        </main>
      </div>

      {productoAConfirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Confirmar Compra</h3>
            <p className="text-slate-600 text-sm">¿Deseas comprar <strong>{productoAConfirmar.nombre}</strong> por ${productoAConfirmar.precio.toFixed(2)} MXN?</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setProductoAConfirmar(null)} className="flex-1 bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm cursor-pointer">No</button>
              <button onClick={ejecutarCompraFinal} className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-xl text-sm cursor-pointer">Sí</button>
            </div>
          </div>
        </div>
      )}

      {compraExitosa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">¡Compra Exitosa!</h3>
            <div className="bg-slate-50 rounded-2xl p-4 text-left border font-mono text-xs space-y-1">
              <div>Correo: <strong>{compraExitosa.correo}</strong></div>
              <div>Contraseña: <strong>{compraExitosa.pass}</strong></div>
              <div>PIN: <strong className="text-purple-600">{compraExitosa.pin}</strong></div>
            </div>
            <button onClick={() => setCompraExitosa(null)} className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl text-sm cursor-pointer">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}