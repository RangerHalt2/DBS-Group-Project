import React from "react";
import "./components/styles.css";

const Navbar = () => {
	return (
		<nav className="navbar fixed top-0 left-0 w-full bg-white shadow z-50">
			<div className="navbar-left">
				<a href="/" className="logo">
					WNK
				</a>
			</div>
			<div className="navbar-center">
				<ul className="nav-links">
					<li>
						<a href="/login">Login</a>
					</li>
					<li>
						<a href="/register">Register</a>
					</li>
				</ul>
			</div>
			<div className="navbar-right">
				<a href="/adminLogin">Admin Login</a>
			</div>
			<div className="navbar-right">
				<a href="/user/:username">Account</a>
			</div>
		</nav>
	);
};

export default Navbar;
