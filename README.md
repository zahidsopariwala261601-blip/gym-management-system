# Gym Management System

A modern Gym Management System built with Next.js, Prisma, and Tailwind CSS.

## Features

- Member management
- Subscription tracking
- Equipment management
- Dashboard analytics

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (or your preferred database configured in Prisma)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zahidsopariwala261601-blip/gym-management-system.git
   cd gym-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   Create a `.env` file in the root directory and configure your database connection string:
   ```env
   DATABASE_URL="your-database-connection-string"
   ```

4. Run database migrations:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   Or use the provided `start.bat` script on Windows.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm start`: Starts the production server.
- `setup.bat`: Windows batch script for automated setup.
- `start.bat`: Windows batch script to start the application.

## License

This project is licensed under the MIT License.
