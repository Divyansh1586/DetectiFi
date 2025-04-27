const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const sendEmail = require("../utils/sendEmail");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//  Signup (Email & Password)
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ email, password: hashedPassword, name: name || email.split("@")[0] });
    res.json({ token: generateToken(user), user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//  Login (Email & Password)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(user), user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//  Google OAuth
exports.googleAuth = async (req, res) => {
    try {
        const { email, name, googleId, picture } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ email, name, googleId, picture });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ user, token });
        
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: "Google authentication failed" });
    }
};