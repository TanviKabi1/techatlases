# Welcome to the project

## Project info


## How can I edit this code?

There are several ways of editing your application.


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

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



