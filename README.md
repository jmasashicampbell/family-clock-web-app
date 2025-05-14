# Family Clock Web App

A modern, responsive web application that helps families keep track of each member's location or status. Built with React and designed to be deployed on GitHub Pages.

## Features

- Individual timezone clocks for each family member
- Interactive world map for location selection
- Color-coded family member cards
- Offline timezone detection based on map location using tz-lookup
- User authentication with Supabase
- Email/password login (sign-in only)
- Clean, minimalist interface
- Responsive design for mobile and desktop
- Easy deployment to GitHub Pages

## Screenshots

*Add screenshots of your application here after deployment*

## Installation and Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/FamilyClockWebApp.git
   cd FamilyClockWebApp
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure Supabase
   - Create a `.env` file in the root directory
   - Add your Supabase URL and anon key:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Deployment

This app is configured for easy deployment to GitHub Pages.

1. Update the `homepage` field in `package.json` with your GitHub username:
   ```json
   "homepage": "https://yourusername.github.io/FamilyClockWebApp"
   ```

2. Deploy the app to GitHub Pages:
   ```
   npm run deploy
   ```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App
- `npm run predeploy` - Builds the app before deployment
- `npm run deploy` - Deploys the app to GitHub Pages

## Customization

### Adding Family Members

To add or modify family members, edit the `familyMembers` state in `App.js`:

```jsx
const [familyMembers, setFamilyMembers] = useState([
  { 
    id: 1, 
    name: 'Mom', 
    color: '#FF6B6B', 
    timezone: 'America/New_York', 
    location: 'New York',
    coordinates: [40.7128, -74.0060] 
  },
  { 
    id: 2, 
    name: 'Dad', 
    color: '#4ECDC4', 
    timezone: 'Europe/London', 
    location: 'London',
    coordinates: [51.5074, -0.1278] 
  },
  // Add more family members here
]);
```

### Setting Locations with the World Map

Each family member's location can be set using an interactive world map. When you click the "Change Location" button, a modal opens with a map where you can place a pin to indicate the family member's location.

The app uses the `tz-lookup` Node module to determine the appropriate timezone based on the selected coordinates, without requiring any external API calls. The location data structure includes:

```jsx
{
  timezone: 'America/New_York',  // IANA timezone identifier
  location: 'New York',          // Location name
  coordinates: [40.7128, -74.0060]  // [latitude, longitude]
}
```

To customize the initial locations, edit the `familyMembers` state in `App.js`.



## Future Enhancements

- Persistent storage of family members in Supabase
- Real-time location tracking integration
- Family member avatars
- Push notifications
- Enhanced location name detection
- Travel planning features with timezone difference calculations
- User roles and sharing capabilities

## License

MIT

## Acknowledgements

- [React](https://reactjs.org/)
- [Create React App](https://github.com/facebook/create-react-app)
- [GitHub Pages](https://pages.github.com/)
