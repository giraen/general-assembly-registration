import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();

const corsOptions = {
    origin: 'https://oeces-general-assembly.netlify.app/', // Change this to your frontend URL if needed
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
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
        const { student_id } = req.body;
        const result = await db.query("SELECT * FROM registrations WHERE student_id = ?", [student_id]);

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
    
    const { student_id } = req.body;
    const timestamp = new Date();

    const insertQuery = "INSERT INTO registrations (student_id, registered_at) VALUES (?, ?)";

    db.query(insertQuery, [student_id, timestamp], (err, results) => {
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