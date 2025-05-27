import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './routes/user.routes.js';
import { leadsRouter } from './routes/leads.routes.js';
import { groupRouter } from './routes/leadsGroup.routes.js';
import { emailRoutes } from './routes/email.routes.js';
import { teamRouter } from './routes/team.routes.js';
import { connectionDB } from './utils/database.utils.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectionDB();

// Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/leads', leadsRouter);
app.use('/api/v1/groups', groupRouter);
app.use('/api/v1/emails', emailRoutes);
app.use('/api/v1/team', teamRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 