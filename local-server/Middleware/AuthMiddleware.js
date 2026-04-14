import jwt from 'jsonwebtoken';

function authenticateToken (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized. No token provided.'
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({
            message: 'Forbidden - Invalid or expired token',
        });
    }
};

function optionalAuth(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if(!token){
        req.user = null
        return next()
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;//masuk sebagai guest
            return next();
        }
        req.user = user;//login
        next();
    });
}

export {authenticateToken, optionalAuth}