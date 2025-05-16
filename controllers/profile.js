const handleProfileGet = async (req, res, supabase) => {
    const { id } = req.params;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (user) {
            res.json(user);
        } else {
            throw new Error('User not found');
        }
    } catch (err) {
        res.status(400).json('error getting user');
    }
}

module.exports = {
    handleProfileGet
}