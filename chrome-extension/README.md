# Meal Prep Recipe Manager - Chrome Extension

## Setup Instructions

### 1. Generate Icons

The extension needs PNG icons at 16x16, 48x48, and 128x128 pixels. You can generate them using one of these methods:

**Option A: Using the HTML generator**
1. Open `generate-icons.html` in your browser
2. The icons will automatically download
3. Move them to the `icons/` folder

**Option B: Using an online tool**
1. Use the `icon.svg` file as a base
2. Convert it to PNG at 16x16, 48x48, and 128x128 using an online SVG to PNG converter
3. Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the `icons/` folder

**Option C: Using ImageMagick (if installed)**
```bash
cd chrome-extension/icons
convert -background none -resize 16x16 icon.svg icon16.png
convert -background none -resize 48x48 icon.svg icon48.png
convert -background none -resize 128x128 icon.svg icon128.png
```

### 2. Configure Your App URL

1. Load the extension in Chrome (see step 3)
2. Click the extension icon, then click "Settings" at the bottom
3. Enter your deployed app URL (e.g., `https://your-app.vercel.app`)
4. Click "Save"

### 3. Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### 4. Set Environment Variables in Vercel

Make sure these are set in your Vercel project settings:
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key

## Usage

1. Navigate to any recipe website
2. Click the extension icon in your Chrome toolbar
3. Click "Capture Recipe"
4. Review and edit the parsed recipe
5. Click "Add to Recipes"
6. The recipe will be saved to your Supabase database and appear in your app!

## Troubleshooting

- **"Failed to parse recipe"**: Make sure your Vercel environment variables are set correctly
- **"Failed to save recipe"**: Check that `SUPABASE_SERVICE_KEY` is set and has write permissions
- **Icons not showing**: Make sure all three PNG files (16, 48, 128) exist in the `icons/` folder

