let userModel = require("../schemas/users");
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let fs = require('fs')
let path = require('path')

module.exports = {
    CreateAnUser: async function (username, password, email, role, fullName, avatarUrl, status, loginCount) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        await newItem.save();
        return newItem;
    },
    GetAllUser: async function () {
        return await userModel
            .find({ isDeleted: false })
    },
    GetUserById: async function (id) {
        try {
            return await userModel
                .find({
                    isDeleted: false,
                    _id: id
                })
        } catch (error) {
            return false;
        }
    },
    QueryLogin: async function (username, password) {
        if (!username || !password) {
            return false;
        }
        let user = await userModel.findOne({
            username: username,
            isDeleted: false
        })
        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                // Đọc private key từ file
                const privateKey = fs.readFileSync(path.join(__dirname, '../private.pem'), 'utf8');
                
                return jwt.sign({
                    id: user.id
                }, privateKey, {
                    algorithm: 'RS256',
                    expiresIn: '1d'
                })
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    changePassword: async function (userId, oldPassword, newPassword) {
        try {
            // Tìm user
            let user = await userModel.findOne({
                _id: userId,
                isDeleted: false
            });

            if (!user) {
                return {
                    success: false,
                    message: "User not found"
                };
            }

            // Kiểm tra old password
            if (!bcrypt.compareSync(oldPassword, user.password)) {
                return {
                    success: false,
                    message: "oldpassword khong dung"
                };
            }

            // Hash new password
            let salt = bcrypt.genSaltSync(10);
            let hashedNewPassword = bcrypt.hashSync(newPassword, salt);

            // Update password
            user.password = hashedNewPassword;
            await user.save();

            return {
                success: true,
                message: "Doi mat khau thanh cong",
                user: user
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}