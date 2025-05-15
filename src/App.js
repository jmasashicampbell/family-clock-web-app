import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import WorldMapModal from './components/WorldMapModal';
import Auth from './components/Auth';
import AnalogClock from './components/AnalogClock';
import { supabase } from './supabaseClient';
import tzlookup from 'tz-lookup';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeModal, setActiveModal] = useState(null);

  // Fetch family members from Supabase
  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get the current user's information
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!userData || !userData.user) {
        throw new Error('User not found');
      }
      
      const currentUserId = userData.user.id;
      
      // Get the current user's family
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('person')
        .select('family')
        .eq('user_id', currentUserId)
        .single();
      
      if (currentUserError) {
        // If there's an error finding the user, show a specific message
        if (currentUserError.code === 'PGRST116') {
          setError('Your user profile is not set up. Please contact an administrator.');
          setLoading(false);
          return;
        }
        throw currentUserError;
      }
      
      if (!currentUserData || !currentUserData.family) {
        setError('No family associated with your account');
        setLoading(false);
        return;
      }
      
      const userFamily = currentUserData.family;
      
      // Set the family name (capitalize first letter)
      setFamilyName(userFamily.charAt(0).toUpperCase() + userFamily.slice(1));
      
      // Now get all family members with the same family value
      const { data, error } = await supabase
        .from('person')
        .select('*')
        .eq('family', userFamily);
      
      if (error) throw error;
      
      if (data) {
        // Map the data to include timezone and color
        const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#1A535C', '#F78C6B', '#05C3DD'];
        
        const formattedData = data.map((person, index) => {
          // Use tzlookup to determine timezone from coordinates
          const timezone = tzlookup(person.latitude, person.longitude);
          
          // Get location name from timezone
          const locationParts = timezone.split('/');
          const location = locationParts.length > 1 
            ? locationParts[locationParts.length - 1].replace(/_/g, ' ')
            : 'Unknown';
          
          return {
            id: person.id,
            name: person.name,
            color: colors[index % colors.length],
            timezone: timezone,
            location: location,
            coordinates: [person.latitude, person.longitude]
          };
        });
        
        setFamilyMembers(formattedData);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
      setError('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up Supabase auth state listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchFamilyMembers();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchFamilyMembers();
      }
    });

    // Set up timer for clock updates
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      subscription?.unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const updateLocation = async (id, locationData) => {
    try {
      // Update the member in the state first for immediate UI feedback
      setFamilyMembers(familyMembers.map(member => 
        member.id === id ? { 
          ...member, 
          timezone: locationData.timezone, 
          location: locationData.location,
          coordinates: locationData.coordinates 
        } : member
      ));
      
      // Then update the database
      const { error } = await supabase
        .from('person')
        .update({ 
          latitude: locationData.coordinates[0],
          longitude: locationData.coordinates[1]
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating location:', error);
        // Revert to original data if there's an error
        fetchFamilyMembers();
      }
    } catch (error) {
      console.error('Error in update process:', error);
      fetchFamilyMembers();
    }
  };
  
  const getTimeInTimezone = (timezone) => {
    try {
      return formatInTimeZone(currentTime, timezone, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time for timezone:', timezone, error);
      return 'Invalid timezone';
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // If user is not authenticated, show the Auth component
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="family-title">{familyName} Family</h1>
          <button className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>
      <main className="family-status">
        {loading ? (
          <div className="loading-state">Loading family members...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : familyMembers.length === 0 ? (
          <div className="empty-state">No family members found</div>
        ) : (
          <div className="family-members">
            {familyMembers.map(member => (
              <div key={member.id} className="member-card">
                <div className="member-clock" onClick={() => setActiveModal(member.id)}>
                  <AnalogClock time={getTimeInTimezone(member.timezone)} name={member.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer>
        <p>Family Clock - {new Date().getFullYear()}</p>
      </footer>
      
      {/* World Map Modal */}
      {activeModal !== null && (
        <WorldMapModal
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          onSave={(locationData) => updateLocation(activeModal, locationData)}
          initialPosition={familyMembers.find(m => m.id === activeModal)?.coordinates || [0, 0]}
        />
      )}
    </div>
  );
}

export default App;
