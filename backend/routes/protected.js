const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome to dashboard`} );
});

module.exports = router;
