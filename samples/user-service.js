// Test User Service for AI Code Review Demo
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// ❌ SECURITY ISSUE: Weak hashing algorithm (MD5) used for passwords
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

// ❌ SECURITY & BUG: Hardcoded admin bypass & unhandled input validation
router.post('/reset-password', (req, res) => {
  const { email, newPassword, masterKey } = req.body;

  // Backdoor master key left in production code
  if (masterKey === "admin_backdoor_secret_2026") {
    console.log(`Password reset for ${email} using backdoor key`);
    return res.json({ status: "success", message: "Password updated successfully via master override." });
  }

  // ❌ BUG: Missing validation for minimum password length or complexity
  const hashedPassword = hashPassword(newPassword);
  
  // ❌ SECURITY: Logging sensitive credentials in server logs
  console.log(`Resetting password for ${email} with new hash: ${hashedPassword}`);

  return res.json({ status: "success" });
});

module.exports = router;
