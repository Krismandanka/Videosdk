const User = require("../models/User");




exports.userCreate = async (req, res) => {
	try {
		const {
			firstName,
			
			email
		} = req.body;
		if (
			!firstName ||
			
			!email
			
		) {
			return res.status(403).send({
				success: false,
				message: "All Fields are required",
			});
		}
		

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please sign in to continue.",
			});
		}

		
		// Hash the password
		
		const user = await User.create({
			firstName,
			
			email
			
		});

		return res.status(200).json({
			success: true,
			user,
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
	}
};