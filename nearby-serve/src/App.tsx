import React, { useState, useEffect } from 'react';
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
import * as firebaseService from './services/firebaseService';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.DONOR);
  const [userLocation, setUserLocation] = useState({ lat: CENTER_LAT, lng: CENTER_LNG });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isVolunteerOnline, setIsVolunteerOnline] = useState(true);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '', name: '', email: '', role: UserRole.DONOR, isLoggedIn: false
  });

  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'history'>('home');
  const [loginTargetRole, setLoginTargetRole] = useState<UserRole>(UserRole.DONOR);
  const [selectedRecipientForDonation, setSelectedRecipientForDonation] = useState<Recipient | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 🔥 REALTIME FIREBASE LISTENERS
  useEffect(() => {
    const unsubRecipients = firebaseService.listenRecipients((data) => {
      setRecipients(data);
    });

    const unsubRequests = firebaseService.listenRequests((data) => {
      setRequests(data);
    });

    return () => {
      unsubRecipients();
      unsubRequests();
    };
  }, []);

  // LOCATION
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoadingLocation(false);
        },
        () => setLoadingLocation(false)
      );
    } else setLoadingLocation(false);
  }, []);

  // DONATION REQUEST
  const handleDonationRequest = async (reqData: Omit<DeliveryRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'recipientName' | 'pickupLocation'>) => {
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

    await firebaseService.addRequest(newReq);
    setSelectedRecipientForDonation(null);
    setCurrentPage('history');
  };

  // RECIPIENT ADD
  const handleAddRecipient = async (newR: Recipient) => {
    await firebaseService.addRecipient(newR);
  };

  const handleUpdateRecipient = async (updatedR: Recipient) => {
    await firebaseService.updateRecipient(updatedR.id, updatedR);
  };

  const handleDeleteRecipient = async (id: string) => {
    await firebaseService.deleteRecipient(id);
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setRole(profile.role);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserProfile({ id: '', name: '', email: '', role: UserRole.DONOR, isLoggedIn: false });
    setRole(UserRole.DONOR);
    setCurrentPage('home');
  };

  const handleDonateClick = (r: Recipient) => {
    if (!userProfile.isLoggedIn) {
      setLoginTargetRole(UserRole.DONOR);
      setCurrentPage('login');
      return;
    }
    setSelectedRecipientForDonation(r);
  };

  const handleNavbarNavigate = (page: string) => setCurrentPage(page as any);

  const renderContent = () => {
    if (currentPage === 'login')
      return <LoginPage key={loginTargetRole} onLogin={handleLoginSuccess} targetRole={loginTargetRole} onBack={() => setCurrentPage('home')} />;

    if (currentPage === 'history')
      return <DonorHistory requests={requests.filter(r => r.donorName === userProfile.name)} />;

    if (role === UserRole.VOLUNTEER && userProfile.isLoggedIn) {
      const currentVol: Volunteer = {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        verified: true,
        totalDeliveries: requests.filter(r => r.volunteerId === userProfile.id && r.status === 'delivered').length,
        phone: '9876543210',
        isOnline: isVolunteerOnline
      };

      return (
        <VolunteerDashboard
          volunteer={currentVol}
          requests={requests}
          onRequestUpdate={() => {}}
          onAddRecipient={handleAddRecipient}
          onUpdateRecipient={handleUpdateRecipient}
          onDeleteRecipient={handleDeleteRecipient}
          recipients={recipients}
          userLocation={userLocation}
          isOnline={isVolunteerOnline}
          onToggleOnline={setIsVolunteerOnline}
        />
      );
    }

    if (role === UserRole.ADMIN && userProfile.isLoggedIn)
      return <AdminDashboard recipients={recipients} onAddRecipient={handleAddRecipient} volunteers={volunteers} onAddVolunteer={()=>{}} onDeleteVolunteer={()=>{}} />;

    return <DonorHome recipients={recipients} onDonate={handleDonateClick} userLocation={userLocation} isLoadingLocation={loadingLocation} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 relative">
      {currentPage !== 'login' &&
        <Navbar currentRole={role} userProfile={userProfile} onRoleChange={()=>{}} onLogout={handleLogout} onNavigate={handleNavbarNavigate} currentPage={currentPage} />
      }

      <main className="flex-grow">{renderContent()}</main>

      {currentPage !== 'login' && <Footer onRoleSelect={setLoginTargetRole} onNavigate={handleNavbarNavigate} />}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {selectedRecipientForDonation &&
        <DonationModal recipient={selectedRecipientForDonation} onClose={() => setSelectedRecipientForDonation(null)} onSubmitRequest={handleDonationRequest} />
      }
    </div>
  );
};

export default App;
