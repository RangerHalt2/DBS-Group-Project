import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [userRole, setUserRole] = useState(null);

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
					return;
				}

				const data = await res.json();
				setUserRole(data.user_type);
			} catch {
				setUserRole("none");
			}
		};

		checkUser();
	}, []);

	return (
		<AuthContext.Provider value={{ userRole, setUserRole }}>
			{children}
		</AuthContext.Provider>
	);
}
