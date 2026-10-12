import { Router } from "express";
import { forgotPassword, login, logout, profile, register, resetPassword } from "../controllers/auth.controller.mjs";
import varifytoken from "../midlleware/varifymiddleware.mjs";
import roleMiddleware from "../midlleware/RoleMiddleware.mjs";


const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password', resetPassword)
authRouter.get('/profile', varifytoken, roleMiddleware('admin'), profile)


export default authRouter