# Joulah List

A React + Vite web application that reads and displays data from Google Sheets - **completely free, no API key required!**

## Features

- 📊 Fetch data from any public Google Sheet
- 🎨 Clean and modern UI with responsive design
- ⚡ Fast and lightweight using Vite
- 🆓 **No API key or Google Cloud setup needed**
- 📱 Mobile-friendly table display
- 🔖 Access multiple tabs/sheets using GID
- 💯 **100% Free - uses CSV export**

## Prerequisites

Before you begin, ensure you have:
- Node.js (version 16 or higher)
- npm or yarn
- A Google Sheet that is published or shared publicly

## Setup Your Google Sheet

### Step 1: Get Your Sheet ID

The Sheet ID is found in the URL of your Google Sheet:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit#gid=0
```

### Step 2: Get Your Sheet GID (for specific tabs)

Each tab in your sheet has a unique GID found in the URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=123456789
                                                    ^^^^^^^^^^^
                                                    This is the GID
```

- First tab is usually `gid=0`
- Other tabs have different numbers
- You can access any tab by changing the GID

### Step 3: Make Your Sheet Public

**Option A: Publish to Web (Recommended)**
1. In Google Sheets: File → Share → Publish to web
2. Choose which sheet to publish (or entire document)
3. Click "Publish"

**Option B: Share with Link**
1. Click the "Share" button
2. Change to "Anyone with the link" can view
3. Click "Done"

## Installation

1. Navigate to the project directory:
```bash
cd ~/Documents/Furqan/Development/joulah-app
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file for default values:
```bash
cp .env.example .env
```

4. Edit the `.env` file to set default Sheet ID and GID:
```env
VITE_GOOGLE_SHEET_ID=your_sheet_id_here
VITE_SHEET_GID=0
```

## Usage

### Development Mode

Start the development server:
```bash
npm run dev
```

The app will open in your browser at `http://localhost:3000`

### Build for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## How to Use the App

1. **Option 1: Use Environment Variables**
   - Set your Sheet ID and GID in the `.env` file
   - The app will automatically load these values

2. **Option 2: Enter Manually**
   - Open the app in your browser
   - Enter your Google Sheet ID
   - Enter the Sheet GID (0 for first tab, or find in URL)
   - Click "Fetch Data"

## Accessing Multiple Tabs

To switch between different tabs in your Google Sheet:
1. Open your Google Sheet
2. Click on the tab you want to view
3. Look at the URL and find the `#gid=XXXXXX` part
4. Enter that number in the "Sheet GID" field
5. Click "Fetch Data"

**Example:** If your sheet has tabs for "Sales", "Inventory", and "Reports", each will have a different GID. Just change the GID to view different tabs!

## Project Structure

```
joulah-app/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   └── GoogleSheetsViewer.jsx
│   ├── styles/         # CSS files
│   │   ├── App.css
│   │   └── index.css
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── .env.example        # Environment variables template
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Troubleshooting

### "Failed to fetch sheet. Make sure the sheet is published or shared publicly."
- Make sure your sheet is published to web OR shared as "Anyone with the link can view"
- Verify your Sheet ID is correct (from the URL)
- Check that the GID is correct if accessing a specific tab

### "No data found in the sheet"
- Make sure there is data in the selected tab
- Try using GID `0` for the first sheet
- Verify the tab isn't empty

### Wrong Tab Showing?
- Check the GID number in your sheet's URL when you click on the tab
- Each tab has a unique GID - make sure you're using the right one

### CORS Errors
- This shouldn't happen with published sheets
- Make sure the sheet is published to web (File → Share → Publish to web)
- Try using "Anyone with the link can view" sharing setting

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Fetch API** - Native browser API for HTTP requests
- **Google Sheets CSV Export** - Free, no-API-key data access

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
