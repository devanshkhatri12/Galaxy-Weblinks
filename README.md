# 🚀 Full Stack User Management System

A complete full-stack web application built using **Next.js**, **Tailwind CSS**, **ShadCN**, and **PostgreSQL**.  
This project implements a secure and scalable user management system along with an admin dashboard, file management, and essential content pages.

---

## 🧠 Overview

This project was developed as part of a technical assignment to evaluate full-stack development, architecture, and problem-solving skills.  
It demonstrates authentication, authorization, CRUD operations, RBAC (Role-Based Access Control), and media management — all built using modern Next.js practices.

---

## 🏗️ Tech Stack

| Technology | Purpose |
|-------------|----------|
| **Next.js** | React framework for SSR, routing, and API handling |
| **Tailwind CSS** | Utility-first styling for responsive design |
| **ShadCN UI** | Pre-styled accessible components for consistent UI |
| **PostgreSQL** | Relational database for user, role, and content data |
| **Supabase / Custom Backend** | Authentication, file storage, and DB hosting |

---

## 🔐 Features

### 👥 User Management
- Login with CAPTCHA protection (prevents brute-force attacks)
- User Registration / Sign-up
- Forgot Password & Reset Password with email verification
- Email Verification flow
- User Profile Management (view and update profile details)
- Change Password (after login)
- Role-based permissions (**Admin**, **Manager**, **User**, etc.)

### 📰 Content & Information Pages
- Homepage
- About Us
- Contact Us page with **map integration** and **contact form**
- Terms & Conditions / Privacy Policy pages
- Global & module-specific **Search functionality**

### 🧩 Admin Dashboard
- Full **User Management** (Create, Read, Update, Delete)
- **Role-Based Access Control (RBAC)**
- **Activity Logs / Audit Trail** for user operations

### 🗂️ File & Media Management
- Image/File upload with validation
- Integrated into user profile management

---


## 🧩 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/devanshkhatri12/Galaxy-Weblinks.git
cd your-repo-name
```

### 2️⃣ Clone the Repository
```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env.local` file in the root directory and include the following keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

DATABASE_URL=your_postgresql_connection_url

NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

RESEND_API_KEY=your_resend_api_key
```

### 4️⃣ Set Up Database

> Make sure your PostgreSQL or Supabase database is configured properly.


### 5️⃣ Run the Development Server
```bash
npm run dev
```


## ✨ Author

**Developed by Devansh Khatri**  
📧 [devanshkhatri1204@gmail.com]  
💼 [https://www.linkedin.com/in/devansh-khatri12/]

