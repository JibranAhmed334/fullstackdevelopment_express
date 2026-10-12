import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String, required: true, trim: true, lowercase: true
        },
        email: {
            type: String, required: true, unique: true, trim: true, lowercase: true
        },
        password: {
            type: String, required: true, trim: true
        },
        role: {
            type: String, enum: ['admin', 'customer'], default: 'customer'
        },
        address: {
            type: String, required: true, trim: true
        },
        workphone_no: {
            type: String, unique: true
        },
        cellphone_no: {
            type: String, unique: true
        },
        dob: {
            type: Date, required: true
        },
        passwordResetToken: {
            type: String
        },
        passwordResetExpires: {
            type: Date
        }

    },
    { timestamps: true }
)

const User = mongoose.model("User", userSchema)
export default User