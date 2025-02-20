import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: "https://oeces-general-assembly.netlify.app", // Allow only your frontend
    methods: "GET,POST", // Allowed methods
    allowedHeaders: "Content-Type,Authorization", // Allowed headers
    credentials: true, // Allow cookies (if needed)
}));
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src *; connect-src *; script-src 'self' 'unsafe-inline';");
    next();
});

const db = mysql.createPool({
    uri: process.env.MYSQL_URL,
    connectionLimit: 5,
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database.");
        connection.release(); // Release connection after checking
    }
});

app.post("/check-registration", async (req, res) => {
    try {
        const { tup_id } = req.body;
        const result = await db.query("SELECT * FROM registrations WHERE tup_id = ?", [tup_id]);

        const response = { exists: result.length > 0 };
        console.log("Response JSON:", response); // ✅ Log the response

        res.json(response);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/register", (req, res) => {
    console.log("Received /register request:", req.body);
    
    const { tup_id } = req.body;
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

    const insertQuery = "INSERT INTO registrations (tup_id, time) VALUES (?, ?)";

    db.query(insertQuery, [tup_id, timestamp], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to register" });
        }
        res.json({ success: true, message: "Student registered successfully" });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});