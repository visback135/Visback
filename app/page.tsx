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
  UserPlus,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
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
  email: string;
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
  const [comprasGlobales, setComprasGlobales] = useState<Compra[]>([]);

  // Estados para Acordeones (Plegables) en Admin
  const [mostrarAuditoria, setMostrarAuditoria] = useState(true);
  const [mostrarCrearCliente, setMostrarCrearCliente] = useState(false);
  const [mostrarCrearProd, setMostrarCrearProd] = useState(false);
  const [mostrarListaProd, setMostrarListaProd] = useState(true);
  const [mostrarAgregarCred, setMostrarAgregarCred] = useState(true);
  const [mostrarCargaMasiva, setMostrarCargaMasiva] = useState(false);
  const [mostrarInventario, setMostrarInventario] = useState(true);
  const [mostrarClientes, setMostrarClientes] = useState(true);

  // Buscadores y Paginación (15 por página)
  const [busquedaVentas, setBusquedaVentas] = useState('');
  const [paginaVentas, setPaginaVentas] = useState(1);

  const [busquedaInventario, setBusquedaInventario] = useState('');
  const [paginaInventario, setPaginaInventario] = useState(1);

  const itemsPorPagina = 15;

  const [productoAConfirmar, setProductoAConfirmar] = useState<Producto | null>(null);
  const [compraExitosa, setCompraExitosa] = useState<Compra | null>(null);
  const [procesandoCompra, setProcesandoCompra] = useState(false);

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

        if (data.compras && Array.isArray(data.compras)) {
          const formC: Compra[] = data.compras.map((c: any) => ({
            id: String(c.id || ''),
            email: String(c.email || '').trim().toLowerCase(),
            producto: String(c.producto || ''),
            correo: String(c.correo || ''),
            pass: String(c.pass || ''),
            pin: String(c.pin || 'N/A'),
            precio: Number(c.precio) || 0,
            vencimiento: String(c.vencimiento || ''),
            estado: String(c.estado || 'Activa')
          }));
          setComprasGlobales(formC);
        }

        if (data.usuarios && Array.isArray(data.usuarios)) {
          const formU: Usuario[] = data.usuarios.map((u: any) => ({
            email: String(u.email || '').trim().toLowerCase(),
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

          if (usuarioActual) {
            const usuarioFresquito = formU.find(u => u.email === String(usuarioActual.email).trim().toLowerCase());
            if (usuarioFresquito) {
              setUsuarioActual(usuarioFresquito);
              if (typeof window !== 'undefined') {
                localStorage.setItem('visback_usuario_actual', JSON.stringify(usuarioFresquito));
              }
            }
          }
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
    if (activeTab === 'inicio' || activeTab === 'admin' || activeTab === 'compras') {
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
    const emailVal = loginEmailRef.current?.value.trim().toLowerCase() || '';
    const passVal = loginPasswordRef.current?.value.trim() || '';

    const encontrado = usuariosRegistrados.find(
      u => u.email.toLowerCase() === emailVal && u.pass === passVal
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
      email: String(adminNuevoEmail).trim().toLowerCase(),
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
    setTimeout(sincronizarConGoogleSheets, 1000);
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
    const emailBuscado = String(email).trim().toLowerCase();

    const usuariosActualizados = usuariosRegistrados.map(u => {
      if (String(u.email).trim().toLowerCase() === emailBuscado) {
        let nuevoSaldo = tipo === 'agregar' ? u.saldo + monto : u.saldo - monto;
        if (nuevoSaldo < 0) nuevoSaldo = 0;
        saldoFinalCalculado = nuevoSaldo;

        if (usuarioActual && String(usuarioActual.email).trim().toLowerCase() === emailBuscado) {
          const sesionActualizada = { ...u, saldo: nuevoSaldo };
          setUsuarioActual(sesionActualizada);
          if (typeof window !== 'undefined') {
            localStorage.setItem('visback_usuario_actual', JSON.stringify(sesionActualizada));
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
        body: JSON.stringify({ action: 'update_saldo', email: emailBuscado, saldo: saldoFinalCalculado })
      });
    } catch (err) { console.error(err); }

    setCantidadesRecarga(prev => ({ ...prev, [email]: '' }));
    alert(`¡Saldo actualizado a $${saldoFinalCalculado.toFixed(2)} MXN!`);
    setTimeout(sincronizarConGoogleSheets, 800);
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
    alert("¡Producto agregado!");
    setTimeout(sincronizarConGoogleSheets, 1000);
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
      setTimeout(sincronizarConGoogleSheets, 1000);
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
    alert("¡Credencial agregada!");
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

  const calcularVencimiento = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const ejecutarCompraFinal = async () => {
    if (!productoAConfirmar || !usuarioActual) return;
    if (procesandoCompra) return;

    if (usuarioActual.saldo < productoAConfirmar.precio) {
      alert("Saldo insuficiente.");
      setProductoAConfirmar(null);
      return;
    }

    setProcesandoCompra(true);

    const credencialDisponible = inventarioCredenciales.find(
      c => String(c.productoId).trim().toLowerCase() === String(productoAConfirmar.id).trim().toLowerCase() && String(c.estado).trim().toLowerCase() === 'disponible'
    );

    if (!credencialDisponible) {
      alert("Lo sentimos, el stock se agotó.");
      setProductoAConfirmar(null);
      setProcesandoCompra(false);
      return;
    }

    setInventarioCredenciales(prev => prev.map(c => 
      c.id === credencialDisponible.id ? { ...c, estado: 'vendida' } : c
    ));

    const nuevoSaldo = usuarioActual.saldo - productoAConfirmar.precio;
    const actualizado = { ...usuarioActual, saldo: nuevoSaldo };
    setUsuarioActual(actualizado);
    localStorage.setItem('visback_usuario_actual', JSON.stringify(actualizado));

    setUsuariosRegistrados(prev => prev.map(u => u.email.toLowerCase() === usuarioActual.email.toLowerCase() ? { ...u, saldo: nuevoSaldo } : u));

    const nuevaCompra: Compra = {
      id: `#${Math.floor(100000 + Math.random() * 900000)}`,
      email: usuarioActual.email.toLowerCase(),
      producto: productoAConfirmar.nombre,
      correo: credencialDisponible.correo,
      pass: credencialDisponible.pass,
      pin: credencialDisponible.pin,
      precio: productoAConfirmar.precio,
      vencimiento: calcularVencimiento(),
      estado: 'Activa'
    };

    setComprasGlobales(prev => [nuevaCompra, ...prev]);

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vender_credencial', id: credencialDisponible.id })
      });

      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_saldo', email: usuarioActual.email, saldo: nuevoSaldo })
      });

      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_compra', ...nuevaCompra })
      });
    } catch (err) { 
      console.error("Error en compra:", err); 
    }

    setProductoAConfirmar(null);
    setProcesandoCompra(false);
    setCompraExitosa(nuevaCompra);

    setTimeout(sincronizarConGoogleSheets, 1000);
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

  const misComprasFiltradas = comprasGlobales.filter(c => c.email === usuarioActual?.email.toLowerCase());

  // Filtrado y Paginación de Auditoría de Ventas
  const ventasFiltradasBusqueda = comprasGlobales.filter(v => {
    const q = busquedaVentas.toLowerCase();
    return v.email.toLowerCase().includes(q) || v.producto.toLowerCase().includes(q) || v.correo.toLowerCase().includes(q) || v.pass.toLowerCase().includes(q) || v.vencimiento.toLowerCase().includes(q);
  });
  const totalPaginasVentas = Math.ceil(ventasFiltradasBusqueda.length / itemsPorPagina) || 1;
  const ventasPaginadas = ventasFiltradasBusqueda.slice((paginaVentas - 1) * itemsPorPagina, paginaVentas * itemsPorPagina);

  // Filtrado y Paginación de Inventario Actual
  const inventarioFiltradoBusqueda = inventarioCredenciales.filter(i => {
    const q = busquedaInventario.toLowerCase();
    return i.productoId.toLowerCase().includes(q) || i.correo.toLowerCase().includes(q) || i.pass.toLowerCase().includes(q) || i.estado.toLowerCase().includes(q);
  });
  const totalPaginasInventario = Math.ceil(inventarioFiltradoBusqueda.length / itemsPorPagina) || 1;
  const inventarioPaginado = inventarioFiltradoBusqueda.slice((paginaInventario - 1) * itemsPorPagina, paginaInventario * itemsPorPagina);

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
                <p className="text-amber-100 text-sm mt-1">Control de catálogo, inventario, clientes y auditoría de ventas.</p>
              </div>

              {/* 1. AUDITORÍA DE VENTAS */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div onClick={() => setMostrarAuditoria(!mostrarAuditoria)} className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none">
                  <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <ShieldAlert size={20} className="text-amber-600" /> Auditoría de Ventas Globales ({comprasGlobales.length})
                  </h4>
                  <button className="text-slate-500 font-bold text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    {mostrarAuditoria ? 'Ocultar' : 'Mostrar'} {mostrarAuditoria ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {mostrarAuditoria && (
                  <div className="p-6 space-y-4">
                    <div className="flex justify-end">
                      <div className="relative w-full sm:w-72">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"><Search size={16} /></span>
                        <input type="text" placeholder="Buscar venta..." value={busquedaVentas} onChange={e => { setBusquedaVentas(e.target.value); setPaginaVentas(1); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 font-medium" />
                      </div>
                    </div>
                    <div className="overflow-x-auto min-h-[180px]">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b text-xs">
                            <th className="p-3">Cliente (Comprador)</th>
                            <th className="p-3">Servicio</th>
                            <th className="p-3">Cuenta Entregada</th>
                            <th className="p-3">Vence</th>
                            <th className="p-3">Precio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {ventasPaginadas.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-slate-400 text-xs">No hay registros coincidentes.</td></tr>
                          ) : (
                            ventasPaginadas.map((v, i) => (
                              <tr key={i}>
                                <td className="p-3 font-mono font-bold text-purple-600 text-xs">{v.email}</td>
                                <td className="p-3 font-semibold">{v.producto}</td>
                                <td className="p-3 font-mono text-xs">{v.correo} / {v.pass} {v.pin !== 'N/A' && `(PIN: ${v.pin})`}</td>
                                <td className="p-3 font-mono text-xs text-slate-500">{v.vencimiento}</td>
                                <td className="p-3 font-bold text-emerald-600">${v.precio.toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {totalPaginasVentas > 1 && (
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-slate-500">Pág. <strong>{paginaVentas}</strong> de <strong>{totalPaginasVentas}</strong> (15 por pág.)</span>
                        <div className="flex gap-1">
                          <button onClick={() => setPaginaVentas(p => Math.max(p - 1, 1))} disabled={paginaVentas === 1} className="p-2 border rounded-xl text-xs font-bold bg-white disabled:opacity-40 cursor-pointer flex items-center gap-1"><ChevronLeft size={14} /> Ant</button>
                          <button onClick={() => setPaginaVentas(p => Math.min(p + 1, totalPaginasVentas))} disabled={paginaVentas === totalPaginasVentas} className="p-2 border rounded-xl text-xs font-bold bg-white disabled:opacity-40 cursor-pointer flex items-center gap-1">Sig <ChevronRight size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. REGISTRAR NUEVO CLIENTE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div onClick={() => setMostrarCrearCliente(!mostrarCrearCliente)} className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none">
                  <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <UserPlus size={20} className="text-purple-600" /> Registrar Nuevo Cliente Directamente
                  </h4>
                  <button className="text-slate-500 font-bold text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    {mostrarCrearCliente ? 'Ocultar' : 'Mostrar'} {mostrarCrearCliente ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {mostrarCrearCliente && (
                  <form onSubmit={agregarClienteAdmin} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" placeholder="Nombre completo" value={adminNuevoNombre} onChange={e => setAdminNuevoNombre(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <input type="email" placeholder="Correo electrónico" value={adminNuevoEmail} onChange={e => setAdminNuevoEmail(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <input type="password" placeholder="Contraseña" value={adminNuevoPass} onChange={e => setAdminNuevoPass(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-sm cursor-pointer shadow-md">Crear Cuenta</button>
                  </form>
                )}
              </div>

              {/* 3. AGREGAR PRODUCTO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div onClick={() => setMostrarCrearProd(!mostrarCrearProd)} className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none">
                  <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <PlusCircle size={20} className="text-purple-600" /> Agregar Producto al Catálogo
                  </h4>
                  <button className="text-slate-500 font-bold text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    {mostrarCrearProd ? 'Ocultar' : 'Mostrar'} {mostrarCrearProd ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {mostrarCrearProd && (
                  <form onSubmit={agregarProductoAdmin} className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" placeholder="ID único (ej. disney)" value={nuevoProdId} onChange={e => setNuevoProdId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono" />
                    <input type="text" placeholder="Nombre (ej. Disney+)" value={nuevoProdNombre} onChange={e => setNuevoProdNombre(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <input type="number" placeholder="Precio ($ MXN)" value={nuevoProdPrecio} onChange={e => setNuevoProdPrecio(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <input type="text" placeholder="Descripción" value={nuevoProdDesc} onChange={e => setNuevoProdDesc(e.target.value)} className="sm:col-span-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <button type="submit" className="sm:col-span-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer shadow-md">Publicar Producto</button>
                  </form>
                )}
              </div>

              {/* 4. PRODUCTOS EN LA TIENDA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div onClick={() => setMostrarListaProd(!mostrarListaProd)} className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none">
                  <h4 className="font-bold text-lg text-slate-800">Productos en la Tienda ({productos.length})</h4>
                  <button className="text-slate-500 font-bold text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    {mostrarListaProd ? 'Ocultar' : 'Mostrar'} {mostrarListaProd ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {mostrarListaProd && (
                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b text-xs">
                          <th className="p-3">ID</th>
                          <th className="p-3">Nombre</th>
                          <th className="p-3">Precio</th>
                          <th className="p-3 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {productos.map(p => (
                          <tr key={p.id}>
                            <td className="p-3 font-mono font-bold text-purple-600">{p.id}</td>
                            <td className="p-3 font-semibold">{p.nombre}</td>
                            <td className="p-3 font-bold">${p.precio.toFixed(2)} MXN</td>
                            <td className="p-3 text-center">
                              <button onClick={() => eliminarProducto(p.id)} className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 5. AGREGAR CUENTA AL INVENTARIO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div onClick={() => setMostrarAgregarCred(!mostrarAgregarCred)} className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none">
                  <h4 className="font-bold text-lg text-slate-800">Agregar Cuenta al Inventario</h4>
                  <button className="text-slate-500 font-bold text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    {mostrarAgregarCred ? 'Ocultar' : 'Mostrar'} {mostrarAgregarCred ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {mostrarAgregarCred && (
                  <form onSubmit={agregarCredencialInventario} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select value={credProdId} onChange={e => setCredProdId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold">
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} (Stock: {obtenerStock(p.id)})</option>
                      ))}
                    </select>
                    <input type="text" placeholder="Correo" value={credCorreo} onChange={e => setCredCorreo(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <input type="text" placeholder="Contraseña" value={credPass} onChange={e => setCredPass(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <input type="text" placeholder="PIN" value={credPin} onChange={e => setCredPin(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <button type="submit" className="sm:col-span-2 lg:col-span-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer shadow-md">Guardar Cuenta y Aumentar Stock</button>
                  </form>
                )}
              </div>

              {/* 6. CARGA MASIVA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div onClick={() => setMostrarCargaMasiva(!mostrarCargaMasiva)} className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none">
                  <h4 className="font-bold text-lg text-slate-800">Carga Masiva de Cuentas</h4>
                  <button className="text-slate-500 font-bold text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    {mostrarCargaMasiva ? 'Ocultar' : 'Mostrar'} {mostrarCargaMasiva ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {mostrarCargaMasiva && (
                  <form onSubmit={agregarCredencialMasiva} className="p-6 space-y-4">
                    <select value={credProdId} onChange={e => setCredProdId(e.target.value)} className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold">
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} (Stock: {obtenerStock(p.id)})</option>
                      ))}
                    </select>
                    <textarea rows={4} placeholder="correo1@gmail.com pass123 1234&#10;correo2@gmail.com pass456 5678" value={textoMasivo} onChange={e => setTextoMasivo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono" />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-sm cursor-pointer shadow-md">Cargar Masivamente</button>
                  </form>
                )}
              </div>

              {/* 7. INVENTARIO ACTUAL (CON BUSCADOR, PAGINACIÓN 15 POR PÁGINA Y PLEGABLE) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div onClick={() => setMostrarInventario(!mostrarInventario)} className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none">
                  <h4 className="font-bold text-lg text-slate-800">Inventario Actual ({inventarioCredenciales.length})</h4>
                  <button className="text-slate-500 font-bold text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    {mostrarInventario ? 'Ocultar' : 'Mostrar'} {mostrarInventario ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {mostrarInventario && (
                  <div className="p-6 space-y-4">
                    <div className="flex justify-end">
                      <div className="relative w-full sm:w-72">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"><Search size={16} /></span>
                        <input type="text" placeholder="Buscar en inventario..." value={busquedaInventario} onChange={e => { setBusquedaInventario(e.target.value); setPaginaInventario(1); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-purple-500 font-medium" />
                      </div>
                    </div>
                    <div className="overflow-x-auto min-h-[220px]">
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
                          {inventarioPaginado.length === 0 ? (
                            <tr><td colSpan={4} className="p-6 text-center text-slate-400 text-xs">No hay cuentas en el inventario.</td></tr>
                          ) : (
                            inventarioPaginado.map(c => (
                              <tr key={c.id}>
                                <td className="p-3 font-mono font-bold text-purple-600">{c.productoId}</td>
                                <td className="p-3 font-mono text-xs">{c.correo} / {c.pass} {c.pin !== 'N/A' && `(PIN: ${c.pin})`}</td>
                                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{c.estado}</span></td>
                                <td className="p-3 text-center">
                                  <button onClick={() => eliminarCredencial(c.id)} className="bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {totalPaginasInventario > 1 && (
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-slate-500">Pág. <strong>{paginaInventario}</strong> de <strong>{totalPaginasInventario}</strong> (15 por pág.)</span>
                        <div className="flex gap-1">
                          <button onClick={() => setPaginaInventario(p => Math.max(p - 1, 1))} disabled={paginaInventario === 1} className="p-2 border rounded-xl text-xs font-bold bg-white disabled:opacity-40 cursor-pointer flex items-center gap-1"><ChevronLeft size={14} /> Ant</button>
                          <button onClick={() => setPaginaInventario(p => Math.min(p + 1, totalPaginasInventario))} disabled={paginaInventario === totalPaginasInventario} className="p-2 border rounded-xl text-xs font-bold bg-white disabled:opacity-40 cursor-pointer flex items-center gap-1">Sig <ChevronRight size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 8. GESTIÓN DE CLIENTES */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div onClick={() => setMostrarClientes(!mostrarClientes)} className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none">
                  <h4 className="font-bold text-lg text-slate-800">Gestión de Clientes ({usuariosRegistrados.length})</h4>
                  <button className="text-slate-500 font-bold text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    {mostrarClientes ? 'Ocultar' : 'Mostrar'} {mostrarClientes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {mostrarClientes && (
                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b text-xs">
                          <th className="p-3">Nombre / Correo</th>
                          <th className="p-3">Saldo</th>
                          <th className="p-3">Ajustar Saldo</th>
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
                )}
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
                      <th className="p-3">Vencimiento (30 días)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {misComprasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 text-sm">Aún no tienes compras registradas.</td>
                      </tr>
                    ) : (
                      misComprasFiltradas.map(c => (
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
                      ))
                    )}
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
              <button onClick={() => setProductoAConfirmar(null)} disabled={procesandoCompra} className="flex-1 bg-slate-200 hover:bg-slate-300 py-2.5 rounded-xl font-bold text-sm cursor-pointer">No</button>
              <button onClick={ejecutarCompraFinal} disabled={procesandoCompra} className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${procesandoCompra ? 'bg-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'}`}>
                {procesandoCompra ? 'Procesando...' : 'Sí'}
              </button>
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
              <div className="text-amber-700 pt-1">Vence: <strong>{compraExitosa.vencimiento}</strong></div>
            </div>
            <button onClick={() => setCompraExitosa(null)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-bold text-sm cursor-pointer shadow-md">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}