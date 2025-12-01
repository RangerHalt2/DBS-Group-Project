import AdminRestaurantReports from "../components/AdminRestaurantReports";
import AdminCustomerReport from "../components/AdminCustomerReport";
import AdminDonerReport from "../components/AdminDonerReport";
import AdminNeedyReport from "../components/AdminNeedyReport";
import AdminMemberLookUp from "../components/AdminMemberLookUp";
import { useState, useEffect } from "react";

export const AdminHub = () => {
	const [activeReport, setActiveReport] = useState("restaurant");
	const [adminName, setAdminName] = useState("Admin"); // Placeholder for admin name

	useEffect(() => {
		const fetchAdmin = async () => {
			try {
				const res = await fetch("http://localhost:3001/api/admin/me", {
					method: "POST",
					credentials: "include", // important to send cookies
				});

				if (res.status === 401) {
					// Not authorized → redirect to index
					window.location.href = "/";
					return;
				}

				const data = await res.json();
				setAdminName(data.name);
			} catch (err) {
				console.error("Error fetching admin info:", err);
				window.location.href = "/";
			}
		};

		fetchAdmin();
	}, []);

	return (
		<div className="flex pt-16">
			<aside
				className="w-64 bg-gray-100 flex flex-col border p-4"
				style={{ minHeight: "calc(100vh - 64px)" }}
			>
				<div className="">
					{/* Admin Logged In information*/}
					<h2 className="text-xl font-bold">Welcome Admin: {adminName}</h2>
				</div>
				<div className="mt-10">
					<AdminMemberLookUp />
				</div>
				<button className="mt-auto bg-gray-200 rounded px-3 py-1">
					<a href="/adminRegister" className="text-blue-500">
						Register New Admin
					</a>
				</button>
			</aside>
			<main className="flex-1 p-5">
				{/* Links to generate reports will be here*/}
				<div className="m-5">
					<h1 className="text-xl font-bold">
						Which report would you like to generate?
					</h1>
					<button
						onClick={() => setActiveReport("restaurant")}
						className={`px-3 py-1 rounded ${
							activeReport === "restaurant"
								? "bg-blue-500 text-white"
								: "bg-gray-200"
						}`}
					>
						Restaurant
					</button>
					<button
						onClick={() => setActiveReport("customer")}
						className={`px-3 py-1 rounded ${
							activeReport === "customer"
								? "bg-blue-500 text-white"
								: "bg-gray-200"
						}`}
					>
						Customer
					</button>
					<button
						onClick={() => setActiveReport("doner")}
						className={`px-3 py-1 rounded ${
							activeReport === "doner"
								? "bg-blue-500 text-white"
								: "bg-gray-200"
						}`}
					>
						Doner
					</button>
					<button
						onClick={() => setActiveReport("needy")}
						className={`px-3 py-1 rounded ${
							activeReport === "needy"
								? "bg-blue-500 text-white"
								: "bg-gray-200"
						}`}
					>
						Needy
					</button>
				</div>
				{activeReport === "restaurant" && <AdminRestaurantReports />}
				{activeReport === "customer" && <AdminCustomerReport />}
				{activeReport === "doner" && <AdminDonerReport />}
				{activeReport === "needy" && <AdminNeedyReport />}
			</main>
		</div>
	);
};
