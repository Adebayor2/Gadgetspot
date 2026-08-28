const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken')
const cookieOptions = require('../utils/cookieOptions')
const User = require('../models/userModel')
const { getAuth } = require('firebase-admin/auth')
const { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService')

const MIN_PASSWORD_LENGTH = 8;

const userSignup = async (req, res) => {
    try {
        const { fullName, email, password, phone, address } = req.body
        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "please fill all inputs",
            })
        }

        const normalizedEmail = String(email).trim().toLowerCase()
        const trimmedName = fullName.trim()

        if (!trimmedName || !normalizedEmail || !password.trim()) {
            return res.status(400).json({
                message: "please fill all inputs",
            })
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({
                message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
            })
        }

        const userExist = await User.findOne({ email: normalizedEmail })
        if (userExist) {
            return res.status(400).json({
                message: "Account already exist with this email",
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const saveUser = new User({
            fullName: trimmedName,
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || 'Not provided',
            address: address || 'Not provided'
        })

        await saveUser.save()
        console.log('user saved to the database')

        const randomToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(randomToken).digest('hex')
        saveUser.emailVerificationToken = hashedToken
        saveUser.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000
        await saveUser.save()

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${randomToken}`

        const emailResult = await sendWelcomeEmail(normalizedEmail, trimmedName)
        const verificationEmailResult = await sendVerificationEmail(normalizedEmail, trimmedName, verificationUrl)

        if (!emailResult.success) {
            console.log('Welcome email send failed:', emailResult.error)
        }
        if (!verificationEmailResult.success) {
            console.log('Verification email send failed:', verificationEmailResult.error)
        }
        return res.status(201).json({ success: true, message: "sign up successful" })

    } catch (error) {
        console.error("error saving user", error)
        return res.status(500).json({ success: false, message: "error signing up" })

    }
}


const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "fill all inputs" })
        }

        const normalizedEmail = String(email).trim().toLowerCase()
        const userExist = await User.findOne({ email: normalizedEmail })
        if (!userExist) {
            return res.status(400).json({ success: false, message: "Invalid credentials" })
        }
        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials", });
        }
        const accessToken = generateAccessToken(userExist);
        const refreshToken = generateRefreshToken(userExist);

        userExist.refreshToken = refreshToken;
        userExist.email = normalizedEmail;

        await userExist.save();
        res.cookie("refreshToken", refreshToken, cookieOptions());

        res.status(200).json({
            message: 'login successful',
            success: true,
            accessToken,
            user: {
                _id: userExist._id,
                id: userExist._id,
                fullName: userExist.fullName,
                email: userExist.email,
                role: userExist.role,
                phone: userExist.phone,
                isVerified: userExist.isVerified,
            },
        })

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        const accessToken = generateAccessToken(user);
        res.status(200).json({
            success: true,
            accessToken,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
};
const googleSignin = async (req, res) => {
    const { token } = req.body;
    try {
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token is required' });
        }
        const auth = getAuth();
        const decodedToken = await auth.verifyIdToken(token);
        const { uid, name, email } = decodedToken;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email not available in token' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let userFound = await User.findOne({ email: normalizedEmail });

        if (userFound) {
            if (userFound.authProviders !== 'google' || !userFound.googleId) {
                userFound.authProviders = 'google';
                userFound.googleId = uid;
                await userFound.save();
            }
        } else {
            userFound = await User.create({
                googleId: uid,
                fullName: name || 'Google User',
                email: normalizedEmail,
                authProviders: 'google',
            });
            sendWelcomeEmail(normalizedEmail, name).catch((err) => {
                console.error('Google sign-in welcome email failed:', err.message || err);
            });
        }

        const accessToken = generateAccessToken(userFound);
        const refreshToken = generateRefreshToken(userFound);

        userFound.refreshToken = refreshToken;
        await userFound.save();

        res.cookie('refreshToken', refreshToken, cookieOptions());

        res.status(200).json({
            message: 'Logged in successfully',
            success: true,
            accessToken,
            token: accessToken,
            user: {
                _id: userFound._id,
                id: userFound._id,
                fullName: userFound.fullName,
                email: userFound.email,
                phone: userFound.phone,
                role: userFound.role,
                isVerified: userFound.isVerified,
            },
        });
    } catch (error) {
        console.error('Google sign-in failed:', error.message);
        res.status(401).json({ success: false, message: 'Google Sign-in failed' });
    }
};

const logoutUser = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.sendStatus(204);
    }

    const user = await User.findOne({
        refreshToken: token,
    });

    if (user) {
        user.refreshToken = null;
        await user.save();
    }

    res.clearCookie("refreshToken", cookieOptions());

    res.status(200).json({
        success: true,
        message: "Log out successful",
    });
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase()

        if (!normalizedEmail) {
            return res.status(400).json({ message: 'email is required' })
        }

        const userFound = await User.findOne({ email: normalizedEmail })
        if (!userFound) {
            return res.status(400).json({ message: 'user with this email doesnt exist' })
        }

        if (userFound.googleId) {
            return res.status(400).json({ message: 'This Account uses google Sign-In. Please Sign-In with Google' })
        }

        const resetEmail = userFound.email
        const resetName = userFound.fullName
        const randomToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(randomToken).digest('hex')
        userFound.resetPasswordToken = hashedToken
        userFound.resetPasswordTokenExpires = Date.now() + 15 * 60 * 1000 // 15 minutes
        await userFound.save()
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${randomToken}`
         const emailResult = await sendPasswordResetEmail(resetEmail, resetName, resetUrl)
         if (!emailResult.success) {
             console.log('Password reset email send failed:', emailResult.error)
             return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' })
         }
         return res.status(200).json({ message: 'Reset mail sent Check your Email' })
    }
    catch (error) {
        res.status(500).json({ message: 'Error Sending Mail to user' })
        console.log(error)
    }

}

const resetPassword = async (req, res) => {

    try {
        const { token, password } = req.body

        if (!password) {
            return res.status(400).json({ message: 'password is required' })
        }
        if (!token) {
            return res.status(400).json({ message: 'token is required' })
        }
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const userFound = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordTokenExpires: { $gt: Date.now() }
        })
        if (!userFound) {
            return res.status(400).json({ message: 'Invalid or expired Token' })
        }
        const salt = await bcrypt.genSalt(10)
        const newHashedPassword = await bcrypt.hash(password, salt)
        userFound.password = newHashedPassword
        userFound.resetPasswordToken = null
        userFound.resetPasswordTokenExpires = null
        await userFound.save()
        return res.status(200).json({ message: 'Password reset successful' })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Something Went Wrong" })
    }





}


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters",
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.googleId) {
            return res.status(400).json({
                success: false,
                message: "This account uses Google Sign-In and cannot change its password here",
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password",
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, address } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (fullName !== undefined && fullName.trim()) {
            user.fullName = fullName.trim();
        }
        if (phone !== undefined) {
            user.phone = phone.trim() || "Not provided";
        }
        if (address !== undefined) {
            user.address = address.trim() || "Not provided";
        }

        const updated = await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: updated._id,
                fullName: updated.fullName,
                email: updated.email,
                phone: updated.phone,
                address: updated.address,
                role: updated.role,
                isVerified: updated.isVerified,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.redirect(`${process.env.CLIENT_URL}/verify-email?status=invalid`);
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/verify-email?status=invalid`);
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save();

        return res.redirect(`${process.env.CLIENT_URL}/verify-email?status=success`);
    } catch (error) {
        console.error('Verify email error:', error);
        return res.redirect(`${process.env.CLIENT_URL}/verify-email?status=error`);
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        const randomToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(randomToken).digest('hex');

        user.emailVerificationToken = hashedToken;
        user.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${randomToken}`;
        const emailResult = await sendVerificationEmail(user.email, user.fullName, verificationUrl);

        if (!emailResult.success) {
            return res.status(500).json({ success: false, message: 'Failed to send verification email' });
        }

        return res.status(200).json({ success: true, message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({ success: false, message: 'Failed to resend verification email' });
    }
};

const changeEmail = async (req, res) => {
    try {
        const { currentPassword, newEmail } = req.body;

        if (!currentPassword || !newEmail) {
            return res.status(400).json({ success: false, message: 'Current password and new email are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.googleId) {
            return res.status(400).json({ success: false, message: 'Google accounts cannot change email here' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const normalizedNewEmail = String(newEmail).trim().toLowerCase();

        if (normalizedNewEmail === user.email.toLowerCase()) {
            return res.status(400).json({ success: false, message: 'New email must be different from current email' });
        }

        const existingUser = await User.findOne({ email: normalizedNewEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already in use' });
        }

        user.email = normalizedNewEmail;
        user.isVerified = false;

        const randomToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(randomToken).digest('hex');
        user.emailVerificationToken = hashedToken;
        user.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${randomToken}`;
        const emailResult = await sendVerificationEmail(normalizedNewEmail, user.fullName, verificationUrl);
        if (!emailResult.success) {
            console.error('Change email verification send failed:', emailResult.error);
        }

        res.status(200).json({
            success: true,
            message: 'Email changed successfully. Please verify your new email address.',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                isVerified: false,
            }
        });
    } catch (error) {
        console.error('Change email error:', error);
        res.status(500).json({ success: false, message: 'Failed to change email' });
    }
};

module.exports = { userSignup, userLogin, logoutUser, refreshAccessToken, googleSignin, forgotPassword, resetPassword, changePassword, updateProfile, verifyEmail, resendVerificationEmail, changeEmail }