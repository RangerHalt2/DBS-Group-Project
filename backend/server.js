import express from "express";
const path = "/workspaces/DBS-Group-Project/";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";
import cookieParser from "cookie-parser";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Create database pool
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

// Test route
app.get("/", (req, res) => {
	res.sendFile(path + "/frontend/index.html");
});

function requireAdmin(req, res, next) {
	const adminUser = req.cookies.adminUser;
	if (!adminUser) {
		return res
			.status(401)
			.json({ message: "Unauthorized: Admin login required" });
	}
	req.adminUser = adminUser;
	next();
}

// Example login endpoint
app.post("/api/login", async (req, res) => {
	const { username, password } = req.body;

	try {
		const query = `
            SELECT * FROM member 
            WHERE username = $1 AND password = $2;
        `;

		const result = await pool.query(query, [username, password]);

		if (result.rows.length === 0) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		return res.json({ message: "Login successful", user: result.rows[0] });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/admin_login", async (req, res) => {
	const { username, password } = req.body;

	try {
		const query = `
            SELECT * FROM administrator 
            WHERE username = $1 AND password = $2;
        `;

		const result = await pool.query(query, [username, password]);

		if (result.rows.length === 0) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		res.cookie("adminUser", username, {
			httpOnly: true,
			sameSite: "Strict",
			secure: false,
		});

		return res.json({ message: "Login successful", admin: result.rows[0] });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/admin_register", requireAdmin, async (req, res) => {
	const { ssn, name, salary, username, password } = req.body;

	try {
		const query = `
      INSERT INTO administrator (ssn, name, salary, username, password)
      VALUES ($1, $2, $3, $4, $5);
    `;

		const result = await pool.query(query, [
			ssn,
			name,
			salary,
			username,
			password,
		]);

		if (result.rowCount === 0) {
			return res
				.status(400)
				.json({ message: "Administrator registration failed" });
		}

		return res.json({
			message: "Administrator registered successfully",
			admin: result.rows[0],
		});
	} catch (err) {
		console.error(err);
		if (err.code === "23505") {
			//unique violation
			return res.status(400).json({ message: "Admin Already Exist" });
		}
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/register", async (req, res) => {
	const {
		role,
		name,
		username,
		password,
		address,
		phone,
		cardName,
		cardNumber,
	} = req.body;

	if (!name || !username || !password || !address || !role) {
		return res.status(400).json({ error: "Required fields missing." });
	}

	// needy = phone optional
	if (role !== "needy" && !phone) {
		return res.status(400).json({ error: "Phone required for this role." });
	}

	// credit card required for customer + donor
	if ((role === "customer" || role === "doner") && (!cardName || !cardNumber)) {
		return res.status(400).json({ error: "Credit card info required." });
	}

	try {
		await pool.query("BEGIN");

		await pool.query(
			`INSERT INTO member (username, password, name, address, phone_number)
       VALUES ($1, $2, $3, $4, $5)`,
			[username, password, name, address, phone || "N/A"]
		);

		// Insert into specific role tables
		if (role === "customer") {
			await pool.query(
				`INSERT INTO buyer (username, cardholder_name, card_number)
         VALUES ($1, $2, $3)`,
				[username, cardName, cardNumber]
			);

			await pool.query(`INSERT INTO customer (username) VALUES ($1)`, [
				username,
			]);
		} else if (role === "doner") {
			await pool.query(
				`INSERT INTO buyer (username, cardholder_name, card_number)
         VALUES ($1, $2, $3)`,
				[username, cardName, cardNumber]
			);

			await pool.query(`INSERT INTO doner (username) VALUES ($1)`, [username]);
		} else if (role === "needy") {
			await pool.query(`INSERT INTO needy (username) VALUES ($1)`, [username]);
		} else {
			//(role === "restaurant")
			await pool.query(`INSERT INTO restaurant (username) VALUES ($1)`, [
				username,
			]);
		}

		await pool.query("COMMIT");

		res.json({ success: true, message: "Registration successful." });
	} catch (err) {
		console.error("Error:", err);
		res.status(500).json({ message: "Database error." });
	}
});

app.get("/api/user/:username", async (req, res) => {
	const username = req.params.username;

	try {
		const result = await pool.query(
			`SELECT name, username, password, address, phone_number
       	FROM member
        WHERE username = $1`,
			[username]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ message: "Member not found" });
		}

		const user = result.rows[0];

		// Determine role
		const buyerCheck = await pool.query(
			`SELECT * FROM buyer WHERE username = $1`,
			[username]
		);
		const needyCheck = await pool.query(
			`SELECT * FROM needy WHERE username = $1`,
			[username]
		);
		const restaurantCheck = await pool.query(
			`SELECT * FROM restaurant WHERE username = $1`,
			[username]
		);

		let role = "unknown";
		if (buyerCheck.rows.length > 0) role = "customer/doner";
		if (needyCheck.rows.length > 0) role = "needy";
		if (restaurantCheck.rows.length > 0) role = "restaurant";

		// If buyer, get CC info
		let cardName = null;
		let cardNumber = null;

		if (role === "customer/doner") {
			const cardQuery = await pool.query(
				`SELECT cardholder_name, card_number FROM buyer WHERE username = $1`,
				[username]
			);
			if (cardQuery.rows.length > 0) {
				cardName = cardQuery.rows[0].cardholder_name;
				cardNumber = cardQuery.rows[0].card_number;
			}
		}

		res.json({ ...user, role, cardName, cardNumber });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error fetching user details." });
	}
});

app.post("/api/member_lookup", async (req, res) => {
	const { name } = req.body;
	try {
		const query = `
            SELECT * FROM member 
            WHERE name = $1;
        `;

		const result = await pool.query(query, [name]);

		if (result.rows.length === 0) {
			return res.status(404).json({ message: "Member not found" });
		}

		return res.json({ message: "Member found", member: result.rows });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/restaurant_report", async (req, res) => {
	const { name, year } = req.body;

	console.log("restaurant report request:", req.body);

	try {
		const query = `
            SELECT 
                p.pid AS plate_id,
                p.description,
                p.price,
                SUM(p.quantity) AS total_offered,
                COALESCE(SUM(r.quantity), 0) AS total_sold,
                SUM(p.quantity) - COALESCE(SUM(r.quantity), 0) AS total_unsold
            FROM sell s
            JOIN plate p ON s.plate_id = p.pid
            LEFT JOIN reserve r ON r.plate_id = p.pid
            WHERE s.username = $1
            AND EXTRACT(YEAR FROM s.start_time) = $2
            GROUP BY p.pid, p.description, p.price
            ORDER BY p.pid;
        `;

		const result = await pool.query(query, [name, year]);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ message: "No data found for the given restaurant and year" });
		}
		return res.json({ message: "Report generated", report: result.rows });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/buyer_report", async (req, res) => {
	const { name, year } = req.body;

	try {
		const query = `
            SELECT
                p.pid AS plate_id,
                p.description,
                p.price,
                SUM(b.quantity) AS times_bought,
                SUM(b.quantity) * p.price AS total_spent
            FROM buy b
            JOIN plate p ON b.pid = p.pid
            JOIN member m ON b.username = m.username
            WHERE m.name = $1
              AND EXTRACT(YEAR FROM b.buy_time) = $2
            GROUP BY p.pid, p.description, p.price
            ORDER BY p.pid;
        `;

		const result = await pool.query(query, [name, year]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				message: "No purchases found for this user/year.",
			});
		}

		return res.json({
			message: "Buyer report generated",
			report: result.rows,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/needy_report", async (req, res) => {
	const { name, year } = req.body;

	try {
		const query = `
            SELECT
                p.pid AS plate_id,
                p.description,
                p.price,
                SUM(r.quantity) AS total_received,
                SUM(r.quantity * p.price) AS total_value_received
            FROM reserve r
            JOIN plate p ON r.plate_id = p.pid
            JOIN member m ON r.member_username = m.username
            WHERE m.name = $1
              AND EXTRACT(YEAR FROM r.pick_up_time) = $2
            GROUP BY p.pid, p.description, p.price
            ORDER BY p.pid;
        `;

		const result = await pool.query(query, [name, year]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				message: "No free plates found for this user/year.",
			});
		}

		return res.json({
			message: "Needy report generated",
			report: result.rows,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/doner_report", async (req, res) => {
	const { name, year } = req.body;

	try {
		const query = `
            SELECT 
                p.pid,
                p.description,
                p.price,
                SUM(b.quantity) AS total_donated,           -- total bought by donor
                COALESCE(SUM(r.quantity), 0) AS given_to_needy,  -- reserved by needy
                (SUM(b.quantity) - COALESCE(SUM(r.quantity), 0)) AS remaining_quantity,
                SUM(b.quantity * p.price) AS total_donation_value
            FROM buy b
            JOIN plate p ON b.pid = p.pid
            JOIN doner d ON d.username = b.username
            JOIN member m ON b.username = m.username
            LEFT JOIN reserve r ON p.pid = r.plate_id
            WHERE m.name = $1
            AND EXTRACT(YEAR FROM b.buy_time) = $2
            GROUP BY p.pid, p.description, p.price
            ORDER BY p.pid;
        `;

		const result = await pool.query(query, [name, year]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				message: "No purchases found for this doner/year.",
			});
		}

		return res.json({
			message: "Doner report generated",
			report: result.rows,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

// Start server
app.listen(process.env.PORT, () =>
	console.log(`Server running on port ${process.env.PORT}`)
);
