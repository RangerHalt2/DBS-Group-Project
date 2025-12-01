import { useState } from "react";

export default function AdminDonerReport() {
	// Inputs
	const [name, setUsername] = useState("");
	const [year, setYear] = useState("");

	// Outputs
	const [report, setReport] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchReport = async () => {
		setReport(null);
		setLoading(true);
		setError(null);

		try {
			// Replace with your API endpoint
			const response = await fetch("http://localhost:3001/api/doner_report", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, year }),
			});
			const data = await response.json();

			if (response.ok) {
				setReport(data.report);
				console.log(data.report);
			} else {
				setError(data.message || "Failed to fetch report");
			}
		} catch (err) {
			setError("An error occurred while fetching the report");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2 className="text-lg font-bold text-gray-700">Generate Doner Report</h2>

			<div className="">
				<input
					type="text"
					className="bg-lime-200 text-center rounded-full m-2 outline outline-2 outline-gray-400 outline-offset-3"
					placeholder="Doner Name"
					value={name}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<br />
				<input
					type="number"
					className="bg-lime-200 text-center rounded-full m-2 outline outline-2 outline-gray-400 outline-offset-3"
					placeholder="Year"
					value={year}
					onChange={(e) => setYear(e.target.value)}
				/>
				<br />
				<button
					onClick={fetchReport}
					disabled={loading}
					className="bg-gray-500 text-white px-3 py-1 rounded ml-2 disabled:opacity-50 m-2"
				>
					{loading ? "Loading..." : "Generate Report"}
				</button>
				{report && (
					<button
						onClick={() => setReport(null)}
						disabled={report === null}
						className="bg-gray-500 text-white px-3 py-1 rounded ml-2 disabled:opacity-0"
					>
						Clear Report
					</button>
				)}
			</div>

			{error && <p style={{ color: "red" }}>{error}</p>}

			{report && report.length > 0 && (
				<table
					border="1"
					cellPadding="5"
					style={{ marginTop: "20px" }}
					className="mx-auto text-center, bg-lime-50"
				>
					<thead>
						<tr>
							<th className="p-5">Plate ID</th>
							<th className="p-5">Description</th>
							<th className="p-5">Price</th>
							<th className="p-5">Total Donated</th>
							<th className="p-5">Given To Needy</th>
							<th className="p-5">Remaining Quantity</th>
							<th className="p-5">Total Donation Value</th>
						</tr>
					</thead>
					<tbody>
						{report.map((plate) => (
							<tr key={plate.pid}>
								<td>{plate.pid}</td>
								<td>{plate.description}</td>
								<td>{plate.price}</td>
								<td>{plate.total_donated}</td>
								<td>{plate.given_to_needy}</td>
								<td>{plate.remaining_quantity}</td>
								<td>{plate.total_donation_value}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{report && report.length === 0 && (
				<p>No data available for this restaurant/year.</p>
			)}
		</div>
	);
}
