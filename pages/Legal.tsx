import React from 'react';
import { Card } from '../components/ui/Card';
import { LEGAL } from '../lib/legal';

const mail = (
  <a href={`mailto:${LEGAL.email}`} className="text-primary hover:underline">
    {LEGAL.email}
  </a>
);

const PrivacyContent: React.FC = () => (
  <>
    <h2>1. Responsable</h2>
    <p>
      {LEGAL.owner}, NIF {LEGAL.nif}, {LEGAL.address}. Contacto: {mail}.
    </p>

    <h2>2. Qué datos tratamos</h2>
    <ul>
      <li>Datos de cuenta: email, nombre y contraseña (la guarda cifrada Supabase; nosotros no la vemos).</li>
      <li>
        <strong>Datos de salud</strong>: tu actividad física. Entrenamientos (ejercicios, series, pesos,
        repeticiones, duración y notas), récords personales, rutinas, objetivo físico (fuerza, hipertrofia, pérdida de
        grasa, resistencia), nivel de experiencia, material disponible y calendario semanal.
      </li>
      <li>Datos del juego: nivel, puntos de experiencia, racha e insignias.</li>
      <li>Retos sociales: si te unes a uno, los demás participantes ven tu nombre y tu progreso en ese reto.</li>
      <li>La fecha en que diste el consentimiento para tratar tus datos de salud.</li>
      <li>Datos técnicos que registran los proveedores por seguridad (dirección IP, navegador).</li>
    </ul>

    <h2>3. Para qué y con qué base legal</h2>
    <ul>
      <li>Prestar el servicio y gestionar tu cuenta — art. 6.1.b RGPD (ejecución de las condiciones de uso).</li>
      <li>Seguridad y prevención de abusos (CAPTCHA) — art. 6.1.f RGPD (interés legítimo).</li>
      <li>
        Datos de salud, para planificar y registrar tus entrenamientos — art. 9.2.a RGPD (consentimiento explícito).
        Puedes retirarlo en cualquier momento escribiendo a {mail} o borrando la cuenta. Sin esos datos la app no
        puede funcionar, así que retirarlo equivale a dejar de usarla.
      </li>
    </ul>

    <h2>4. Con quién se comparten</h2>
    <p>No vendemos tus datos. Los tratan, por cuenta nuestra, estos proveedores:</p>
    <ul>
      <li>Supabase — base de datos, cuentas y emails de acceso — región del proyecto: [RELLENAR].</li>
      <li>Vercel — alojamiento — Estados Unidos.</li>
      <li>Cloudflare Turnstile — protección anti-bots en registro y acceso — Estados Unidos.</li>
    </ul>

    <h2>5. Transferencias internacionales</h2>
    <p>
      Algunos de estos proveedores están en Estados Unidos. Las transferencias se amparan en el Marco de Privacidad
      de Datos UE-EE. UU. o en las cláusulas contractuales tipo de la Comisión Europea.
    </p>

    <h2>6. Cuánto tiempo</h2>
    <p>
      Mientras mantengas la cuenta. Al borrarla (Ajustes → Cuenta → Eliminar cuenta) eliminamos tus datos; las copias
      de seguridad de los proveedores se sobrescriben según su propio ciclo.
    </p>

    <h2>7. Tus derechos</h2>
    <p>
      Acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, escribiendo a {mail}.
      También puedes exportar tus datos desde Ajustes. Si no estás conforme con la respuesta, puedes reclamar ante la
      Agencia Española de Protección de Datos (
      <a href="https://www.aepd.es" target="_blank" rel="noreferrer" className="text-primary hover:underline">
        www.aepd.es
      </a>
      ).
    </p>

    <h2>8. Cookies</h2>
    <p>
      Solo usamos cookies técnicas necesarias para mantener tu sesión iniciada, y el almacenamiento local del
      navegador para que la app funcione sin conexión y recuerde tus preferencias. Están exentas de consentimiento
      (art. 22.2 LSSI) y no usamos cookies de analítica ni de publicidad.
    </p>

    <h2>9. Menores</h2>
    <p>La app no está dirigida a menores de 14 años.</p>
  </>
);

const LegalNoticeContent: React.FC = () => (
  <>
    <h2>Titular</h2>
    <p>
      {LEGAL.owner} · NIF {LEGAL.nif} · {LEGAL.address} · {mail}
    </p>

    <h2>Objeto</h2>
    <p>
      Hybrid es un proyecto personal de {LEGAL.owner}. Es una app de entrenamiento con elementos de juego:
      planifica rutinas, registra tus entrenamientos y sigue tu progreso.
    </p>

    <h2>Propiedad intelectual</h2>
    <p>
      El diseño y el código de la app son del titular. El contenido que crean los usuarios sigue siendo suyo.
    </p>

    <h2>Responsabilidad</h2>
    <p>
      La app se ofrece tal cual, sin garantía de disponibilidad. Las recomendaciones automáticas (cargas, rutinas,
      programas) pueden contener errores; no sustituyen el consejo de un profesional. Consulta a un médico antes de
      empezar un programa de ejercicio.
    </p>

    <h2>Legislación</h2>
    <p>Este aviso se rige por la legislación española.</p>
  </>
);

/** /privacidad y /aviso-legal: públicas, se pintan antes de comprobar la sesión (App.tsx). */
const Legal: React.FC<{ page: 'privacidad' | 'aviso-legal' }> = ({ page }) => (
  <div className="min-h-screen bg-background flex justify-center p-4 py-10">
    <Card
      padding="lg"
      className="w-full max-w-2xl space-y-4 text-sm text-text-muted [&_h2]:pt-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
    >
      <a href="/" className="text-xl font-black text-white tracking-tight">
        Hy<span className="text-primary">brid</span>
      </a>
      <h1 className="text-3xl font-black text-white">
        {page === 'privacidad' ? 'Política de privacidad' : 'Aviso legal'}
      </h1>
      <p>Última actualización: {LEGAL.updatedAt}</p>
      {page === 'privacidad' ? <PrivacyContent /> : <LegalNoticeContent />}
    </Card>
  </div>
);

export default Legal;
