# Google Maps API Setup Guide

## Getting Your Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (or select existing)
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: "B.Tech AquaCulture Admin"
   - Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable:
     - **Maps JavaScript API**
     - **Drawing Library** (included with Maps JavaScript API)
     - **Geocoding API** (optional, for address lookup)

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

5. **Restrict API Key** (Recommended for Production)
   - Click on your newly created API key
   - Under "API restrictions", select "Restrict key"
   - Choose: "Maps JavaScript API" and "Geocoding API"
   - Under "Application restrictions", you can restrict by HTTP referrer:
     - Add: `http://localhost:3000/*` (for development)
     - Add: `https://yourdomain.com/*` (for production)

6. **Add API Key to .env File**
   ```bash
   GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

7. **Restart Server**
   ```bash
   npm start
   ```

## Features Implemented

✅ **Polygon Drawing**
- Draw territory boundaries directly on the map
- Edit polygons by dragging points
- Auto-save coordinates to database

✅ **Territory Management**
- Create territories with polygon boundaries
- Edit existing territories and update boundaries
- View all territories on the live map

✅ **Live Map View**
- Display all territories as colored polygons
- Show rep locations as markers
- Click territories for details
- Click rep markers for info

✅ **Database Integration**
- Polygon coordinates stored as JSON in `territories.polygon_coordinates`
- Automatic coordinate parsing and validation
- Retrieve and display polygons from database

## Usage

1. **Creating a Territory with Polygon:**
   - Go to Territories > Add New Territory
   - Enter territory name and description
   - Click the polygon drawing tool above the map
   - Draw your territory boundary on the map
   - Coordinates are automatically saved
   - Click "Create Territory"

2. **Editing Territory Polygon:**
   - Go to Territories > Edit Territory
   - Existing polygon will be loaded automatically
   - Drag polygon points to edit
   - Changes are saved automatically
   - Click "Update Territory"

3. **Viewing Territories on Map:**
   - Go to Map > Live Map
   - All territories are displayed as colored polygons
   - Rep locations shown as red markers
   - Click any polygon or marker for details

## Troubleshooting

**Map not loading?**
- Check that `GOOGLE_MAPS_API_KEY` is set in `.env`
- Verify API key is valid in Google Cloud Console
- Check browser console for errors
- Ensure Maps JavaScript API is enabled

**Polygon not saving?**
- Check browser console for JavaScript errors
- Verify polygon coordinates are valid JSON
- Ensure database connection is working

**API Key Errors?**
- Make sure billing is enabled on Google Cloud project
- Check API restrictions allow your domain
- Verify required APIs are enabled

