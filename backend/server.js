import express from "express";
const path = "/workspaces/DBS-Group-Project/"
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
	res.sendFile(path + "/frontend/index.html");
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

app.post("/api/register", async (req, res) => {
  const { role, name, username, password, address, phone, cardName, cardNumber } = req.body;

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
      [username, password, name, address, phone || 'N/A']
    );

    // Insert into specific role tables
    if (role === "customer") {
      await pool.query(
        `INSERT INTO buyer (username, cardholder_name, card_number)
         VALUES ($1, $2, $3)`,
        [username, cardName, cardNumber]
      );

      await pool.query(
        `INSERT INTO customer (username) VALUES ($1)`,
        [username]
      );
    }

    else if (role === "doner") {
      await pool.query(
        `INSERT INTO buyer (username, cardholder_name, card_number)
         VALUES ($1, $2, $3)`,
        [username, cardName, cardNumber]
      );

      await pool.query(
        `INSERT INTO doner (username) VALUES ($1)`,
        [username]
      );
    }

    else if (role === "needy") {
      await pool.query(
        `INSERT INTO needy (username) VALUES ($1)`,
        [username]
      );
    }

    else { //(role === "restaurant") 
      await pool.query(
        `INSERT INTO restaurant (username) VALUES ($1)`,
        [username]
      );
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

	try{
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

		res.json({...user, role, cardName, cardNumber});


	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error fetching user details." });
	}
});

// Get all items for a restaurant
app.get("/api/restaurant/items", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Restaurant username is required" });
  }

  try {
    const query = `
      SELECT
        p.pid,
        p.description,
        p.price,
        p.quantity AS total_quantity,
        COUNT(s.sell_id) AS total_sold,
        (p.quantity - COUNT(s.sell_id)) AS quantity_available,
        p.start_time,
        p.end_time
      FROM plate p
      LEFT JOIN sell s ON p.pid = s.plate_id
      WHERE p.username = $1
      GROUP BY p.pid, p.description, p.price, p.quantity, p.start_time, p.end_time
      ORDER BY p.pid;
    `;

    const result = await pool.query(query, [username]);
    res.json(result.rows);
  } catch (err) {
    console.error("API ERROR /api/restaurant/items:", err);
    res.status(500).json({ message: "Error fetching restaurant items" });
  }
});

// Add a new plate
app.post("/api/restaurant/items", async (req, res) => {
  const username = req.query.username;
  const { description, price, quantity, start_time, end_time } = req.body;

  if (!username || !description || !price || !quantity || !start_time || !end_time) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    await pool.query("BEGIN");

    const plateResult = await pool.query(
      `INSERT INTO plate (username, price, quantity, description, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING pid`,
      [username, price, quantity, description, start_time, end_time]
    );

    const pid = plateResult.rows[0].pid;

    await pool.query("COMMIT");

    res.json({ message: "Item added successfully", pid });
  } catch (err) {
    console.error("ADD ITEM ERROR:", err);
    await pool.query("ROLLBACK");
    res.status(500).json({ message: "Error adding restaurant item" });
  }
});

// Update an existing plate
app.put("/api/restaurant/items", async (req, res) => {
  const username = req.query.username;
  const { pid, description, price, quantity, start_time, end_time } = req.body;

  if (!username || !pid) {
    return res.status(400).json({ message: "Username and Plate ID are required." });
  }

  try {
    await pool.query("BEGIN");

    await pool.query(
      `UPDATE plate
       SET description = COALESCE($1, description),
           price = COALESCE($2, price),
           quantity = COALESCE($3, quantity),
           start_time = COALESCE($4, start_time),
           end_time = COALESCE($5, end_time)
       WHERE pid = $6 AND username = $7`,
      [description, price, quantity, start_time, end_time, pid, username]
    );

    await pool.query("COMMIT");

    res.json({ message: "Item updated successfully" });
  } catch (err) {
    console.error("UPDATE ITEM ERROR:", err);
    await pool.query("ROLLBACK");
    res.status(500).json({ message: "Error updating item" });
  }
});

// Delete a plate
app.delete("/api/restaurant/items/:pid", async (req, res) => {
  const username = req.query.username;
  const { pid } = req.params;

  if (!username || !pid) {
    return res.status(400).json({ message: "Username and Plate ID are required." });
  }

  try {
    await pool.query("BEGIN");

    // Remove all sell entries for this plate
    await pool.query(`DELETE FROM sell WHERE plate_id = $1`, [pid]);

    // Delete the plate itself
    await pool.query(`DELETE FROM plate WHERE pid = $1 AND username = $2`, [pid, username]);

    await pool.query("COMMIT");

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("DELETE ITEM ERROR:", err);
    await pool.query("ROLLBACK");
    res.status(500).json({ message: "Error deleting item" });
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
	const { username, year } = req.body;

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
            WHERE b.username = $1
              AND EXTRACT(YEAR FROM b.buy_time) = $2
            GROUP BY p.pid, p.description, p.price
            ORDER BY p.pid;
        `;

		const result = await pool.query(query, [username, year]);

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
	const { username, year } = req.body;

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
            WHERE r.member_username = $1
              AND EXTRACT(YEAR FROM r.pick_up_time) = $2
            GROUP BY p.pid, p.description, p.price
            ORDER BY p.pid;
        `;

		const result = await pool.query(query, [username, year]);

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
	const { username, year } = req.body;

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
            LEFT JOIN reserve r ON p.pid = r.plate_id
            WHERE b.username = $1
            AND EXTRACT(YEAR FROM b.buy_time) = $2
            GROUP BY p.pid, p.description, p.price
            ORDER BY p.pid;
        `;

		const result = await pool.query(query, [username, year]);

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
