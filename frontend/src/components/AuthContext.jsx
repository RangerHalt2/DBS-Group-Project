import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [userRole, setUserRole] = useState(null);
	const [username, setUsername] = useState(null);


	// Check cookie once when site loads
	useEffect(() => {
		const checkUser = async () => {
			try {
				const res = await fetch("http://localhost:3001/api/user/me", {
					method: "POST",
					credentials: "include",
				});

				if (!res.ok) {
					setUserRole("none");
					setUsername(null);
					return;
				}

				const data = await res.json();
				console.log("API user data:", data); // DEBUG
				setUserRole(data.user_type);
				setUsername(data.username); // Store username from response
				console.log("Username set to:", data.username); // DEBUG
			} catch {
				setUserRole("none");
				setUsername(null);
			}
		};

		checkUser();
	}, []);

	// logout
	const logout = async () => {
		try {
			await fetch("http://localhost:3001/api/logout", {
				method: "POST",
				credentials: "include",
			});
		} catch (err) {
			console.error("Logout failed:", err);
		}

		// Clear local auth state
		setUserRole("none");
		setUsername(null);
	};

	return (
		<AuthContext.Provider value={{ userRole, setUserRole, username, setUsername, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
