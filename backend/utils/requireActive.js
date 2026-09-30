const requireActive = (req, res, next) => {
  if (req.user.isBlocked) {
    return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
  }
  if (req.user.verificationStatus === 'suspended') {
    return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
  }
  next();
};

module.exports = requireActive;
