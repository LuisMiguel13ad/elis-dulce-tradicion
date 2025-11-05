# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9247db20-f66d-479e-bdf6-4234dba1420a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9247db20-f66d-479e-bdf6-4234dba1420a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

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

## Google Maps API Setup

This project uses Google Maps Places API for address verification in the delivery order form. To enable this feature:

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Enable the **Places API** and **Maps JavaScript API** for your project
3. Replace `YOUR_API_KEY` in `index.html` with your actual API key

The address verification feature will gracefully handle cases where the API key is not configured by allowing manual address entry.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9247db20-f66d-479e-bdf6-4234dba1420a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
