# Common Shopping List

A collaborative shopping list application built with SolidJS that allows users to create, share, and manage shopping lists in real-time.

## Features

### 🛒 Shopping List Management
- **Create Lists**: Quickly create new shopping lists with auto-generated share IDs
- **Add Items**: Add items with customizable quantities
- **Check Off Items**: Mark items as purchased with a simple click
- **Delete Items**: Remove items you no longer need
- **Delete Lists**: Remove entire shopping lists when done

### 🔗 Sharing & Collaboration
- **Share via QR Code**: Generate QR codes for easy sharing
- **Share via URL**: Share lists using unique URLs with list parameters
- **Recent Lists**: Access your recently used shopping lists
- **Persistent Storage**: Lists are saved in localStorage for quick access

### 💾 Smart State Management
- **Auto-sync**: Changes sync with the backend API
- **Optimistic Updates**: UI updates instantly while syncing in background
- **Debounced Quantity Updates**: Quantity changes are batched and sent after 2 seconds of inactivity
- **Error Handling**: Invalid list IDs are handled gracefully with user-friendly error messages

### 🎨 User Experience
- **Loading States**: Smooth loader animations while fetching data
- **Server-Side Rendering**: Fast initial page loads with SSR support
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modal Interfaces**: Clean modal dialogs for ID input and sharing

## Tech Stack

- **Framework**: [SolidJS](https://www.solidjs.com/) v1.9.5
- **Router**: @solidjs/router v0.15.0
- **Styling**: TailwindCSS v4.0.7
- **QR Codes**: solid-qr-code v0.1.11
- **Build Tool**: Vinxi v0.5.7
- **Testing**: Vitest v3.2.4 + SolidJS Testing Library

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
yarn dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Solid apps are built with _presets_, which optimise your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.

## Testing

Run tests with:

```bash
yarn test
```

## How It Works

1. **Create a List**: Click "Create New List" to generate a new shopping list with a unique share ID
2. **Add Items**: Type item names and click "Add" to populate your list
3. **Manage Items**: 
   - Click checkboxes to mark items as purchased
   - Adjust quantities with +/- buttons
   - Delete individual items with the trash icon
4. **Share**: Click the share button to get a QR code with shareable URL, or shareId
5. **Access Lists**: 
   - Lists persist in localStorage for quick access
   - Use the "Open Existing List" button to access recent lists or enter a share ID
   - Share URLs with `?list=<shareId>` parameter automatically load the list

## API Integration

The app connects to a backend API for:
- `POST /api/lists` - Create new shopping lists
- `GET /api/lists/:id` - Fetch shopping list by ID
- `PUT /api/lists/:id` - Update shopping list items
- `DELETE /api/lists/:id` - Delete shopping list
- `PATCH /api/items/:id` - Update item (check status, quantity)
- `DELETE /api/items/:id` - Delete individual item

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)

