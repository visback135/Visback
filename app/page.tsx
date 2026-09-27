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
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  HelpCircle,
  Send,
  AlertCircle
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

interface TransaccionBilletera {
  id: string;
  email: string;
  tipo: 'recarga' | 'ajuste';
  monto: number;
  fecha: string;
}

interface ReporteSoporte {
  id: string;
  email: string;
  cuenta_correo: string;
  cuenta_pass: string;
  tipo_cuenta: 'Completa' | 'Perfil';
  mensaje: string;
  respuesta: string;
  estado: 'En proceso' | 'Solucionado' | 'Rechazado';
  fecha: string;
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
  const [activeTab, setActiveTab] = useState<'inicio' | 'compras' | 'billetera' | 'reportes' | 'admin' | 'admin_reportes'>('inicio');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [usuariosRegistrados, setUsuariosRegistrados] = useState<Usuario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([
    { id: 'netflix', nombre: 'Netflix Perfil 1M', desc: 'Respetar 1 Dispositivo', precio: 55.00 },
    { id: 'disney', nombre: 'Disney+ 1M', desc: 'Respetar 1 Dispositivo', precio: 20.00 }
  ]);
  const [inventarioCredenciales, setInventarioCredenciales] = useState<CredencialInventario[]>([]);
  const [comprasGlobales, setComprasGlobales] = useState<Compra[]>([]);
  const [transaccionesGlobales, setTransaccionesGlobales] = useState<TransaccionBilletera[]>([]);
  const [reportesGlobales, setReportesGlobales] = useState<ReporteSoporte[]>([]);

  // Campos para el reporte del cliente
  const [reporteCuentaCorreo, setReporteCuentaCorreo] = useState('');
  const [reporteCuentaPass, setReporteCuentaPass] = useState('');
  const [reporteTipoCuenta, setReporteTipoCuenta] = useState<'Completa' | 'Perfil'>('Completa');
  const [reporteMensaje, setReporteMensaje] = useState('');

  // Respuestas del admin por ID
  const [respuestasAdmin, setRespuestasAdmin] = useState<{ [key: string]: string }>({});

  // Acordeones Admin
  const [mostrarAuditoria, setMostrarAuditoria] = useState(true);
  const [mostrarCrearCliente, setMostrarCrearCliente] = useState(false);
  const [mostrarCrearProd, setMostrarCrearProd] = useState(false);
  const [mostrarListaProd, setMostrarListaProd] = useState(true);
  const [mostrarAgregarCred, setMostrarAgregarCred] = useState(true);
  const [mostrarCargaMasiva, setMostrarCargaMasiva] = useState(false);
  const [mostrarInventario, setMostrarInventario] = useState(true);
  const [mostrarClientes, setMostrarClientes] = useState(true);

  // Buscadores y Paginación
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

        if (data.transacciones && Array.isArray(data.transacciones)) {
          const formT: TransaccionBilletera[] = data.transacciones.map((t: any) => ({
            id: String(t.id || ''),
            email: String(t.email || '').trim().toLowerCase(),
            tipo: String(t.tipo || 'recarga') as 'recarga' | 'ajuste',
            monto: Number(t.monto) || 0,
            fecha: String(t.fecha || '')
          }));
          setTransaccionesGlobales(formT);
        }

        if (data.reportes && Array.isArray(data.reportes)) {
          const formR: ReporteSoporte[] = data.reportes.map((r: any) => ({
            id: String(r.id || ''),
            email: String(r.email || '').trim().toLowerCase(),
            cuenta_correo: String(r.cuenta_correo || ''),
            cuenta_pass: String(r.cuenta_pass || ''),
            tipo_cuenta: (String(r.tipo_cuenta || '').trim() === 'Perfil' ? 'Perfil' : 'Completa'),
            mensaje: String(r.mensaje || ''),
            respuesta: String(r.respuesta || ''),
            estado: (String(r.estado || '').trim() === 'Solucionado' ? 'Solucionado' : String(r.estado || '').trim() === 'Rechazado' ? 'Rechazado' : 'En proceso'),
            fecha: String(r.fecha || '')
          }));
          setReportesGlobales(formR);
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
    if (activeTab === 'inicio' || activeTab === 'admin' || activeTab === 'admin_reportes' || activeTab === 'compras' || activeTab === 'billetera' || activeTab === 'reportes') {
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

  const enviarReporteCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteCuentaCorreo.trim() || !reporteCuentaPass.trim() || !reporteMensaje.trim() || !usuarioActual) {
      alert("Por favor completa el correo, la contraseña y describe el problema.");
      return;
    }

    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const nuevoReporte: ReporteSoporte = {
      id: `#R${Math.floor(100000 + Math.random() * 900000)}`,
      email: usuarioActual.email.toLowerCase(),
      cuenta_correo: reporteCuentaCorreo.trim(),
      cuenta_pass: reporteCuentaPass.trim(),
      tipo_cuenta: reporteTipoCuenta,
      mensaje: reporteMensaje.trim(),
      respuesta: '',
      estado: 'En proceso',
      fecha: fechaHoy
    };

    setReportesGlobales(prev => [nuevoReporte, ...prev]);
    setReporteCuentaCorreo('');
    setReporteCuentaPass('');
    setReporteTipoCuenta('Completa');
    setReporteMensaje('');

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_reporte', ...nuevoReporte })
      });
      alert("¡Reporte enviado con éxito al administrador!");
    } catch (err) {
      console.error(err);
    }
    setTimeout(sincronizarConGoogleSheets, 1000);
  };

  const responderReporteAdmin = async (idReporte: string, estadoNuevo: 'En proceso' | 'Solucionado' | 'Rechazado') => {
    const textoRespuesta = respuestasAdmin[idReporte] || '';
    
    setReportesGlobales(prev => prev.map(r => {
      if (r.id === idReporte) {
        return {
          ...r,
          respuesta: textoRespuesta !== '' ? textoRespuesta : r.respuesta,
          estado: estadoNuevo
        };
      }
      return r;
    }));

    const reporteActual = reportesGlobales.find(r => r.id === idReporte);
    const respuestaFinal = textoRespuesta !== '' ? textoRespuesta : (reporteActual?.respuesta || '');

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_reporte', id: idReporte, respuesta: respuestaFinal, estado: estadoNuevo })
      });
      alert(`¡Reporte ${idReporte} actualizado a ${estadoNuevo}!`);
    } catch (err) {
      console.error(err);
    }
    setTimeout(sincronizarConGoogleSheets, 1000);
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

  const ajustarSaldoUsuario = async (emailOriginal: string, tipo: 'agregar' | 'quitar') => {
    const emailBuscado = String(emailOriginal || '').trim().toLowerCase();
    const montoStr = cantidadesRecarga[emailOriginal] || cantidadesRecarga[emailBuscado];
    const monto = parseFloat(montoStr);

    if (!monto || isNaN(monto) || monto <= 0) {
      alert("Ingresa una cantidad válida de saldo.");
      return;
    }

    let saldoFinalCalculado = 0;

    const usuariosActualizados = usuariosRegistrados.map(u => {
      if (String(u.email || '').trim().toLowerCase() === emailBuscado) {
        let nuevoSaldo = tipo === 'agregar' ? u.saldo + monto : u.saldo - monto;
        if (nuevoSaldo < 0) nuevoSaldo = 0;
        saldoFinalCalculado = nuevoSaldo;

        if (usuarioActual && String(usuarioActual.email || '').trim().toLowerCase() === emailBuscado) {
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

    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const nuevaTransaccion: TransaccionBilletera = {
      id: `#T${Math.floor(100000 + Math.random() * 900000)}`,
      email: emailBuscado,
      tipo: tipo === 'agregar' ? 'recarga' : 'ajuste',
      monto: tipo === 'agregar' ? monto : -monto,
      fecha: fechaHoy
    };

    setTransaccionesGlobales(prev => [nuevaTransaccion, ...prev]);

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_saldo', email: emailBuscado, saldo: saldoFinalCalculado })
      });

      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_transaccion', ...nuevaTransaccion })
      });
    } catch (err) { console.error(err); }

    setCantidadesRecarga(prev => ({ ...prev, [emailOriginal]: '', [emailBuscado]: '' }));
    alert(`¡Saldo actualizado a $${saldoFinalCalculado.toFixed(2)} MXN y registrado en billetera!`);
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

    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const transaccionCompra: TransaccionBilletera = {
      id: `#T${Math.floor(100000 + Math.random() * 900000)}`,
      email: usuarioActual.email.toLowerCase(),
      tipo: 'ajuste',
      monto: -productoAConfirmar.precio,
      fecha: fechaHoy
    };

    setComprasGlobales(prev => [nuevaCompra, ...prev]);
    setTransaccionesGlobales(prev => [transaccionCompra, ...prev]);

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

      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_transaccion', ...transaccionCompra })
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

  const misComprasFiltradas = comprasGlobales.filter(c => String(c.email).trim().toLowerCase() === String(usuarioActual?.email || '').trim().toLowerCase());
  const misTransaccionesFiltradas = transaccionesGlobales.filter(t => String(t.email).trim().toLowerCase() === String(usuarioActual?.email || '').trim().toLowerCase());
  const misReportesFiltrados = reportesGlobales.filter(r => String(r.email).trim().toLowerCase() === String(usuarioActual?.email || '').trim().toLowerCase());

  // Auditoría ventas
  const ventasFiltradasBusqueda = comprasGlobales.filter(v => {
    const q = busquedaVentas.toLowerCase();
    return v.email.toLowerCase().includes(q) || v.producto.toLowerCase().includes(q) || v.correo.toLowerCase().includes(q) || v.pass.toLowerCase().includes(q) || v.vencimiento.toLowerCase().includes(q);
  });
  const totalPaginasVentas = Math.ceil(ventasFiltradasBusqueda.length / itemsPorPagina) || 1;
  const ventasPaginadas = ventasFiltradasBusqueda.slice((paginaVentas - 1) * itemsPorPagina, paginaVentas * itemsPorPagina);

  // Inventario
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
              <>
                <button onClick={() => { setActiveTab('admin'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'admin' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>
                  <Users size={20} /> Panel Admin
                </button>
                <button onClick={() => { setActiveTab('admin_reportes'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'admin_reportes' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>
                  <HelpCircle size={20} /> Reportes Clientes ({reportesGlobales.length})
                </button>
              </>
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
            {usuarioActual?.rol !== 'admin' && (
              <button onClick={() => { setActiveTab('reportes'); setMenuAbierto(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'reportes' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>
                <HelpCircle size={20} /> Soporte / Reportar Cuenta
              </button>
            )}
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
                <p className="text-amber-100 text-sm mt-1">Control de catálogo, inventario, clientes y ventas.</p>
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

              {/* 7. INVENTARIO ACTUAL */}
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

          {/* PESTAÑA EXCLUSIVA DE ADMIN: REPORTES DE CLIENTES */}
          {activeTab === 'admin_reportes' && usuarioActual?.rol === 'admin' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-6 text-white shadow-xl">
                <h3 className="text-2xl font-bold">Reportes de Cuentas de Clientes 🛠️</h3>
                <p className="text-amber-100 text-sm mt-1">Revisa, responde y cambia el estatus de los reportes enviados por los usuarios.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                {reportesGlobales.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-12">No hay reportes de clientes registrados.</p>
                ) : (
                  <div className="space-y-4">
                    {reportesGlobales.map(rep => (
                      <div key={rep.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-800 text-xs">Cliente: <strong className="text-purple-600">{rep.email}</strong></span>
                            <span className="text-slate-400 text-xs ml-3">{rep.fecha}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 font-mono">
                              {rep.tipo_cuenta}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rep.estado === 'Solucionado' ? 'bg-emerald-100 text-emerald-700' : rep.estado === 'Rechazado' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
                              {rep.estado}
                            </span>
                          </div>
                        </div>

                        {/* Datos de la cuenta reportada */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs">
                          <div>Correo de cuenta: <strong>{rep.cuenta_correo}</strong></div>
                          <div>Contraseña de cuenta: <strong>{rep.cuenta_pass}</strong></div>
                        </div>

                        <div className="text-sm font-medium bg-white p-3 rounded-xl border border-slate-200 text-slate-700">
                          💬 <strong>Problema reportado:</strong> {rep.mensaje}
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-bold text-slate-500">Respuesta para el cliente:</label>
                          <div className="flex flex-wrap gap-2">
                            <input 
                              type="text" 
                              placeholder="Escribe la solución..." 
                              defaultValue={rep.respuesta}
                              onChange={e => setRespuestasAdmin({ ...respuestasAdmin, [rep.id]: e.target.value })}
                              className="flex-1 min-w-[200px] bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500 font-medium"
                            />
                            <button onClick={() => responderReporteAdmin(rep.id, 'En proceso')} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">En Proceso</button>
                            <button onClick={() => responderReporteAdmin(rep.id, 'Solucionado')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><CheckCircle2 size={14} /> Solucionado</button>
                            <button onClick={() => responderReporteAdmin(rep.id, 'Rechazado')} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">Rechazado</button>
                          </div>
                        </div>
                      </div>
                    ))}
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
            <div className="space-y-6">
              {/* SALDO ACTUAL Y WHATSAPP */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Saldo disponible</span>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">${usuarioActual?.saldo.toFixed(2)} MXN</h3>
                </div>
                <a href={`https://wa.me/${whatsappNumber}?text=Hola%20Visback%20Stream,%20quiero%20recargar%20saldo.`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-sm cursor-pointer">
                  <MessageCircle size={18} /> Solicitar Recarga por WhatsApp
                </a>
              </div>

              {/* HISTORIAL DE MOVIMIENTOS DE BILLETERA */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-slate-800">Historial de Recargas y Movimientos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b text-xs">
                        <th className="p-3">ID Movimiento</th>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {misTransaccionesFiltradas.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400 text-sm">Aún no hay movimientos registrados en tu billetera.</td>
                        </tr>
                      ) : (
                        misTransaccionesFiltradas.map((t, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-mono font-bold text-xs text-slate-600">{t.id}</td>
                            <td className="p-3 text-xs text-slate-500">{t.fecha}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${t.monto > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {t.monto > 0 ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                {t.monto > 0 ? 'Recarga de Saldo' : 'Compra de Servicio'}
                              </span>
                            </td>
                            <td className={`p-3 text-right font-black text-base ${t.monto > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.monto > 0 ? `+${t.monto.toFixed(2)}` : t.monto.toFixed(2)} MXN
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reportes' && usuarioActual?.rol !== 'admin' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl">
                <h3 className="text-2xl font-bold">Reportar Cuenta con Falla 🛠️</h3>
                <p className="text-purple-200 text-sm mt-1">Ingresa los datos de la cuenta, indica si es Completa o Perfil, y detalla el problema.</p>
              </div>

              {/* ENVIAR NUEVO REPORTE CON CORREO, CONTRASEÑA, TIPO Y DESCRIPCIÓN */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800">Detalles del Reporte</h4>
                <form onSubmit={enviarReporteCliente} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Correo de la cuenta:</label>
                      <input 
                        type="text" 
                        placeholder="ej. cuenta@netflix.com" 
                        value={reporteCuentaCorreo}
                        onChange={e => setReporteCuentaCorreo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Contraseña de la cuenta:</label>
                      <input 
                        type="text" 
                        placeholder="ej. password123" 
                        value={reporteCuentaPass}
                        onChange={e => setReporteCuentaPass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Tipo de cuenta:</label>
                      <select 
                        value={reporteTipoCuenta} 
                        onChange={e => setReporteTipoCuenta(e.target.value as 'Completa' | 'Perfil')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-purple-500"
                      >
                        <option value="Completa">Completa</option>
                        <option value="Perfil">Perfil</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Explica el problema:</label>
                    <textarea 
                      rows={3} 
                      placeholder="Describe qué pasa (ej. Pide código de hogar, la contraseña cambió, etc.)..." 
                      value={reporteMensaje}
                      onChange={e => setReporteMensaje(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-sm cursor-pointer shadow-md flex items-center gap-2">
                    <Send size={16} /> Enviar Reporte al Admin
                  </button>
                </form>
              </div>

              {/* MIS REPORTES ENVIADOS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-lg text-slate-800">Historial de Mis Reportes</h4>
                <div className="space-y-4">
                  {misReportesFiltrados.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4 text-center">No has enviado ningún reporte todavía.</p>
                  ) : (
                    misReportesFiltrados.map((rep, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs text-slate-400">{rep.id} - {rep.fecha}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 font-mono">
                              {rep.tipo_cuenta}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rep.estado === 'Solucionado' ? 'bg-emerald-100 text-emerald-700' : rep.estado === 'Rechazado' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
                              {rep.estado}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border font-mono text-xs text-slate-700 space-y-1">
                          <div>Cuenta reportada: <strong>{rep.cuenta_correo}</strong> / <strong>{rep.cuenta_pass}</strong></div>
                          <div>Problema: <strong>{rep.mensaje}</strong></div>
                        </div>
                        {rep.respuesta ? (
                          <div className="text-sm text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                            🛡️ <strong>Respuesta del Admin:</strong> {rep.respuesta}
                          </div>
                        ) : (
                          <div className="text-xs text-amber-600 italic">
                            ⏳ Tu reporte está en proceso de revisión por el administrador.
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
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