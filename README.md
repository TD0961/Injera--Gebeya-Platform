# eGebeya Platform

**Ethiopian Food Marketplace - Connecting Authentic Flavors with Modern Technology**

## Overview

eGebeya is a full-stack e-commerce platform specializing in Ethiopian cuisine, particularly Injera and traditional dishes. The platform connects local food vendors with customers, providing a seamless ordering experience with secure payment processing and real-time order management.

## ✨ Key Features

### For Customers
- **Browse Products**: Discover authentic Ethiopian dishes from local vendors
- **Smart Shopping Cart**: Persistent cart with real-time stock updates
- **Secure Payments**: Multiple payment options (Chapa, Stripe)
- **Order Tracking**: Real-time order status updates
- **Email Verification**: Secure account creation with 6-digit verification codes

### For Sellers
- **Vendor Dashboard**: Complete inventory and order management
- **Product Management**: Add, edit, and track product listings
- **Order Processing**: Manage orders with status transitions
- **Analytics**: Track sales and customer interactions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Go** with Fiber framework
- **PostgreSQL** database with GORM ORM
- **JWT** authentication
- **Docker** for containerization

### Payment Integration
- **Chapa** (Ethiopian payment gateway)
- **Stripe** (International payments)

## 🚀 Quick Start

### Development Prerequisites
- Go 1.19+
- Node.js 18+
- PostgreSQL 13+
- Docker (for production deployment)

### Production Deployment
For production deployment, see [PRODUCTION.md](PRODUCTION.md) for Docker-based setup.

### Installation

1. **Clone the repository**
    ```bash
   git clone https://github.com/TD0961/Injera--Gebeya-Platform.git
   cd Injera--Gebeya-Platform
    ```

2. **Setup Database**
    ```bash
   docker-compose up -d
    ```

3. **Backend Setup**
    ```bash
   cd Server
   cp .env.example .env  # Configure your environment variables
   go mod download
   go run main.go
    ```

4. **Frontend Setup**
    ```bash
   cd Client
   cp .env.example .env  # Configure your environment variables
   npm install
   npm run dev
    ```

5. **Access the Application**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:3000

## 🔧 Environment Variables

### Server (.env)
      ```bash
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=egebeya
DB_PORT=5432
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
CHAPA_SECRET_KEY=your_chapa_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@eGebeya.com
```

### Client (.env)
      ```bash
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 📱 Features in Detail

### Authentication & Security
- Email verification with 6-digit codes
- JWT-based authentication
- Role-based access control (Buyer/Seller)
- Input validation and sanitization
- Rate limiting and security headers

### Order Management
- 4-step order workflow (Pending → Confirmed → Shipped → Delivered)
- Real-time status updates
- Optimistic locking for concurrent updates
- Order history and tracking

### Payment Processing
- Chapa integration for Ethiopian market
- Stripe integration for international payments
- Secure payment callbacks and webhooks
- Payment success/failure handling

## 🏗️ Project Structure

```
Injera--Gebeya-Platform/
├── Client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # State management
│   │   └── assets/        # Static assets
├── Server/                # Go backend
│   ├── handlers/          # API endpoints
│   ├── models/           # Database models
│   ├── middleware/       # Security & validation
│   ├── services/         # Business logic
│   └── config/           # Configuration
└── docker-compose.yml    # Database setup
```

## 🔒 Security Features

- **Authentication**: JWT tokens with email verification
- **Authorization**: Role-based access control
- **Input Validation**: XSS and SQL injection prevention
- **Rate Limiting**: API abuse protection
- **Security Headers**: Comprehensive HTTP security
- **Data Protection**: Sensitive data encryption and masking

## 🚀 Deployment

### Production Checklist
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline

### Docker Deployment
    ```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@eGebeya.com or create an issue in the repository.

---
