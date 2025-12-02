import React, { useContext } from "react";
import "./components/styles.css";
import { useEffect, useState } from "react";
import { AuthContext } from "./components/AuthContext.jsx";

function Navbar() {
	const { userRole } = useContext(AuthContext);

	return (
		<nav className="navbar fixed top-0 left-0 w-full bg-white shadow z-50">
			<div className="navbar-left">
				<a href="/" className="logo">
					WNK
				</a>
			</div>
			<div className="navbar-center">
				<ul className="nav-links">
					{(!userRole || userRole === "none") && (
						<div className="flex">
							<li>
								<a href="/login">Login</a>
							</li>
							<li>
								<h1>|</h1>
							</li>
						</div>
					)}
					{(!userRole || userRole === "none") && (
						<div className="flex">
							<li>
								<a href="/register">Register</a>
							</li>
							<li>
								<h1>|</h1>
							</li>
						</div>
					)}
					<li>
						<a href="/adminLogin">Admin Login</a>
					</li>
					<li>
						<h1>|</h1>
					</li>
					<li>
						<a href="/plates">Available Plates</a>
					</li>
				</ul>
			</div>
			<div className="navbar-right">
				<a href="/user/:username">Account</a>
			</div>
		</nav>
	);
}

export default Navbar;
