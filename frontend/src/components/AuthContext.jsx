import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [userRole, setUserRole] = useState(null);
	const [username, setUser] = useState(null);
	const [adminRole, setAdmin] = useState(null);

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
					setUser(null);
					return;
				}

				const data = await res.json();
				console.log("API user data:", data); // DEBUG
				setUserRole(data.user_type);
				setUser(data.username); // Store username from response
				console.log("Username set to:", data.username); // DEBUG
			} catch {
				setUserRole("none");
				setUser(null);
			}
		};

		const fetchAdmin = async () => {
			try {
				const res = await fetch("http://localhost:3001/api/admin/me", {
					method: "POST",
					credentials: "include", // important to send cookies
				});

				if (res.status === 401) {
					// Not authorized → redirect to index
					return;
				}

				const data = await res.json();
				setAdmin(data.name);
			} catch (err) {
				console.error("Error fetching admin info:", err);
			}
		};

		checkUser();
		fetchAdmin();
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
		setAdmin(null);
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				userRole,
				setUserRole,
				username,
				setUser,
				logout,
				adminRole,
				setAdmin,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
