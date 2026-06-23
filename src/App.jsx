import React from "react";
import "./index.css";
import logo from "/rc_soluciones_logo.png"; // place this file in public/

export default function App() {
  return (
    <main className="container">
      {/* Hero */}
      <section className="hero">
        <img src={logo} alt="RC Soluciones" className="logo" />
        <h1 className="title">RC Soluciones</h1>
        <p className="slogan">Maneja las finanzas de tu hogar con confianza.</p>
        <p className="slogan variant">Organiza tus pesos, asegura tu progreso.</p>
        <p className="objective">
          Facilitar a nuestros clientes el control total de sus finanzas
          diarias a través de una herramienta digital intuitiva. Reducir el estrés
          financiero, erradicar el gasto "hormiga" y fomentar el hábito del ahorro.
        </p>
      </section>

      {/* Feature cards */}
      <section className="features">
        <div className="card">
          <h2>Plaza de Mercado</h2>
          <p>Anote rápidamente sus compras diarias sin enredos.</p>
        </div>
        <div className="card">
          <h2>Alertas de Servicios</h2>
          <p>Reciba recordatorios para que no se venzan los recibos de agua, luz o gas.</p>
        </div>
        <div className="card">
          <h2>Metas del Hogar</h2>
          <p>Espacio visual donde la familia puede ahorrar junta para fiestas, educación o mejoras del hogar.</p>
        </div>
      </section>
    </main>
  );
}
