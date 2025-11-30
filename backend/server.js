import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";

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
	res.send("API is running...");
});

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

		return res.json({ message: "Member found", member: result.rows[0] });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

// Start server
app.listen(process.env.PORT, () =>
	console.log(`Server running on port ${process.env.PORT}`)
);
