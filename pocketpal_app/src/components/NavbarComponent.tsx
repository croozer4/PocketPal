import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { auth, provider } from '../config/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import "../styles/NavbarComponentStyles.css";
import LoginComponent from './LoginComponent';

export function CustomNavbar() {
  const [showLoginBox, setShowLoginBox] = useState(false);
  const [userPhotoURL, setUserPhotoURL] = useState('');

  const openLoginBox = () => setShowLoginBox(true);
  const closeLoginBox = () => setShowLoginBox(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserPhotoURL(user.photoURL || ''); // Ustaw URL zdjęcia profilowego
      } else {
        setUserPhotoURL(''); // Czyść URL zdjęcia profilowego
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Router>
        <nav className="custom_navbar">
          <div className="nav_button">
            <Link to="/">Home</Link>
          </div>
          <div className="nav_button">
            <Link to="/Wiki">Wikipedia</Link>
          </div>
          <div className="nav-button-container">
          <button className="login-button" onClick={openLoginBox}>
              {userPhotoURL ? (
                <img src={userPhotoURL} alt="User Profile" className="user-avatar" />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
            </button>
          </div>
        </nav>
        <Routes>

        </Routes>
      </Router>

      {showLoginBox && (
        <div className="overlay">
          <LoginComponent onClose={closeLoginBox} userPhotoURL={userPhotoURL} />
        </div>
      )}
    </div>
  );
}
export default CustomNavbar;