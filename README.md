# 🚀 Formifi - AI-Powered Form Generation SaaS

Formifi is a **SaaS platform** that enables users to **generate and publish forms** using the **DeepSeek-Coder** model. It allows for seamless **form sharing** and **response collection**, providing a modern and efficient user experience.

## Features

### **User Features**
- ✅ **Form Creation** – Generate forms dynamically with AI.
- 📤 **Form Sharing** – Publish and distribute forms via unique links.
- 📊 **Response Collection** – Store and manage responses securely.
- 🔐 **Authentication** – Secure login & registration.
- 💳 **Payments** – Integrated with **Stripe** for premium features.

### **Admin Features**
- 📊 **Admin Dashboard** – Manage users, forms, and responses.
- 🔑 **Role-Based Access** – Middleware for restricted admin pages.
- 🚀 **Toast Notifications** – Real-time feedback for user actions.

---

## Tech Stack

### **Frontend**
- ⚛️ **Next.js** – Modern React framework.
- 🎨 **ShadCN UI** – Stylish UI components (**Button, Input, Card, Badge**).
- ⚡ **Radix UI** – Accessible UI components.
- 🔔 **Sonner** – Toast notifications.

### **Backend**
- 🖥 **Node.js & Express** – Server-side logic.
- 📦 **Prisma & PostgreSQL** – Database ORM and management.
- 🤖 **DeepSeek-Coder** – AI model for form generation.

---

## Project Preview
https://drive.google.com/file/d/1qI-lU02zkkx2Fob5M51edLTGk-M7h2nk/view?usp=sharing

## Project Structure

```project-directory
Formifi/
├── .next/         # Next.js build files
├── .vscode/       # VSCode workspace settings
├── actions/       # Server actions for form handling
├── app/           # Main Next.js app directory
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and helpers
├── node_modules/  # Installed dependencies
├── prisma/        # Prisma schema and migrations
├── public/        # Static assets (logos, images, etc.)
├── types/         # TypeScript types
└── README.md      # Project documentation

```
## Installation

### Prerequisites
 - Node.js (v16+ recommended)
 - PostgreSQL (Local or cloud instance)
 - Git

### Steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/YourUsername/Formifi.git
    ```

2. **Install dependencies**:
    ```bash
    cd Formifi
    npm install
    ```

3. **Initialize Prisma**:
    ```bash
    npx prisma init
    ```

4. **Configure environment variables**:  
   Create a `.env` file in the root directory with the following:
    ```env
    DATABASE_URL=<your-postgres-url>
    NEXTAUTH_SECRET=<your-secret-key>
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
    CLERK_SECRET_KEY=<your-clerk-secret-key>
    NEXT_PUBLIC_BASE_URL="http://localhost:3000"
    ```


### Start the project:

1. **Start the development server**:
    ```bash
    npm run dev
    ```
2. The app will be available at **[http://localhost:3000](http://localhost:3000)**.

---

## Usage

### **For Users**
- Register or login to generate forms.
- Customize and share forms.
- View collected responses.

### **For Admins**
- Login to the admin dashboard.
- Manage users and forms.
- Monitor responses and platform performance.


## Contributing

We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature/your-feature
    ```
3. Commit your changes:
    ```bash
    git commit -m "Add your message here"
    ```
4. Push to your branch:
    ```bash
    git push origin feature/your-feature
    ```
5. Open a pull request on GitHub.
