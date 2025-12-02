import React from "react";
import "./components/styles.css";
import { useEffect, useState } from "react";

const Navbar = () => {
	const [userRole, setUserRole] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await fetch("http://localhost:3001/api/user/me", {
					method: "POST",
					credentials: "include", // important to send cookies
				});

				if (res.status === 401) {
					// Not authorized → redirect to index
					setUserRole(null);
					return;
				}

				const data = await res.json();
				setUserRole(data.user_type);
			} catch (err) {
				console.error("Error fetching admin info:", err);
				setUserRole(null);
			}
		};

		fetchUser();
	}, []);

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
						<h1>|</h1>
					</li>
					<li>
						<a href="/register">Register</a>
					</li>
					<li>
						<h1>|</h1>
					</li>
					<li>
						<a href="/adminLogin">Admin Login</a>
					</li>
					<li>
						<h1>|</h1>
					</li>
					<li>
						<a href="/plates">Available Plates</a>
					</li>
					<li>
						<h1>|</h1>
					</li>
					<li>
						<a href="restaurant/:username">Restaurant Inverntory</a>
					</li>
				</ul>
			</div>
			<div className="navbar-right">
				<a href="/user/:username">Account</a>
			</div>
		</nav>
	);
};

export default Navbar;
