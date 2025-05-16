const handleRegister = async (req, res, supabase, bcrypt) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }

    try {
        const hashedPassword = bcrypt.hashSync(password);

        // First check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing user:', checkError);
            throw checkError;
        }

        if (existingUser) {
            return res.status(400).json('user already exists');
        }

        // Create new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    email: email,
                    name: name,
                    password: hashedPassword,
                    entries: 0
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating new user:', error);
            throw error;
        }

        // Don't send password back to client
        const { password: _, ...userWithoutPassword } = newUser;
        res.json(userWithoutPassword);
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(400).json('unable to register');
    }
}

module.exports = {
    handleRegister
}