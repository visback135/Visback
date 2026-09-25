'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

interface Usuario {
  id?: string;
  email: string;
  password?: string;
  nombre: string;
  estatus: string;
  saldo: number;
}

export default function Home() {
  const [vista, setVista] = useState<'login' | 'registro' | 'dashboard' | 'admin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [usuariosLista, setUsuariosLista] = useState<Usuario[]>([]);
  const [mensaje, setMensaje] = useState('');

  // Cargar lista de usuarios para el panel admin
  const cargarUsuarios = async () => {
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error) {
      console.error('Error al cargar usuarios:', error);
    } else {
      setUsuariosLista(data || []);
    }
  };

  useEffect(() => {
    if (vista === 'admin') {
      cargarUsuarios();
    }
  }, [vista]);

  // Inicio de sesión BLINDADO (Revisa estatus activo)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    if (email === 'admin@visback.com' && password === 'admin123') {
      setUsuarioActual({ email, nombre: 'Administrador', estatus: 'activo', saldo: 9999 });
      setVista('admin');
      return;
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      setMensaje('Correo o contraseña incorrectos.');
      return;
    }

    // VALIDACIÓN: Si no está activo, se le bloquea la entrada
    if (data.estatus !== 'activo') {
      setMensaje('Tu cuenta está desactivada o pendiente de activación por el administrador.');
      return;
    }

    setUsuarioActual(data);
    setVista('dashboard');
  };

  // Registro de usuario con depuración de errores exactos
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    const { error } = await supabase.from('usuarios').insert([
      { email, password, nombre, estatus: 'pendiente', saldo: 0 }
    ]);

    if (error) {
      console.error('Error detallado de Supabase:', error);
      alert('Error de Supabase: ' + error.message);
      setMensaje('Error: ' + error.message);
    } else {
      alert('¡Registrado con éxito en Supabase!');
      setMensaje('¡Registro exitoso! Tu cuenta está pendiente de activación.');
      setVista('login');
    }
  };

  // Cambiar estatus de usuario (Activo / Desactivado)
  const cambiarEstatus = async (id: string, estatusActual: string) => {
    const nuevoEstatus = estatusActual === 'activo' ? 'desactivado' : 'activo';
    const { error } = await supabase
      .from('usuarios')
      .update({ estatus: nuevoEstatus })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar el estatus');
    } else {
      cargarUsuarios();
    }
  };

  // ELIMINAR USUARIO POR COMPLETO DE LA BASE DE DATOS
  const eliminarUsuario = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario por completo de la base de datos?')) return;

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Hubo un error al eliminar el usuario');
    } else {
      alert('Usuario eliminado correctamente');
      cargarUsuarios();
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        
        <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '20px' }}>Visback Stream</h1>

        {mensaje && (
          <div style={{ background: '#334155', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', color: '#f87171' }}>
            {mensaje}
          </div>
        )}

        {/* VISTA LOGIN */}
        {vista === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Iniciar Sesión</h2>
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }}
            />
            <button type="submit" style={{ padding: '10px', background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Entrar
            </button>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              ¿No tienes cuenta? <span onClick={() => setVista('registro')} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>Regístrate aquí</span>
            </p>
          </form>
        )}

        {/* VISTA REGISTRO */}
        {vista === 'registro' && (
          <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Crear Cuenta</h2>
            <input 
              type="text" 
              placeholder="Nombre completo" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required
              style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }}
            />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }}
            />
            <button type="submit" style={{ padding: '10px', background: '#22c55e', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Registrarse
            </button>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              ¿Ya tienes cuenta? <span onClick={() => setVista('login')} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>Inicia sesión</span>
            </p>
          </form>
        )}

        {/* VISTA DASHBOARD CLIENTE */}
        {vista === 'dashboard' && usuarioActual && (
          <div>
            <h2>Bienvenido, {usuarioActual.nombre}</h2>
            <p>Tu saldo disponible: <strong>${usuarioActual.saldo} MXN</strong></p>
            <p>Estatus de cuenta: <span style={{ color: '#22c55e' }}>{usuarioActual.estatus}</span></p>
            <button onClick={() => { setUsuarioActual(null); setVista('login'); }} style={{ marginTop: '20px', padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        )}

        {/* VISTA PANEL ADMIN */}
        {vista === 'admin' && (
          <div>
            <h2>Panel de Administración</h2>
            <p>Gestión de usuarios registrados en Supabase:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', marginTop: '15px' }}>
              {usuariosLista.map((u) => (
                <div key={u.id} style={{ background: '#334155', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{u.nombre}</strong> ({u.email})<br/>
                    <small>Estatus: <strong>{u.estatus}</strong> | Saldo: ${u.saldo} MXN</small>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Botón Activar / Desactivar */}
                    <button 
                      onClick={() => u.id && cambiarEstatus(u.id, u.estatus)}
                      style={{ padding: '6px 10px', background: u.estatus === 'activo' ? '#eab308' : '#22c55e', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {u.estatus === 'activo' ? 'Desactivar' : 'Activar'}
                    </button>
                    {/* Botón Eliminar por completo */}
                    <button 
                      onClick={() => u.id && eliminarUsuario(u.id)}
                      style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setUsuarioActual(null); setVista('login'); }} style={{ marginTop: '20px', padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        )}

      </div>
    </main>
  );
}