import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile, createUserProfile } from '../../services/databaseService';

function Profile() {
  const { currentUser, updateEmail, updatePassword } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Load user profile data
    const fetchUserProfile = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
    
      try {
        setLoading(true);
        console.log("Current user ID:", currentUser.uid);
        
        let profileData = await getUserProfile(currentUser.uid);
        console.log("Profile data retrieved:", profileData);
        
        // If no profile document exists, create one
        if (!profileData) {
          console.log("No profile found, creating new profile");
          const newProfileData = {
            email: currentUser.email,
            firstName: '',
            lastName: '', 
            teamName: '',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await createUserProfile(currentUser.uid, newProfileData);
          console.log("New profile created");
          
          // Fetch the newly created profile
          profileData = await getUserProfile(currentUser.uid);
          console.log("Refetched profile data:", profileData);
        }
        
        // Set form fields with profile data
        console.log("Setting form fields with:", profileData);
        setFirstName(profileData?.firstName || '');
        setLastName(profileData?.lastName || '');
        setTeamName(profileData?.teamName || '');
        setEmail(currentUser.email || '');
        
        setLoading(false);
        
        // Log state after update (this will be one render cycle behind)
        console.log("Current state after setting:", { firstName, lastName, teamName });
        
        // Add a slight delay and log again to see state after it updates
        setTimeout(() => {
          console.log("State after timeout:", { firstName, lastName, teamName });
        }, 500);
        
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile: ' + error.message);
        setLoading(false);
      }
    };
  
    fetchUserProfile();
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      // Update user profile data in Firestore
      const profileData = {
        firstName,
        lastName,
        teamName,
        updatedAt: new Date()
      };
      
      await updateUserProfile(currentUser.uid, profileData);
      
      // Update email if changed
      if (email !== currentUser.email) {
        await updateEmail(email);
      }
      
      // Update password if provided
      if (newPassword) {
        await updatePassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }
      
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h2>
            <p className="mt-1 text-sm text-gray-500">Update your personal details and account settings.</p>
          </div>

          {error && (
            <div className="mx-6 my-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mx-6 my-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p>{success}</p>
            </div>
          )}

          <div className="border-t border-gray-200">
            <form onSubmit={handleSubmit}>
              <div className="px-4 py-5 bg-white sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  {/* Personal Information */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="team-name" className="block text-sm font-medium text-gray-700">
                      Team name
                    </label>
                    <input
                      type="text"
                      name="team-name"
                      id="team-name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Account Information */}
                  <div className="col-span-6 border-t border-gray-200 pt-5">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">Update your email and password.</p>
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                      New password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      name="new-password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;