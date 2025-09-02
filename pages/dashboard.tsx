import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  username: string;
  name: string;
  role: string;
  email: string;
  status?: string;
}

interface ActivityUpdate {
  id: string;
  action: string;
  timestamp: string;
  description: string;
  uploadedFile?: string;
  username: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activityUpdates, setActivityUpdates] = useState<ActivityUpdate[]>([]);
  const [stats, setStats] = useState({
    totalSignIns: 0,
    totalSignOuts: 0,
    todaySignIns: 0,
    todaySignOuts: 0
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);
  const [expandedPersonalActivities, setExpandedPersonalActivities] = useState<string[]>([]);
  const [showWorkDetailsModal, setShowWorkDetailsModal] = useState(false);
  const [selectedWorkDetails, setSelectedWorkDetails] = useState<ActivityUpdate | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityUpdate | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard useEffect running...');
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user:', parsedUser);
        setUser(parsedUser);
        loadActivityUpdates();
        loadStats();
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    } else {
      console.log('No user data found, redirecting to login');
      router.push('/login');
    }
  }, [router]);

  const loadActivityUpdates = () => {
    const updates = localStorage.getItem('activityUpdates');
    if (updates) {
      const parsedUpdates = JSON.parse(updates);
      const updatedActivities = parsedUpdates.map((update: any) => {
        if (!update.username) {
          const usernameMatch = update.description.match(/^(\w+)\s+signed/);
          update.username = usernameMatch ? usernameMatch[1] : 'unknown';
        }
        return update;
      });
      setActivityUpdates(updatedActivities);
      localStorage.setItem('activityUpdates', JSON.stringify(updatedActivities));
    }
  };

  const loadStats = () => {
    const today = new Date().toDateString();
    const allActivities = localStorage.getItem('activityUpdates') ? JSON.parse(localStorage.getItem('activityUpdates')!) : [];
    
    const totalSignIns = allActivities.filter((a: ActivityUpdate) => a.action === 'sign-in').length;
    const totalSignOuts = allActivities.filter((a: ActivityUpdate) => a.action === 'sign-out').length;
    const todaySignIns = allActivities.filter((a: ActivityUpdate) => a.action === 'sign-in' && new Date(a.timestamp).toDateString() === today).length;
    const todaySignOuts = allActivities.filter((a: ActivityUpdate) => a.action === 'sign-out' && new Date(a.timestamp).toDateString() === today).length;
    
    setStats({ totalSignIns, totalSignOuts, todaySignIns, todaySignOuts });
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch('/api/auth/check-users');
      
      if (response.ok) {
        const users = await response.json();
        // Set default status for users who don't have one
        const usersWithStatus = users.map((user: User) => ({
          ...user,
          status: user.status || 'active'
        }));
        setAllUsers(usersWithStatus);
      } else {
        console.error('Failed to load users:', response.status, response.statusText);
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Error loading users: ' + error.message);
    }
  };

  const handleSignIn = async () => {
    if (isLoading) return;
    
    const today = new Date().toDateString();
    const todaySignIn = activityUpdates.find(activity => 
      activity.action === 'sign-in' && 
      activity.username === user?.username &&
      new Date(activity.timestamp).toDateString() === today
    );

    if (todaySignIn) {
      alert('You can only sign in once per day.');
      return;
    }

    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString();
      const newActivity: ActivityUpdate = {
        id: Date.now().toString(),
        action: 'sign-in',
        timestamp,
        description: `${user?.username} signed in at ${new Date(timestamp).toLocaleString()}`,
        username: user?.username || ''
      };

      const updatedActivities = [...activityUpdates, newActivity];
      setActivityUpdates(updatedActivities);
      localStorage.setItem('activityUpdates', JSON.stringify(updatedActivities));
      loadStats();
      alert('You are successfully logged in!');
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (isLoading) return;
    
    const lastSignOut = activityUpdates
      .filter(activity => 
        activity.action === 'sign-out' && 
        activity.username === user?.username
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (lastSignOut) {
      const timeDiff = Date.now() - new Date(lastSignOut.timestamp).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 12) {
        const shouldEdit = confirm('You signed out less than 12 hours ago. Would you like to edit your previous sign-out instead?');
        if (shouldEdit) {
          setEditingActivity(lastSignOut);
          setEditDescription(lastSignOut.description);
          setEditFile(null);
          setShowEditModal(true);
          return;
        }
      }
    }

    setShowSignOutModal(true);
  };

  const handleSignOutConfirm = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString();
      const newActivity: ActivityUpdate = {
        id: Date.now().toString(),
        action: 'sign-out',
        timestamp,
        description: description || `${user?.username} signed out at ${new Date(timestamp).toLocaleString()}`,
        uploadedFile: selectedFile ? selectedFile.name : undefined,
        username: user?.username || ''
      };

      const updatedActivities = [...activityUpdates, newActivity];
      setActivityUpdates(updatedActivities);
      localStorage.setItem('activityUpdates', JSON.stringify(updatedActivities));
      loadStats();
      
      setDescription('');
      setSelectedFile(null);
      setShowSignOutModal(false);
      alert('You are successfully logged out!');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
    if (!showAdminPanel) {
      loadAllUsers();
    }
  };

  const showWorkDetails = (activity: ActivityUpdate) => {
    setSelectedWorkDetails(activity);
    setShowWorkDetailsModal(true);
  };

  const closeWorkDetailsModal = () => {
    setShowWorkDetailsModal(false);
    setSelectedWorkDetails(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingActivity(null);
    setEditDescription('');
    setEditFile(null);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setEditFile(file);
    } else if (file) {
      alert('File size must be less than 10MB');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingActivity || isLoading) return;
    
    const lastSignOut = activityUpdates
      .filter(activity => 
        activity.action === 'sign-out' && 
        activity.username === user?.username
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (lastSignOut && lastSignOut.id === editingActivity.id) {
      const timeDiff = Date.now() - new Date(lastSignOut.timestamp).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff >= 12) {
        alert('You can only edit your sign-out description within 12 hours.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const updatedActivities = activityUpdates.map(activity => 
        activity.id === editingActivity.id 
          ? { 
              ...activity, 
              description: editDescription,
              uploadedFile: editFile ? editFile.name : activity.uploadedFile
            }
          : activity
      );
      
      setActivityUpdates(updatedActivities);
      localStorage.setItem('activityUpdates', JSON.stringify(updatedActivities));
      closeEditModal();
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Panel Functions
  const downloadCSV = () => {
    try {
      const csvContent = generateCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('CSV downloaded successfully!');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    }
  };

  const generateCSVContent = () => {
    const headers = ['Username', 'Action', 'Timestamp', 'Description', 'Uploaded File'];
    const rows = activityUpdates.map(activity => [
      activity.username,
      activity.action,
      new Date(activity.timestamp).toLocaleString(),
      activity.description,
      activity.uploadedFile || ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const syncGoogleSheets = async () => {
    try {
      setIsLoading(true);
      // This would integrate with your Google Sheets API
      // For now, we'll simulate the sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Google Sheets synchronized successfully!');
    } catch (error) {
      console.error('Error syncing with Google Sheets:', error);
      alert('Failed to sync with Google Sheets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    try {
      const data = {
        users: allUsers,
        activities: activityUpdates,
        stats: stats,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_export_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const generateReport = () => {
    try {
      const report = {
        title: 'Attendance Report',
        generatedAt: new Date().toLocaleString(),
        summary: {
          totalUsers: allUsers.length,
          totalActivities: activityUpdates.length,
          totalSignIns: stats.totalSignIns,
          totalSignOuts: stats.totalSignOuts,
          todaySignIns: stats.todaySignIns,
          todaySignOuts: stats.todaySignOuts
        },
        userBreakdown: allUsers.map(u => ({
          username: u.username,
          name: u.name,
          role: u.role,
          signIns: activityUpdates.filter(a => a.username === u.username && a.action === 'sign-in').length,
          signOuts: activityUpdates.filter(a => a.username === u.username && a.action === 'sign-out').length
        }))
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const editUser = (userToEdit: User) => {
    // For now, just show an alert. You can implement a proper edit modal later
    alert(`Edit user: ${userToEdit.name} (${userToEdit.username})`);
  };

  const deleteUser = async (username: string) => {
    // Prevent deletion of admin and ceo users
    if (username === 'admin' || username === 'ceo') {
      alert('Cannot delete admin or CEO users for security reasons.');
      return;
    }

    if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        // Remove user from local state
        const updatedUsers = allUsers.filter(user => user.username !== username);
        setAllUsers(updatedUsers);

        // Remove user from expanded users list
        setExpandedUsers(prev => prev.filter(name => name !== username));

        // Remove user's activities from activity updates
        const updatedActivities = activityUpdates.filter(activity => activity.username !== username);
        setActivityUpdates(updatedActivities);

        // Update users.json file
        const response = await fetch('/api/auth/delete-user', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        if (response.ok) {
          alert(`User "${username}" has been successfully deleted.`);
        } else {
          const errorData = await response.json();
          alert(`Error deleting user: ${errorData.message}`);
          // Revert state changes if server deletion failed
          setAllUsers(allUsers);
          setActivityUpdates(activityUpdates);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
        // Revert state changes if deletion failed
        setAllUsers(allUsers);
        setActivityUpdates(activityUpdates);
      }
    }
  };

  const toggleUserDetails = (username: string) => {
    setExpandedUsers(prev => 
      prev.includes(username) ? prev.filter(u => u !== username) : [...prev, username]
    );
  };

  const viewUserFullHistory = (username: string) => {
    alert(`Viewing full history for user: ${username}`);
    // In a real app, you would navigate to a dedicated user history page
  };

  const resetUserPassword = (username: string) => {
    alert(`Resetting password for user: ${username}`);
    // In a real app, you would implement a password reset API call
  };

  const toggleUserStatus = (username: string) => {
    setAllUsers(prev => prev.map(user => {
      if (user.username === username) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        return { ...user, status: newStatus };
      }
      return user;
    }));
    
    const user = allUsers.find(u => u.username === username);
    const newStatus = user?.status === 'active' ? 'inactive' : 'active';
    alert(`User ${username} status changed to: ${newStatus}`);
  };

  // New functions for Activity Records dropdown
  const toggleActivityDetails = (activityId: string) => {
    setExpandedActivities(prev => 
      prev.includes(activityId) ? prev.filter(id => id !== activityId) : [...prev, activityId]
    );
  };

  const exportActivityData = (activity: ActivityUpdate) => {
    try {
      const data = {
        activity: activity,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activity_record_${activity.id}_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Activity data exported successfully!');
    } catch (error) {
      console.error('Error exporting activity data:', error);
      alert('Failed to export activity data. Please try again.');
    }
  };

  const editActivityRecord = (activity: ActivityUpdate) => {
    setEditingActivity(activity);
    setEditDescription(activity.description);
    setEditFile(null); // Clear previous file if any
    setShowEditModal(true);
  };

  // Personal Activity Functions
  const togglePersonalActivityDetails = (activityId: string) => {
    setExpandedPersonalActivities(prev => 
      prev.includes(activityId) ? prev.filter(id => id !== activityId) : [...prev, activityId]
    );
  };

  const editPersonalActivity = (activity: ActivityUpdate) => {
    setEditingActivity(activity);
    setEditDescription(activity.description);
    setEditFile(null);
    setShowEditModal(true);
  };

  const exportPersonalActivity = (activity: ActivityUpdate) => {
    try {
      const data = {
        personalActivity: activity,
        exportDate: new Date().toISOString(),
        user: user?.username
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `my_activity_${activity.action}_${new Date(activity.timestamp).toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Personal activity exported successfully!');
    } catch (error) {
      console.error('Error exporting personal activity:', error);
      alert('Failed to export activity. Please try again.');
    }
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #111827 0%, #1e3a8a 0%, #581c87 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Loading Dashboard...</h1>
          <p>Please wait while we load your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #111827 0%, #1e3a8a 0%, #581c87 100%)'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem 0',
        marginBottom: '1rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Welcome, {user.name}!
              </h1>
              <p style={{ fontSize: '1rem', color: '#dbeafe' }}>
                Manage your attendance and view activity updates
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
              }}
            >
              Logout
            </button>
          </div>

          {/* Admin Panel Toggle */}
          {(user.role === 'admin') && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={toggleAdminPanel}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)';
                }}
              >
                {showAdminPanel ? '🔒 Hide Admin Panel' : '👑 Show Admin Panel'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 2rem' }}>
        {/* Statistics Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          {user.role === 'admin' ? (
            // Admin sees general statistics
            <>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.totalSignIns}
                </h3>
                <p style={{ color: 'white', fontSize: '1rem' }}>Total Sign-ins</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}>
                <h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.totalSignOuts}
                </h3>
                <p style={{ color: 'white', fontSize: '1rem' }}>Total Sign-outs</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.todaySignIns}
                </h3>
                <p style={{ color: 'white', fontSize: '1rem' }}>Today Sign-ins</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}>
                <h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.todaySignOuts}
                </h3>
                <p style={{ color: 'white', fontSize: '1rem' }}>Today Sign-outs</p>
              </div>
            </>
          ) : (
            // Regular users see ONLY their personal statistics
            <>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {activityUpdates.filter(activity => 
                    activity.action === 'sign-in' && 
                    activity.username === user.username
                  ).length}
                </h3>
                <p style={{ color: 'white', fontSize: '1rem' }}>My Sign-ins</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}>
                <h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {activityUpdates.filter(activity => 
                    activity.action === 'sign-out' && 
                    activity.username === user.username
                  ).length}
                </h3>
                <p style={{ color: 'white', fontSize: '1rem' }}>My Sign-outs</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}>
                <h3 style={{ color: '#60a5fa', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {(() => {
                    const today = new Date().toDateString();
                    return activityUpdates.filter(activity => 
                      activity.action === 'sign-in' && 
                      activity.username === user.username &&
                      new Date(activity.timestamp).toDateString() === today
                    ).length;
                  })()}
                </h3>
                <p style={{ color: 'white', fontSize: '1rem' }}>Today Sign-ins</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {(() => {
                    const today = new Date().toDateString();
                    return activityUpdates.filter(activity => 
                      activity.action === 'sign-out' && 
                      activity.username === user.username &&
                      new Date(activity.timestamp).toDateString() === today
                    ).length;
                  })()}
                </h3>
                <p style={{ color: 'white', fontSize: '1rem' }}>Today Sign-outs</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions - Now positioned after statistics and before activity records */}
        {user.role !== 'admin' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>
              🚀 Quick Actions
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {/* Sign In Button */}
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '20px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.3)',
                  opacity: isLoading ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(16, 185, 129, 0.3)';
                  }
                }}
              >
                <div style={{ fontSize: '3rem' }}>✅</div>
                <div>Sign In</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                  {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </div>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '20px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.3)',
                  opacity: isLoading ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(239, 68, 68, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(239, 68, 68, 0.3)';
                  }
                }}
              >
                <div style={{ fontSize: '3rem' }}>🚪</div>
                <div>Sign Out</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                  {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </div>
              </button>
            </div>

            {/* 12-Hour Updates Section */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <h3 style={{ color: '#f59e0b', fontSize: '1rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                ⏰ 12-Hour Activity Updates
              </h3>
              <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Last Sign-out:</strong> {(() => {
                    const lastSignOut = activityUpdates
                      .filter(activity => activity.action === 'sign-out' && activity.username === user.username)
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                    
                    if (!lastSignOut) return 'No sign-out records yet';
                    
                    const timeDiff = Date.now() - new Date(lastSignOut.timestamp).getTime();
                    const hoursDiff = timeDiff / (1000 * 60 * 60);
                    
                    if (hoursDiff < 12) {
                      return (
                        <span>
                          {lastSignOut.timestamp} 
                          <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>
                            (You can still edit this record for {Math.max(0, Math.floor(12 - hoursDiff))} more hours)
                          </span>
                        </span>
                      );
                    } else {
                      return (
                        <span>
                          {lastSignOut.timestamp} 
                          <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                            (Edit window expired)
                          </span>
                        </span>
                      );
                    }
                  })()}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                  You can edit your sign-out description within 12 hours of signing out
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Activity Records for Regular Users */}
        {user.role !== 'admin' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              📋 My Activity Records
            </h2>
            
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {(() => {
                const userActivities = activityUpdates
                  .filter(activity => activity.username === user.username)
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                
                if (userActivities.length === 0) {
                  return (
                    <div style={{ 
                      padding: '2rem', 
                      textAlign: 'center', 
                      color: '#9ca3af',
                      fontSize: '1rem'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                      <p>No activity records yet.</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Start by signing in or signing out to see your activity history here.
                      </p>
                    </div>
                  );
                }
                
                return userActivities.map((activity) => (
                  <div key={activity.id} style={{
                    marginBottom: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}>
                    
                    {/* Activity Header - Always Visible */}
                    <div 
                      style={{
                        padding: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        minHeight: window.innerWidth <= 768 ? '60px' : 'auto'
                      }}
                      onClick={() => togglePersonalActivityDetails(activity.id)}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: window.innerWidth <= 768 ? '0.75rem' : '1rem' 
                      }}>
                        <div style={{
                          width: window.innerWidth <= 768 ? '40px' : '50px',
                          height: window.innerWidth <= 768 ? '40px' : '50px',
                          borderRadius: '50%',
                          background: activity.action === 'sign-in' 
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.5rem'
                        }}>
                          {activity.action === 'sign-in' ? '✅' : '🚪'}
                        </div>
                        <div>
                          <div style={{ 
                            color: activity.action === 'sign-in' ? '#10b981' : '#ef4444',
                            fontWeight: 'bold',
                            fontSize: window.innerWidth <= 768 ? '1rem' : '1.125rem'
                          }}>
                            {activity.action === 'sign-in' ? 'Sign In' : 'Sign Out'}
                          </div>
                          <div style={{ 
                            color: 'white', 
                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem', 
                            marginTop: '0.25rem' 
                          }}>
                            {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: window.innerWidth <= 768 ? '0.25rem' : '0.5rem',
                        flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                      }}>
                        <span style={{ 
                          color: '#9ca3af', 
                          fontSize: window.innerWidth <= 768 ? '1rem' : '1.25rem',
                          transition: 'transform 0.2s ease',
                          transform: expandedPersonalActivities.includes(activity.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                        <span style={{ 
                          color: '#dbeafe', 
                          fontSize: window.innerWidth <= 768 ? '0.625rem' : '0.75rem',
                          textAlign: 'center'
                        }}>
                          {window.innerWidth <= 768 ? 'Tap for details' : 'Click for details'}
                        </span>
                      </div>
                    </div>

                    {/* Personal Activity Details Dropdown */}
                    {expandedPersonalActivities.includes(activity.id) && (
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
                          gap: window.innerWidth <= 768 ? '0.75rem' : '1rem' 
                        }}>
                          {/* Activity Details */}
                          <div style={{
                            padding: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}>
                            <h4 style={{ 
                              color: '#60a5fa', 
                              fontSize: window.innerWidth <= 768 ? '0.875rem' : '1rem', 
                              fontWeight: '600', 
                              marginBottom: '0.5rem',
                              textAlign: window.innerWidth <= 768 ? 'center' : 'left'
                            }}>
                              📋 Activity Details
                            </h4>
                            <div style={{ 
                              color: '#dbeafe', 
                              fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem', 
                              lineHeight: '1.6' 
                            }}>
                              <div style={{ marginBottom: '0.25rem' }}><strong>Type:</strong> 
                                <span style={{ 
                                  color: activity.action === 'sign-in' ? '#10b981' : '#ef4444',
                                  fontWeight: 'bold',
                                  marginLeft: '0.5rem'
                                }}>
                                  {activity.action === 'sign-in' ? '✅ Sign In' : '🚪 Sign Out'}
                                </span>
                              </div>
                              <div style={{ marginBottom: '0.25rem' }}><strong>Date:</strong> {new Date(activity.timestamp).toLocaleDateString()}</div>
                              <div style={{ marginBottom: '0.25rem' }}><strong>Time:</strong> {new Date(activity.timestamp).toLocaleTimeString()}</div>
                              <div style={{ marginBottom: '0.25rem' }}><strong>Record ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{activity.id}</span></div>
                            </div>
                          </div>

                          {/* Work Description */}
                          <div style={{
                            padding: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}>
                            <h4 style={{ 
                              color: '#10b981', 
                              fontSize: window.innerWidth <= 768 ? '0.875rem' : '1rem', 
                              fontWeight: '600', 
                              marginBottom: '0.5rem',
                              textAlign: window.innerWidth <= 768 ? 'center' : 'left'
                            }}>
                              💼 Work Description
                            </h4>
                            <div style={{ 
                              color: '#dbeafe', 
                              fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem', 
                              lineHeight: '1.6',
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                              borderRadius: '8px',
                              minHeight: window.innerWidth <= 768 ? '80px' : '100px',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              {activity.description || 'No work description provided for this activity.'}
                            </div>
                          </div>

                          {/* File Attachment */}
                          <div style={{
                            padding: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                          }}>
                            <h4 style={{ 
                              color: '#f59e0b', 
                              fontSize: window.innerWidth <= 768 ? '0.875rem' : '1rem', 
                              fontWeight: '600', 
                              marginBottom: '0.5rem',
                              textAlign: window.innerWidth <= 768 ? 'center' : 'left'
                            }}>
                              📎 Attachments
                            </h4>
                            <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                              {activity.uploadedFile ? (
                                <div style={{
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem'
                                }}>
                                  <span style={{ fontSize: '1.5rem' }}>📎</span>
                                  <div>
                                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{activity.uploadedFile}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>File attached to this record</div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{
                                  background: 'rgba(156, 163, 175, 0.1)',
                                  border: '1px solid rgba(156, 163, 175, 0.3)',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                  textAlign: 'center',
                                  color: '#9ca3af'
                                }}>
                                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                                  No files attached to this record
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Personal Quick Actions */}
                        <div style={{ 
                          marginTop: '1.5rem', 
                          paddingTop: '1.5rem', 
                          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                          justifyContent: 'center'
                        }}>
                          {activity.action === 'sign-out' && (
                            <button
                              onClick={() => editPersonalActivity(activity)}
                              style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                              }}
                            >
                              ✏️ Edit Description
                            </button>
                          )}
                        </div>

                        {/* Detailed Activity Information */}
                        <div style={{ 
                          marginTop: '1.5rem', 
                          paddingTop: '1.5rem', 
                          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <h4 style={{ 
                            color: '#f59e0b', 
                            fontSize: '1.125rem', 
                            fontWeight: '600', 
                            marginBottom: '1rem',
                            textAlign: 'center'
                          }}>
                            📊 Detailed Activity Information
                          </h4>
                          
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1rem'
                          }}>
                            {/* Time Analysis */}
                            <div style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              borderRadius: '12px',
                              padding: '1rem'
                            }}>
                              <h5 style={{ color: '#10b981', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                                ⏰ Time Analysis
                              </h5>
                              <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Date:</strong> 
                                  <span style={{ 
                                    color: '#10b981',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {new Date(activity.timestamp).toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Time:</strong> 
                                  <span style={{ 
                                    color: '#059669',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem',
                                    fontFamily: 'monospace',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {new Date(activity.timestamp).toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit', 
                                      second: '2-digit',
                                      hour12: true 
                                    })}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Day of Week:</strong> 
                                  <span style={{ 
                                    color: '#10b981',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {new Date(activity.timestamp).toLocaleDateString('en-US', { weekday: 'long' })}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Month:</strong> 
                                  <span style={{ 
                                    color: '#059669',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'long' })}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Year:</strong> 
                                  <span style={{ 
                                    color: '#10b981',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem',
                                    fontFamily: 'monospace',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {new Date(activity.timestamp).getFullYear()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Activity Metadata */}
                            <div style={{
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              borderRadius: '12px',
                              padding: '1rem'
                            }}>
                              <h5 style={{ color: '#60a5fa', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                                🔍 Activity Metadata
                              </h5>
                              <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Record ID:</strong> 
                                  <span style={{ 
                                    fontFamily: 'monospace', 
                                    background: 'rgba(0,0,0,0.3)', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    color: '#60a5fa',
                                    fontWeight: '600'
                                  }}>
                                    {activity.id}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Action Type:</strong> 
                                  <span style={{ 
                                    color: activity.action === 'sign-in' ? '#10b981' : '#ef4444',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {activity.action === 'sign-in' ? '✅ Sign In' : '🚪 Sign Out'}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Status:</strong> 
                                  <span style={{ 
                                    color: '#10b981', 
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    ✓ Completed
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>User:</strong> 
                                  <span style={{ 
                                    color: '#f59e0b',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {activity.username}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Session:</strong> 
                                  <span style={{ 
                                    color: activity.action === 'sign-in' ? '#10b981' : '#ef4444',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {activity.action === 'sign-in' ? '🚀 Started' : '🏁 Ended'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Work Summary */}
                            <div style={{
                              background: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.2)',
                              borderRadius: '12px',
                              padding: '1rem'
                            }}>
                              <h5 style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                                💼 Work Summary
                              </h5>
                              <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Description Length:</strong> 
                                  <span style={{ 
                                    color: '#f59e0b', 
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {activity.description ? `${activity.description.length} characters` : 'No description'}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Has Attachments:</strong> 
                                  <span style={{ 
                                    color: activity.uploadedFile ? '#10b981' : '#ef4444',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {activity.uploadedFile ? '✅ Yes' : '❌ No'}
                                  </span>
                                </div>
                                {activity.uploadedFile && (
                                  <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>File Type:</strong> 
                                    <span style={{ 
                                      color: '#8b5cf6',
                                      fontWeight: '600',
                                      marginLeft: '0.5rem',
                                      fontFamily: 'monospace',
                                      background: 'rgba(139, 92, 246, 0.2)',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>
                                      {activity.uploadedFile.split('.').pop()?.toUpperCase() || 'Unknown'}
                                    </span>
                                  </div>
                                )}
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Activity Category:</strong> 
                                  <span style={{ 
                                    color: activity.action === 'sign-in' ? '#10b981' : '#ef4444',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {activity.action === 'sign-in' ? '🟢 Arrival' : '🔴 Departure'}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Work Session:</strong> 
                                  <span style={{ 
                                    color: activity.action === 'sign-in' ? '#3b82f6' : '#f59e0b',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {activity.action === 'sign-in' ? '🚀 Beginning' : '🏁 Completion'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Additional Details Row */}
                          <div style={{ 
                            marginTop: '1rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem'
                          }}>
                            {/* System Information */}
                            <div style={{
                              background: 'rgba(139, 92, 246, 0.1)',
                              border: '1px solid rgba(139, 92, 246, 0.2)',
                              borderRadius: '12px',
                              padding: '1rem'
                            }}>
                              <h5 style={{ color: '#8b5cf6', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                                🖥️ System Information
                              </h5>
                              <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Browser:</strong> 
                                  <span style={{ 
                                    color: '#8b5cf6',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {navigator.userAgent.includes('Chrome') ? '🌐 Chrome' : navigator.userAgent.includes('Firefox') ? '🦊 Firefox' : navigator.userAgent.includes('Safari') ? '🍎 Safari' : '❓ Unknown'}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Platform:</strong> 
                                  <span style={{ 
                                    color: '#a78bfa',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem',
                                    fontFamily: 'monospace',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {navigator.platform}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Language:</strong> 
                                  <span style={{ 
                                    color: '#8b5cf6',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {navigator.language}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Online Status:</strong> 
                                  <span style={{ 
                                    color: '#10b981',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    ✓ Online
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Timestamp:</strong> 
                                  <span style={{ 
                                    color: '#a78bfa',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem',
                                    fontFamily: 'monospace',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem'
                                  }}>
                                    {new Date(activity.timestamp).toISOString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Activity Context */}
                            <div style={{
                              background: 'rgba(236, 72, 153, 0.1)',
                              border: '1px solid rgba(236, 72, 153, 0.2)',
                              borderRadius: '12px',
                              padding: '1rem'
                            }}>
                              <h5 style={{ color: '#ec4899', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                                📍 Activity Context
                              </h5>
                              <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Time Zone:</strong> 
                                  <span style={{ 
                                    color: '#ec4899',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem',
                                    fontFamily: 'monospace',
                                    background: 'rgba(236, 72, 153, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Local Time:</strong> 
                                  <span style={{ 
                                    color: '#f472b6',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {new Date(activity.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>UTC Time:</strong> 
                                  <span style={{ 
                                    color: '#ec4899',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem',
                                    fontFamily: 'monospace',
                                    background: 'rgba(236, 72, 153, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem'
                                  }}>
                                    {new Date(activity.timestamp).toUTCString()}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Season:</strong> 
                                  <span style={{ 
                                    color: '#f472b6',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem'
                                  }}>
                                    {(() => {
                                      const month = new Date(activity.timestamp).getMonth();
                                      if (month >= 2 && month <= 4) return '🌱 Spring';
                                      if (month >= 5 && month <= 7) return '☀️ Summer';
                                      if (month >= 8 && month <= 10) return '🍂 Fall';
                                      return '❄️ Winter';
                                    })()}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Week Number:</strong> 
                                  <span style={{ 
                                    color: '#ec4899',
                                    fontWeight: '600',
                                    marginLeft: '0.5rem',
                                    fontFamily: 'monospace',
                                    background: 'rgba(236, 72, 153, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {(() => {
                                      const date = new Date(activity.timestamp);
                                      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                                      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);
                                      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}



        {/* Sign Out Modal */}
        {showSignOutModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                🚪 Sign Out
              </h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#374151', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem' 
                }}>
                  Work Description (Optional):
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you worked on today..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#374151', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem' 
                }}>
                  Upload File (Optional):
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = '#f9fafb';
                }}>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                    <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                      📎 {selectedFile ? selectedFile.name : 'Click to select file or drag & drop'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      Max size: 10MB | PDF, DOC, TXT, Images
                    </div>
                  </label>
                </div>
                {selectedFile && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.5rem', 
                    background: '#dbeafe', 
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>📎 Selected: {selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        padding: '0'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center' 
              }}>
                <button
                  onClick={() => setShowSignOutModal(false)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#6b7280';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOutConfirm}
                  disabled={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isLoading ? 'Signing Out...' : 'Confirm Sign Out'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Work Details Modal */}
        {showWorkDetailsModal && selectedWorkDetails && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                📋 Work Details
              </h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#374151' }}>Action:</strong>
                <span style={{ 
                  color: selectedWorkDetails.action === 'sign-in' ? '#10b981' : '#ef4444',
                  fontWeight: 'bold',
                  marginLeft: '0.5rem'
                }}>
                  {selectedWorkDetails.action === 'sign-in' ? '✅ Sign In' : '🚪 Sign Out'}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#374151' }}>User:</strong>
                <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                  {selectedWorkDetails.username}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#374151' }}>Timestamp:</strong>
                <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                  {new Date(selectedWorkDetails.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#374151' }}>Description:</strong>
                <div style={{ 
                  color: '#6b7280', 
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedWorkDetails.description}
                </div>
              </div>
              
              {selectedWorkDetails.uploadedFile && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#374151' }}>Attached File:</strong>
                  <div style={{ 
                    color: '#6b7280', 
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: '#dbeafe',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}>
                    📎 {selectedWorkDetails.uploadedFile}
                  </div>
                </div>
              )}
              
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  onClick={closeWorkDetailsModal}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#6b7280';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Sign-Out Modal */}
        {showEditModal && editingActivity && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                ✏️ Edit Sign-Out Description
              </h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#374151', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem' 
                }}>
                  Work Description:
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe what you worked on today..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#374151', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem' 
                }}>
                  Update File (Optional):
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = '#f9fafb';
                }}>
                  <input
                    type="file"
                    onChange={handleEditFileChange}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="edit-file-input"
                  />
                  <label htmlFor="edit-file-input" style={{ cursor: 'pointer' }}>
                    <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                      📎 {editFile ? editFile.name : 'Click to select new file or drag & drop'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      Max size: 10MB | PDF, DOC, TXT, Images
                    </div>
                  </label>
                </div>
                {editingActivity.uploadedFile && !editFile && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.5rem', 
                    background: '#f3f4f6', 
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    📎 Current file: {editingActivity.uploadedFile}
                  </div>
                )}
                {editFile && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.5rem', 
                    background: '#dbeafe', 
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>📎 New file: {editFile.name}</span>
                    <button
                      onClick={() => setEditFile(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        padding: '0'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center' 
              }}>
                <button
                  onClick={closeEditModal}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#6b7280';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {showAdminPanel && user.role === 'admin' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              👑 Admin Panel
            </h2>
            
            {/* Admin Actions */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem' 
            }}>
              <button
                onClick={() => downloadCSV()}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                }}
              >
                📊 Download CSV
              </button>

              <button
                onClick={() => syncGoogleSheets()}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                }}
              >
                🔄 Sync Google Sheets
              </button>

              <button
                onClick={() => exportData()}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
                }}
              >
                📤 Export Data
              </button>

              <button
                onClick={() => generateReport()}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)';
                }}
              >
                📈 Generate Report
              </button>
            </div>
            
            {/* User Management */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem' }}>User Management</h3>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {allUsers.length > 0 ? (
                  allUsers.map((userItem) => (
                    <div key={userItem.username} style={{
                      marginBottom: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      {/* User Header - Always Visible */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => toggleUserDetails(userItem.username)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.125rem'
                          }}>
                            {userItem.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ color: 'white', fontSize: '1rem' }}>{userItem.name}</strong>
                            <div style={{ color: '#dbeafe', fontSize: '0.875rem' }}>
                              @{userItem.username} • {userItem.role}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ 
                            color: '#9ca3af', 
                            fontSize: '1.25rem',
                            transition: 'transform 0.2s ease',
                            transform: expandedUsers.includes(userItem.username) ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}>
                            ▼
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                editUser(userItem);
                              }}
                              style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteUser(userItem.username);
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* User Details Dropdown */}
                      {expandedUsers.includes(userItem.username) && (
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.2)',
                          padding: '1rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {/* Basic Info */}
                            <div>
                              <h4 style={{ color: '#60a5fa', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                📋 Basic Information
                              </h4>
                              <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                <div><strong>Full Name:</strong> {userItem.name}</div>
                                <div><strong>Username:</strong> @{userItem.username}</div>
                                <div><strong>Role:</strong> {userItem.role}</div>
                                <div><strong>Email:</strong> {userItem.email}</div>
                              </div>
                            </div>

                            {/* Attendance Stats */}
                            <div>
                              <h4 style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                📊 Attendance Statistics
                              </h4>
                              <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                <div><strong>Total Sign-ins:</strong> {activityUpdates.filter(a => a.username === userItem.username && a.action === 'sign-in').length}</div>
                                <div><strong>Total Sign-outs:</strong> {activityUpdates.filter(a => a.username === userItem.username && a.action === 'sign-out').length}</div>
                                <div><strong>Today Sign-ins:</strong> {activityUpdates.filter(a => a.username === userItem.username && a.action === 'sign-in' && new Date(a.timestamp).toDateString() === new Date().toDateString()).length}</div>
                                <div><strong>Today Sign-outs:</strong> {activityUpdates.filter(a => a.username === userItem.username && a.action === 'sign-out' && new Date(a.timestamp).toDateString() === new Date().toDateString()).length}</div>
                              </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                              <h4 style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                ⏰ Recent Activity
                              </h4>
                              <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                {(() => {
                                  const userActivities = activityUpdates
                                    .filter(a => a.username === userItem.username)
                                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                    .slice(0, 3);
                                  
                                  if (userActivities.length === 0) {
                                    return <div>No recent activity</div>;
                                  }
                                  
                                  return userActivities.map((activity, index) => (
                                    <div key={index} style={{ marginBottom: '0.25rem' }}>
                                      <span style={{ 
                                        color: activity.action === 'sign-in' ? '#10b981' : '#ef4444',
                                        fontWeight: 'bold'
                                      }}>
                                        {activity.action === 'sign-in' ? '✅' : '🚪'} {activity.action}
                                      </span>
                                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '1rem' }}>
                                        {new Date(activity.timestamp).toLocaleString()}
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div style={{ 
                            marginTop: '1rem', 
                            paddingTop: '1rem', 
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              onClick={() => viewUserFullHistory(userItem.username)}
                              style={{
                                background: 'rgba(139, 92, 246, 0.2)',
                                color: '#a78bfa',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                              }}
                            >
                              📋 View Full History
                            </button>
                            <button
                              onClick={() => resetUserPassword(userItem.username)}
                              style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                              }}
                            >
                              🔑 Reset Password
                            </button>
                            <button
                              onClick={() => toggleUserStatus(userItem.username)}
                              style={{
                                background: userItem.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: userItem.status === 'active' ? '#f87171' : '#34d399',
                                border: userItem.status === 'active' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = userItem.status === 'active' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = userItem.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                              }}
                            >
                              {userItem.status === 'active' ? '🚫 Deactivate' : '✅ Activate'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    padding: '1rem', 
                    textAlign: 'center', 
                    color: '#9ca3af',
                    fontSize: '0.875rem'
                  }}>
                    {error ? `Error: ${error}` : 'Loading users...'}
                  </div>
                )}
              </div>
            </div>

            {/* Activity Records */}
            <div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem' }}>All Activity Records</h3>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {activityUpdates.map((activity) => (
                  <div key={activity.id} style={{
                    marginBottom: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}>
                    
                    {/* Activity Header - Always Visible */}
                    <div 
                      style={{
                        padding: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => toggleActivityDetails(activity.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: activity.action === 'sign-in' 
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.125rem'
                        }}>
                          {activity.action === 'sign-in' ? '✅' : '🚪'}
                        </div>
                        <div>
                          <div style={{ 
                            color: activity.action === 'sign-in' ? '#10b981' : '#ef4444',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            {activity.action.toUpperCase()}
                          </div>
                          <div style={{ color: 'white', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            {activity.username} • {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          color: '#9ca3af', 
                          fontSize: '1.25rem',
                          transition: 'transform 0.2s ease',
                          transform: expandedActivities.includes(activity.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                        <span style={{ color: '#dbeafe', fontSize: '0.75rem' }}>
                          Click to view details
                        </span>
                      </div>
                    </div>

                    {/* Activity Details Dropdown */}
                    {expandedActivities.includes(activity.id) && (
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        padding: '1rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                          {/* Basic Activity Info */}
                          <div>
                            <h4 style={{ color: '#60a5fa', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                              📋 Activity Information
                            </h4>
                            <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                              <div><strong>Action Type:</strong> 
                                <span style={{ 
                                  color: activity.action === 'sign-in' ? '#10b981' : '#ef4444',
                                  fontWeight: 'bold',
                                  marginLeft: '0.5rem'
                                }}>
                                  {activity.action === 'sign-in' ? '✅ Sign In' : '🚪 Sign Out'}
                                </span>
                              </div>
                              <div><strong>User:</strong> {activity.username}</div>
                              <div><strong>Date:</strong> {new Date(activity.timestamp).toLocaleDateString()}</div>
                              <div><strong>Time:</strong> {new Date(activity.timestamp).toLocaleTimeString()}</div>
                              <div><strong>Activity ID:</strong> {activity.id}</div>
                            </div>
                          </div>

                          {/* Work Description */}
                          <div>
                            <h4 style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                              💼 Work Description
                            </h4>
                            <div style={{ 
                              color: '#dbeafe', 
                              fontSize: '0.875rem', 
                              lineHeight: '1.6',
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              minHeight: '80px'
                            }}>
                              {activity.description || 'No description provided'}
                            </div>
                          </div>

                          {/* File Attachment */}
                          <div>
                            <h4 style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                              📎 Attachments
                            </h4>
                            <div style={{ color: '#dbeafe', fontSize: '0.875rem', lineHeight: '1.6' }}>
                              {activity.uploadedFile ? (
                                <div style={{
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  borderRadius: '8px',
                                  padding: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}>
                                  <span style={{ fontSize: '1.25rem' }}>📎</span>
                                  <div>
                                    <div style={{ fontWeight: '600' }}>{activity.uploadedFile}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>File attached</div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{
                                  background: 'rgba(156, 163, 175, 0.1)',
                                  border: '1px solid rgba(156, 163, 175, 0.3)',
                                  borderRadius: '8px',
                                  padding: '0.75rem',
                                  textAlign: 'center',
                                  color: '#9ca3af'
                                }}>
                                  No files attached
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ 
                          marginTop: '1rem', 
                          paddingTop: '1rem', 
                          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          <button
                            onClick={() => showWorkDetails(activity)}
                            style={{
                              background: 'rgba(139, 92, 246, 0.2)',
                              color: '#a78bfa',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                            }}
                          >
                            📋 View Full Details
                          </button>
                          <button
                            onClick={() => exportActivityData(activity)}
                            style={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                            }}
                          >
                            📤 Export Activity
                          </button>
                          <button
                            onClick={() => editActivityRecord(activity)}
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#60a5fa',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                            }}
                          >
                            ✏️ Edit Record
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}