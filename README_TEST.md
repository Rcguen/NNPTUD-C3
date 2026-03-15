# 📋 HƯỚNG DẪN TEST TOÀN BỘ CHỨC NĂNG

Hướng dẫn chi tiết để test 3 yêu cầu chính:
1. ✅ Chức năng Đổi mật khẩu (Change Password)
2. ✅ Cấu hình JWT RS256
3. ✅ Login & /me routes

---

## 🚀 BƯỚC 1: CẤU HÌNH VÀ KHỞI ĐỘNG

### 1.1 Kiểm tra Keys đã được tạo
```bash
# Kiểm tra file private.pem và public.pem có tồn tại không
ls -la private.pem public.pem

# Output mong đợi:
# -rw-r--r--  1 user  group  1675 Mar 15 2026 private.pem
# -rw-r--r--  1 user  group   451 Mar 15 2026 public.pem
```

### 1.2 Nếu chưa có keys, chạy lệnh sinh key
```bash
node generateKeys.js

# Output mong đợi:
# ✓ private.pem đã được tạo
# ✓ public.pem đã được tạo
# ✓ Đã sinh thành công cặp RSA 2048-bit keys cho JWT RS256
```

### 1.3 Khởi động server
```bash
npm start

# Output mong đợi:
# [nodemon] starting `node ./bin/www`
# connected
# Listening on port 3000
```

---

## 📝 BƯỚC 2: TEST CHỨC NĂNG

Sử dụng **Postman** hoặc công cụ tương tự để test các endpoint.

### 2.1 REGISTER USER MỚI

**Request:**
```
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "TestPass@123",
  "email": "testuser@example.com"
}
```

**Expected Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "$2b$10$...", // bcrypt hashed
  "fullName": "",
  "avatarUrl": "https://i.sstatic.net/l60Hf.png",
  "status": false,
  "role": "69b6231b3de61addb401ea26",
  "loginCount": 0,
  "isDeleted": false,
  "createdAt": "2026-03-15T10:30:00.000Z",
  "updatedAt": "2026-03-15T10:30:00.000Z",
  "__v": 0
}
```

---

### 2.2 LOGIN (Nhận Token RS256)

**Request:**
```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "TestPass@123"
}
```

**Expected Response (200 OK):**
```json
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTY3MzQwMzgwMCwiZXhwIjoxNjczNDkwMjAwfQ.xYzK5m9...
```

**Giải thích Token:**
```javascript
// Header: Chứng thực JWT RS256
{
  "alg": "RS256",
  "typ": "JWT"
}

// Payload: Chứa user id
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1673403800,
  "exp": 1673490200    // Expires in 1 day
}

// Signature: Ký bằng private.pem (RS256)
RSASSA-PKCS1-v1_5 using SHA-256
```

> **⚠️ LƯU Ý:** Lưu token này để dùng trong các request tiếp theo

---

### 2.3 GET USER INFO (/ME)

**Test xác thực token RS256 thành công:**

**Request:**
```
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "$2b$10$...",
    "fullName": "",
    "avatarUrl": "https://i.sstatic.net/l60Hf.png",
    "status": false,
    "role": "69b6231b3de61addb401ea26",
    "loginCount": 0,
    "isDeleted": false,
    "createdAt": "2026-03-15T10:30:00.000Z",
    "updatedAt": "2026-03-15T10:30:00.000Z",
    "__v": 0
  }
]
```

**Test Token Lỗi (Không có token):**

**Request:**
```
GET http://localhost:3000/api/v1/auth/me
(NO Authorization header)
```

**Expected Response (403 Forbidden):**
```json
{
  "message": "ban chua dang nhap"
}
```

---

### 2.4 CHANGE PASSWORD ⭐ (YÊU CẦU CHÍNH)

#### 2.4.1 Đổi mật khẩu - Thành công

**Request:**
```
POST http://localhost:3000/api/v1/auth/changepassword
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "oldpassword": "TestPass@123",
  "newpassword": "NewPass@456"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Doi mat khau thanh cong",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "$2b$10$xYzK5m9...", // bcrypt hashed (NEW)
    "fullName": "",
    "avatarUrl": "https://i.sstatic.net/l60Hf.png",
    "status": false,
    "role": "69b6231b3de61addb401ea26",
    "loginCount": 0,
    "isDeleted": false,
    "createdAt": "2026-03-15T10:30:00.000Z",
    "updatedAt": "2026-03-15T10:45:00.000Z", // UPDATED
    "__v": 0
  }
}
```

#### 2.4.2 Test Validation - Mật khẩu cũ sai

**Request:**
```
POST http://localhost:3000/api/v1/auth/changepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldpassword": "WrongPassword@123",
  "newpassword": "NewPass@456"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "oldpassword khong dung"
}
```

#### 2.4.3 Test Validation - Mật khẩu mới quá ngắn

**Request:**
```
POST http://localhost:3000/api/v1/auth/changepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldpassword": "TestPass@123",
  "newpassword": "123"
}
```

**Expected Response (400 Bad Request):**
```json
[
  {
    "newpassword": "newpassword phai co it nhat 6 ki tu"
  }
]
```

#### 2.4.4 Test Validation - Mật khẩu mới giống mật khẩu cũ

**Request:**
```
POST http://localhost:3000/api/v1/auth/changepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldpassword": "TestPass@123",
  "newpassword": "TestPass@123"
}
```

**Expected Response (400 Bad Request):**
```json
[
  {
    "newpassword": "newpassword khong duoc giong oldpassword"
  }
]
```

#### 2.4.5 Test Validation - Thiếu field

**Request:**
```
POST http://localhost:3000/api/v1/auth/changepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldpassword": "TestPass@123"
}
```

**Expected Response (400 Bad Request):**
```json
[
  {
    "newpassword": "newpassword khong duoc de trong"
  }
]
```

---

### 2.5 LOGIN LẠI VỚI MẬT KHẨU MỚI

**Request:**
```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "NewPass@456"
}
```

**Expected Response (200 OK):**
```json
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTY3MzQwNDYwMCwiZXhwIjoxNjczNDkxMDAwfQ.yAbC5d2...
```

> **✅ ĐÓ!** Token được cấp lại thành công = Mật khẩu đã thay đổi thành công

---

## 🧪 CURL COMMANDS (DÙNG TERMINAL)

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass@123",
    "email": "testuser@example.com"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass@123"
  }'
```

### Get /me (Thay TOKEN tại đây)
```bash
TOKEN="<PASTE_YOUR_TOKEN_HERE>"

curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Change Password (Thay TOKEN tại đây)
```bash
TOKEN="<PASTE_YOUR_TOKEN_HERE>"

curl -X POST http://localhost:3000/api/v1/auth/changepassword \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldpassword": "TestPass@123",
    "newpassword": "NewPass@456"
  }'
```

### Login với mật khẩu mới
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "NewPass@456"
  }'
```

---

## ✅ CHECKLIST TEST

### Chức năng Change Password
- [ ] POST `/api/v1/auth/changepassword` với oldpassword & newpassword → Success 200
- [ ] Validate: oldpassword sai → 400 Bad Request
- [ ] Validate: newpassword < 6 ký tự → 400 Bad Request
- [ ] Validate: newpassword == oldpassword → 400 Bad Request
- [ ] Validate: Thiếu oldpassword → 400 Bad Request
- [ ] Validate: Thiếu newpassword → 400 Bad Request
- [ ] Kiểm tra DB: Password đã được hash bằng bcrypt
- [ ] Kiểm tra: Login lại với password mới thành công

### JWT RS256
- [ ] Token từ login có `"alg": "RS256"` trong header
- [ ] Middleware `/me` xác thực token bằng public.pem
- [ ] Token sai → 403 Forbidden
- [ ] Token hết hạn (> 1 day) → 403 Forbidden
- [ ] Không có token → 403 Forbidden

### Routes Login & /me
- [ ] POST `/api/v1/auth/login` trả về token RS256
- [ ] GET `/api/v1/auth/me` + token → User info
- [ ] GET `/api/v1/auth/me` (no token) → 403

---

## 🔍 DEBUG & TROUBLESHOOTING

### Lỗi: "Cannot find module 'private.pem'"
```bash
# Chạy lại script sinh key
node generateKeys.js

# Kiểm tra file tồn tại
ls -la private.pem public.pem
```

### Lỗi: "jwt malformed"
- Kiểm tra token có hợp lệ không (dán vào jwt.io)
- Kiểm tra format: `Authorization: Bearer <token>`
- Không copy toàn bộ response, chỉ copy token string

### Lỗi: "invalid signature"
- Đảm bảo `private.pem` và `public.pem` được sinh từ cùng cặp key
- Xóa 2 file cũ và chạy lại `node generateKeys.js`

### Mật khẩu cũ không khớp despite nhập đúng
- Kiểm tra bcrypt compare logic trong `changePassword` function
- Mật khẩu được lưu hashed, không phải plaintext

### Token không được tạo (response login null)
- Kiểm tra username/password có đúng không
- Kiểm tra user có tồn tại trong DB không
- Xem lại console server có error không

### Lỗi CORS (nếu test từ frontend)
- Cần thêm middleware CORS (hiện tại chưa có)
- Hoặc dùng Postman (không cần CORS)

---

## 📊 FLOW CHI TIẾT

```
┌─────────────────────────────────────────────────────────────┐
│                    FLOW COMPLETE TEST                        │
└─────────────────────────────────────────────────────────────┘

1. REGISTER
   POST /auth/register
   Body: username, password, email
   ↓ Response: User object
   
2. LOGIN (RS256)
   POST /auth/login
   Body: username, password
   ↓ Response: JWT Token (RS256)
   
3. GET /ME (Verify Token)
   GET /auth/me
   Headers: Authorization: Bearer TOKEN
   ↓ Response: User info (verify public.pem)
   
4. CHANGE PASSWORD
   POST /auth/changepassword
   Headers: Authorization: Bearer TOKEN
   Body: oldpassword, newpassword
   ↓ Process:
      - Extract userId từ token
      - Kiểm tra oldpassword vs DB
      - Validate newpassword (6+ chars, ≠ oldpassword)
      - Hash newpassword + bcrypt
      - Save to DB
   ↓ Response: Success + User object (password updated)
   
5. LOGIN AGAIN (with new password)
   POST /auth/login
   Body: username, password (mới)
   ↓ Response: JWT Token (NEW, RS256)
   
✅ ALL TESTS PASSED!
```

---

## 🔐 SECURITY VERIFICATION

- [x] Private key (`private.pem`) used only for signing (ký token)
- [x] Public key (`public.pem`) used only for verifying (kiểm tra token)
- [x] Passwords hashed with bcrypt (không plaintext)
- [x] Old password compared with `bcrypt.compareSync()`
- [x] New password validation: 6+ chars, different from old
- [x] Token expires in 1 day
- [x] RS256 asymmetric encryption (safer than HS256)

---

## 📞 SUPPORT

Nếu gặp lỗi:
1. Kiểm tra console/terminal server có error không
2. Kiểm tra MongoDB connection (`connected` in console)
3. Kiểm tra request format (Headers, Body, URL)
4. Kiểm tra file `private.pem` và `public.pem` tồn tại

Good luck! 🚀
