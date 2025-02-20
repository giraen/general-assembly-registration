import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

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

        if (result.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    

    // const query = "SELECT * FROM registrations WHERE student_id = ?";
    // db.query(query, [student_id], (err, results) => {
    //     if (err) {
    //         console.error("Database error:", err);
    //         return res.status(500).json({ error: "Database error" });
    //     }
    //     res.json({ exists: results.length > 0 });
    // });
});

app.post("/register", (req, res) => {
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