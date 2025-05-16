const handleSignin = async (req, res, supabase, bcrypt) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('incorrect form submission');
    }

    try {
        // Get user from users table
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.error('Database error during signin:', error);
            if (error.code === 'PGRST116') {
                return res.status(400).json('wrong credentials');
            }
            throw error;
        }

        if (!user) {
            return res.status(400).json('wrong credentials');
        }

        // Compare password hash
        try {
            const isValid = bcrypt.compareSync(password, user.password);
            
            if (isValid) {
                // Don't send password back to client
                const { password, ...userWithoutPassword } = user;
                return res.json(userWithoutPassword);
            } else {
                return res.status(400).json('wrong credentials');
            }
        } catch (bcryptError) {
            console.error('Authentication error');
            return res.status(400).json('wrong credentials');
        }
    } catch (err) {
        console.error('Signin error:', err);
        res.status(400).json('wrong credentials');
    }
}

module.exports = {
    handleSignin: handleSignin
}