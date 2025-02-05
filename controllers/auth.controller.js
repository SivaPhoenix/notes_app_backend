const User = require('../modals/user.modal');
const jwt = require('jsonwebtoken');

// Signup
exports.signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    
    if (!fullName || !email || !password) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: true, message: "Email already exists" });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3d' });
    res.json({ error: false, user, message: "Account created successfully", accessToken });
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: true, message: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
        return res.status(400).json({ error: true, message: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
    res.json({ error: false, user, message: "Logged in successfully", accessToken });
};

// Get user
exports.getUser = async (req, res) => {
    const { user } = req.user;
    const foundUser = await User.findById(user._id);
    if (!foundUser) {
        return res.status(404).json({ error: true, message: "User not found" });
    }
    res.json({ user: foundUser, message: "User retrieved successfully" });
};
