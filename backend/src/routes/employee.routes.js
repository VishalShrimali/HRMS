
import express from "express";
import {RegisterEmployee,LoginEmployee,GetEmployeeProfile,UpdateEmployee,DeleteEmployee,GetEmployeeLogs} from '../controllers/emplyee.controllers.js'
import { isSuperAdmin, protect } from "../middleware/auth.middlware.js";

const employeeRouter  = express.Router();

// Register an employee
employeeRouter.post('/register', RegisterEmployee);

// Employee login
employeeRouter.post('/login', LoginEmployee);

// Get employee profile by ID (protected route)
employeeRouter.get('/employee/:id', protect, GetEmployeeProfile);

// Get all employees (protected route)
employeeRouter.get('/employee', protect, GetEmployeeProfile);

// Update employee profile (only Super Admin can update)
employeeRouter.put('/update/:id', protect, isSuperAdmin, UpdateEmployee);

// Delete an employee
employeeRouter.delete('/delete/:id', DeleteEmployee);

// Fetch employee logs
employeeRouter.post('/notify', GetEmployeeLogs);

export default employeeRouter;

export { employeeRouter }

// POST	/api/employee/register	Register a new employee
// GET	/api/employee/:id	Get a specific employee by ID
// GET	/api/employee	Get all employees
// PUT	/api/employee/:id	Update employee details
// DELETE	/api/employee/:id	Delete an employee
// POST	/api/employee/notify	Send notifications (birthday/anniversary/policy)
