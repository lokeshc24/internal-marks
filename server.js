const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.static('public')); // Serve static files (HTML, CSS, JS)
app.use(express.json());

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST API - to fetch result
app.post('/get-result', (req, res) => {
    try {
        const { enrollment, exam } = req.body;

        console.log('Request received:', { enrollment, exam }); // Debug log

        if (!enrollment || !exam) {
            return res.status(400).json({ message: "Enrollment and exam are required." });
        }

        // Read the JSON file dynamically
        let data;
        try {
            data = fs.readFileSync(path.join(__dirname, 'full_semester6_marks_updated.json'), 'utf-8');
        } catch (fileError) {
            console.error('Error reading JSON file:', fileError.message);
            return res.status(500).json({ message: "Error reading data file." });
        }

        let students;
        try {
            students = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON file:', parseError.message);
            return res.status(500).json({ message: "Error parsing data file." });
        }

        console.log('Students dataset loaded successfully.'); // Debug log

        // Normalize enrollment (lowercase and remove spaces)
        const searchEnrollment = enrollment.trim().toLowerCase();

        // Find the student by enrollment
        const student = students.find(std => std.id.trim().toLowerCase() === searchEnrollment);

        console.log('Matching student:', student); // Debug log

        if (!student) {
            return res.status(404).json({ message: "Student not found!" });
        }

        let marks;

        // Get marks based on the exam type
        if (exam === 'CET1') {
            marks = student.cet1_marks;
        } else if (exam === 'CET2') {
            marks = student.cet2_marks;
        } else {
            return res.status(400).json({ message: "Invalid exam type selected!" });
        }

        // Handle "AB" (absent) case
        if (marks === "AB") {
            return res.json({ name: student.name, message: "Student was absent for this exam." });
        }

        res.json({ name: student.name, marks });
    } catch (error) {
        console.error('Unexpected Error:', error.message); // Log the error
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});