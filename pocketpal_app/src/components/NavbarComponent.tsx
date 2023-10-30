import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import '../styles/NavbarComponentStyles.css';
import LoginComponent from './LoginComponent';
import logo from '../assets/pocketpal_logo.png';
import { Menu, Text, UnstyledButton } from '@mantine/core';
import {AiOutlineMenu} from "react-icons/ai";
import {
  IconSettings,
  IconUsers,
  IconHistory, IconLogout,
} from '@tabler/icons-react';

export function CustomNavbar() {
  const [showLoginBox, setShowLoginBox] = useState(false);
  const [userPhotoURL, setUserPhotoURL] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const openLoginBox = () => setShowLoginBox(true);

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

  useEffect(() => {
    setIsMobile(window.innerWidth >= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {isMobile ? (
        <nav className="navbar">
          <Router>
            <div className="logoContainer">
              <img src={logo} alt="PocketPal logo" className="logo" />
              <Text size={'xl'}>PocketPal</Text>
            </div>
            <div className="navbarContent">
              <div className="nav_button">
                <Link to="/history">
                  <Text>Historia</Text>
                </Link>
              </div>
              <div className="nav_button">
                <Link to="/family">
                  <Text>Rodzina</Text>
                </Link>
              </div>
              <div className="nav-button-container">
                {/*<UnstyledButton className="login-button" onClick={openLoginBox}>*/}
                {/*  {userPhotoURL ? (*/}
                {/*    <img src={userPhotoURL} alt="User Profile" className="user-avatar" />*/}
                {/*  ) : (*/}
                {/*    <FontAwesomeIcon icon={faUser} />*/}
                {/*  )}*/}
                {/*</UnstyledButton>*/}
                <LoginComponent userPhotoURL={userPhotoURL} />
              </div>
            </div>
          </Router>
        </nav>
      ) : (
        <nav className="navbar">
          {/*<Router>*/}
            <div className="logoContainer">
              <img src={logo} alt="PocketPal logo" className="logo" />
              <Text size={'xl'}>PocketPal</Text>
            </div>
            <div className="navbarContent">
              <Menu
                width={200}
                position="bottom-end"
                transitionProps={{ transition: 'pop-top-right' }}
                offset={20}
                classNames={{
                  dropdown: 'dropdownMenu',
                  item: 'dropdownItem',
                }}
              >
                <Menu.Target>
                  <UnstyledButton className="login-button">
                    <AiOutlineMenu size={40} />
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Profil</Menu.Label>
                  <Menu.Item>
                    {userPhotoURL ? (
                        <div className="accountDetails">
                          <img src={userPhotoURL} alt="User Profile" className="user-avatar" />
                          <Text>{auth.currentUser?.displayName}</Text>
                        </div>
                      ) : (
                        <UnstyledButton onClick={openLoginBox} className="loginMenuButton">
                          <FontAwesomeIcon icon={faUser}/>
                          <Text size={"sm"} style={{width: "100%"}}>Zaloguj się</Text>
                        </UnstyledButton>
                      )}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    icon={<IconHistory />}
                  >
                    Historia
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconUsers />}
                  >
                    Rodzina
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    icon={<IconSettings />}
                  >
                    Ustawienia
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color={"red"}
                    icon={<IconLogout />}
                    onClick={() => auth.signOut()}
                  >
                    Wyloguj
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          {/*</Router>*/}
        </nav>
      )}
      {showLoginBox && (
        <div className="overlay">
          <LoginComponent userPhotoURL={userPhotoURL} />
        </div>
      )}
    </>
  );
}

export default CustomNavbar;
