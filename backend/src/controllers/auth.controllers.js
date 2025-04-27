const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get the default role (assuming 'user' is the default role name)
    const defaultRole = await Role.findOne({ name: 'user' });
    if (!defaultRole) {
      return res.status(500).json({ message: 'Default role not found. Please contact administrator.' });
    }

    // Create new user with default role
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: defaultRole._id
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
}; 