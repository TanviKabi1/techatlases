# Welcome to the project

## Project info


## How can I edit this code?

There are several ways of editing your application.


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

## Getting Started

Follow these steps to set up the project locally for the first time.

### 1. Install Dependencies
You need to install dependencies for both the frontend and the backend.

```sh
# Install root (frontend) dependencies
npm install

# Install server (backend) dependencies
cd server
npm install
```

### 2. Database Setup
Ensure you have a MySQL database running. Create a `.env` file in the `server` directory and add your connection string:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
JWT_SECRET="your_secret_key"
PORT=3000
```

Now initialize the database schema and seed it with sample data:

```sh
cd server
npx prisma db push      # Create tables
npx prisma generate     # Generate Prisma Client
npx prisma db seed      # Populate with sample data
node run_sql.js         # Initialize SQL views and triggers
```

### 3. Run the Application
You need to run both the backend and frontend simultaneously in separate terminals.

**Terminal A (Backend):**
```sh
cd server
npm run dev
```

**Terminal B (Frontend):**
```sh
npm run dev
```

The application will be available at `http://localhost:8080`.

### Default Admin Credentials (for Collaborators)
- **Email**: `admin@techatlas.io`
- **Password**: `admin123`


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Lessons Learned

- **Strict Type Safety**: Adhering to `exactOptionalPropertyTypes` in TypeScript requires explicit handling of `null` vs `undefined`. This prevents subtle bugs in database seeders and API interactions where Prisma expects specific optionality.
- **SPA Deployment on Netlify**: Client-side routing in React (via React Router) needs a `_redirects` file or a `netlify.toml` with `/* /index.html 200` rules to avoid 404 errors when deep links are refreshed.
- **Interactive 3D Engineering**: Managing high-fidelity 3D components like `react-globe.gl` requires precise prop management. We learned to reconcile custom altitude accessors with standard Three.js geometry constraints to ensure smooth, performant rendering.
- **Robustness & Error Observability**: Implementing structured logging across Express routes and providing context-aware error messages (differentiation between development and production) is essential for maintaining a high-uptime intelligence dashboard.
- **Asset Integrity**: External media dependencies (like background videos) should be hosted locally or on reliable CDNs to prevent UI regressions when remote assets become unavailable.



