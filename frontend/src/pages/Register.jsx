//import { useState } from "react";
import "../components/styles.css";

export default function Register() {
  return (
    <div className="bg register-container">

      <section>
        <h1 className="login-title">Who are you?</h1>

        <div className="role-buttons">
          <button type="button" className="login-button">Customer</button>
          <button type="button" className="login-button">Needy</button>
          <button type="button" className="login-button">Donor</button>
          <button type="button" className="login-button">Restaurant</button>
        </div>
      </section>

      <form className="login-card" style={{ padding: '2.5rem 3rem', width: '80%', maxWidth: '950px' }}>
        <h2 className="login-title" style={{ paddingBottom: '10px', fontSize: '1.5rem'}}>Enter registration details here:</h2>

        <div className="row">
          <input type="text" placeholder="Name" className="login-input" />
          <input type="email" placeholder="Email" className="login-input" />
          <input type="password" placeholder="Password" className="login-input" />
        </div>

        <div className="row">
          <input type="text" placeholder="Address" className="login-input" />
          <input type="text" placeholder="Phone" className="login-input" />
        </div>

        <div className="row">
          <input type="text" placeholder="Cardholder Name" className="login-input" />
          <input type="text" placeholder="Card Number" className="login-input" />
          <input type="text" placeholder="Exp Date (MM/YY)" className="login-input" />
          <input type="text" placeholder="CVV" className="login-input" />
        </div>

        <button type="submit" className="login-button submit-btn">Sign Up</button>
      </form>

    </div>
  );
}
