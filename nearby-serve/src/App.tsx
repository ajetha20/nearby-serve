import React, { useState, useEffect, useRef } from 'react';
import { UserRole, Recipient, DeliveryRequest, UserProfile, Volunteer } from './types';
import { CENTER_LAT, CENTER_LNG } from './constants';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DonorHome } from './pages/DonorHome';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DonationModal } from './components/DonationModal';
import { LoginPage } from './pages/LoginPage';
import { DonorHistory } from './pages/DonorHistory';
import { Toast } from './components/Toast';
import { storageService } from './services/storage';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.DONOR);
  const [userLocation, setUserLocation] = useState({ lat: CENTER_LAT, lng: CENTER_LNG });
  const [recipients, setRecipients] = useState<Recipient[]>([]); 
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  
  const [isVolunteerOnline, setIsVolunteerOnline] = useState(true);

  // User Session State
  const [userProfile, setUserProfile] = useState<UserProfile>({ id: '', name: '', email: '', role: UserRole.DONOR, isLoggedIn: false });
  
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'history'>('home');
  const [loginTargetRole, setLoginTargetRole] = useState<UserRole>(UserRole.DONOR);

  const [selectedRecipientForDonation, setSelectedRecipientForDonation] = useState<Recipient | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Initial Data from Storage
  useEffect(() => {
    // Sync state with storage initially
    setRecipients(storageService.getRecipients());
    setRequests(storageService.getRequests());
    setVolunteers(storageService.getVolunteers());

    // Check for existing session
    const session = storageService.getCurrentSession();
    if (session) {
        setUserProfile(session);
        setRole(session.role);
    }
  }, []);

  // Sync Interval (Poll storage for updates - simulating real-time)
  useEffect(() => {
    const interval = setInterval(() => {
       setRecipients(storageService.getRecipients());
       const newReqs = storageService.getRequests();
       setRequests(prev => {
           if (newReqs.length > prev.length && role === UserRole.VOLUNTEER) {
               setToastMessage("New Donation Request Received!");
           }
           return newReqs;
       });
       setVolunteers(storageService.getVolunteers());
    }, 2000);
    return () => clearInterval(interval);
  }, [role]);

  // Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoadingLocation(false);
        },
        () => setLoadingLocation(false)
      );
    } else {
      setLoadingLocation(false);
    }
  }, []);

  const handleDonationRequest = (reqData: Omit<DeliveryRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'recipientName' | 'pickupLocation'>) => {
    const recipientName = recipients.find(r => r.id === reqData.recipientId)?.name || 'Unknown';

    const newReq: DeliveryRequest = {
      ...reqData,
      recipientName,
      donorName: userProfile.isLoggedIn ? userProfile.name : 'Anonymous',
      id: `req_${Date.now()}`,
      status: 'pending',
      pickupLocation: userLocation, 
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serviceFee: reqData.serviceFee
    };
    
    storageService.addRequest(newReq);
    setRequests(storageService.getRequests());
    
    setSelectedRecipientForDonation(null);
    setCurrentPage('history');
  };

  const handleRequestUpdate = (id: string, status: DeliveryRequest['status'], extraData?: any) => {
    // If volunteer accepts, assign them
    let updateData = { ...extraData };
    if (status === 'accepted' && role === UserRole.VOLUNTEER) {
        updateData.volunteerId = userProfile.id;
        updateData.volunteerName = userProfile.name;
    }
    
    const updatedList = storageService.updateRequestStatus(id, status, updateData);
    setRequests(updatedList);
  };

  // Recipient Management (Volunteers/Admin)
  const handleAddRecipient = (newR: Recipient) => {
    storageService.addRecipient(newR);
    setRecipients(storageService.getRecipients());
  };

  const handleUpdateRecipient = (updatedR: Recipient) => {
    storageService.updateRecipient(updatedR);
    setRecipients(storageService.getRecipients());
  };

  const handleDeleteRecipient = (id: string) => {
    storageService.deleteRecipient(id);
    setRecipients(storageService.getRecipients());
  };
  
  const handleAddVolunteer = (newV: Volunteer) => {
    // Volunteers are added via User Registration in Admin Dashboard, 
    // but the state update happens via polling storageService.getVolunteers
    setVolunteers(storageService.getVolunteers());
  };

  const handleDeleteVolunteer = (id: string) => {
     // Not implemented in storage service demo, but would delete user
     alert("Deletion not supported in this demo.");
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setRole(profile.role); // Role follows the login
    
    if (profile.role === UserRole.DONOR && localStorage.getItem('pendingDonationId')) {
       const id = localStorage.getItem('pendingDonationId');
       const r = recipients.find(rec => rec.id === id);
       if (r) setSelectedRecipientForDonation(r);
       localStorage.removeItem('pendingDonationId');
    }
    setCurrentPage('home');
  };

  const handleLogout = () => {
    storageService.logout();
    setUserProfile({ id: '', name: '', email: '', role: UserRole.DONOR, isLoggedIn: false });
    setRole(UserRole.DONOR);
    setCurrentPage('home');
  };

  const handleDonateClick = (r: Recipient) => {
    if (!userProfile.isLoggedIn) {
       localStorage.setItem('pendingDonationId', r.id);
       setLoginTargetRole(UserRole.DONOR);
       setCurrentPage('login');
       return;
    }
    setSelectedRecipientForDonation(r);
  };
  
  const handleFooterRoleSelect = (target: UserRole) => {
    setLoginTargetRole(target);
    setCurrentPage('login');
  };

  const handleNavbarNavigate = (page: string) => {
    if (page === 'login') setLoginTargetRole(UserRole.DONOR);
    setCurrentPage(page as any);
  };

  const handleNavbarRoleChange = (newRole: UserRole) => {
    // Only allow switching to Donor view if logged in as something else, primarily for preview
    if (newRole === UserRole.DONOR) setRole(UserRole.DONOR);
    // Cannot switch TO volunteer/admin without login
  };

  const renderContent = () => {
    if (currentPage === 'login') {
      return (
        <LoginPage 
          key={loginTargetRole} 
          onLogin={handleLoginSuccess} 
          targetRole={loginTargetRole}
          onBack={() => setCurrentPage('home')}
        />
      );
    }

    if (currentPage === 'history') return <DonorHistory requests={requests.filter(r => r.donorName === userProfile.name)} />; 

    if (role === UserRole.VOLUNTEER && userProfile.isLoggedIn) {
      // Need to cast UserProfile to Volunteer-like structure or fetch specific details
      const currentVol: Volunteer = {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          verified: true,
          totalDeliveries: requests.filter(r => r.volunteerId === userProfile.id && r.status === 'delivered').length,
          phone: '9876543210',
          isOnline: isVolunteerOnline
      };

      return <VolunteerDashboard 
        volunteer={currentVol} 
        requests={requests} 
        onRequestUpdate={handleRequestUpdate} 
        onAddRecipient={handleAddRecipient}
        onUpdateRecipient={handleUpdateRecipient}
        onDeleteRecipient={handleDeleteRecipient}
        recipients={recipients}
        userLocation={userLocation}
        isOnline={isVolunteerOnline}
        onToggleOnline={setIsVolunteerOnline}
      />;
    }
    if (role === UserRole.ADMIN && userProfile.isLoggedIn) {
      return <AdminDashboard 
        recipients={recipients} 
        onAddRecipient={handleAddRecipient} 
        volunteers={volunteers}
        onAddVolunteer={handleAddVolunteer}
        onDeleteVolunteer={handleDeleteVolunteer}
      />;
    }
    
    return (
      <DonorHome 
        recipients={recipients} 
        onDonate={handleDonateClick} 
        userLocation={userLocation}
        isLoadingLocation={loadingLocation}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 relative">
      {currentPage !== 'login' && (
        <Navbar 
          currentRole={role} 
          userProfile={userProfile}
          onRoleChange={handleNavbarRoleChange} 
          onLogout={handleLogout}
          onNavigate={handleNavbarNavigate}
          currentPage={currentPage}
        />
      )}
      
      <main className="flex-grow">
        {renderContent()}
      </main>

      {currentPage !== 'login' && (
        <Footer onRoleSelect={handleFooterRoleSelect} onNavigate={handleNavbarNavigate} />
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {selectedRecipientForDonation && (
        <DonationModal 
          recipient={selectedRecipientForDonation} 
          onClose={() => setSelectedRecipientForDonation(null)}
          onSubmitRequest={handleDonationRequest}
        />
      )}
    </div>
  );
};

export default App;