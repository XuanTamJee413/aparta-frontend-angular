# Aparta - Apartment Management System (Frontend)

A comprehensive apartment and property management system built with Angular. This application provides a complete solution for managing residential buildings, tenants, utilities, services, and operations.

## 🌟 Features

### Admin Management
- **Dashboard** - Overview of building operations and key metrics
- **Building Management** - Create, update, and view building information
- **Project Management** - Manage multiple property projects
- **Manager Administration** - User and manager profile management
- **Subscription Management** - Handle subscription plans and billing

### Resident Services
- **Apartment Management** - Tenant information and apartment details
- **Utility Booking** - Book and manage common facilities
- **Service Requests** - Submit and track maintenance requests
- **Invoice Management** - View and pay invoices

### Operations
- **Asset Management** - Track building assets and equipment
- **Task Management** - Assign and monitor maintenance tasks
- **Staff Assignment** - Manage staff schedules and assignments
- **Meter Reading** - Record and track utility consumption

### Finance
- **Billing System** - Generate and manage bills
- **Invoice Tracking** - Monitor payment status
- **Utility Billing** - Calculate utility charges

### Communication
- **Real-time Chat** - Built-in messaging system using SignalR
- **Notifications** - Stay updated on important events

## 🛠️ Technology Stack

- **Framework:** Angular 20.3.0
- **UI Components:** Angular Material 20.2.9
- **Real-time Communication:** Microsoft SignalR 10.0.0
- **Charts & Visualizations:** Chart.js 4.5.1 with ng2-charts 8.0.0
- **Language:** TypeScript 5.9.2
- **Build Tool:** Angular CLI 20.3.2
- **Testing:** Jasmine & Karma

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)
- **Angular CLI** (v20.3.2)

```bash
npm install -g @angular/cli@20.3.2
```

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/XuanTamJee413/aparta-frontend-angular.git
cd aparta-frontend-angular
```

2. Install dependencies:
```bash
npm install
```

3. Configure the backend API:
   - Update the proxy configuration in `proxy.conf.json` if needed
   - Default backend URL: `http://localhost:5175`

### Development Server

Start the development server:

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200/`. The app will automatically reload when you make changes to the source files.

To run with proxy (for API calls):

```bash
ng serve --proxy-config proxy.conf.json
```

## 📦 Build

### Development Build

```bash
ng build
```

### Production Build

```bash
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

### Run Unit Tests

```bash
npm test
# or
ng test
```

This executes unit tests using [Karma](https://karma-runner.github.io) test runner.

### Build with Watch Mode

For continuous development:

```bash
npm run watch
# or
ng build --watch --configuration development
```

## 📁 Project Structure

```
aparta-frontend-angular/
├── src/
│   ├── app/
│   │   ├── models/           # Data models
│   │   │   ├── building.model.ts
│   │   │   ├── project.model.ts
│   │   │   ├── manager.model.ts
│   │   │   ├── invoice.model.ts
│   │   │   └── ...
│   │   ├── services/         # Business logic services
│   │   │   ├── admin/        # Admin services
│   │   │   ├── resident/     # Resident services
│   │   │   ├── operation/    # Operations services
│   │   │   ├── finance/      # Finance services
│   │   │   ├── building/     # Building services
│   │   │   ├── chat/         # Chat services
│   │   │   └── management/   # Management services
│   │   ├── pages/            # Page components
│   │   │   └── admin/        # Admin pages
│   │   │       ├── dashboard/
│   │   │       ├── building/
│   │   │       ├── project/
│   │   │       ├── manager/
│   │   │       └── subscription/
│   │   ├── layout/           # Layout components (see LAYOUT_README.md)
│   │   └── app.ts            # Root component
│   ├── environments/         # Environment configurations
│   └── styles.css            # Global styles
├── public/                   # Static assets
├── proxy.conf.json           # API proxy configuration
├── angular.json              # Angular workspace config
└── package.json              # Dependencies and scripts
```

## 🎨 Layout System

This project uses the AdminKit template for Angular. For detailed information about the layout system, routing, and usage, see [LAYOUT_README.md](./LAYOUT_README.md).

## 📜 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build the project
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests
- `ng generate component component-name` - Generate a new component

## 🔧 Code Scaffolding

Generate new components, services, and other Angular elements:

```bash
# Generate a new component
ng generate component component-name

# Generate a new service
ng generate service service-name

# Generate a new module
ng generate module module-name
```

For a complete list of available schematics:

```bash
ng generate --help
```

## 🌐 API Configuration

The application connects to a backend API. Configure the API endpoint in `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:5175",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

This project uses Prettier for code formatting:

- **Print Width:** 100
- **Single Quotes:** Yes
- **HTML Parser:** Angular

## 📄 License

This project is private and proprietary.

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io)
- [SignalR Documentation](https://docs.microsoft.com/en-us/aspnet/core/signalr)
- [Chart.js Documentation](https://www.chartjs.org)

## 👥 Authors

- XuanTamJee413

---

Built with ❤️ using Angular
