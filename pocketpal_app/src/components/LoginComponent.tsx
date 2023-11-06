import {useEffect, useState} from "react";
import Auth from "./AuthenticationComponent.tsx"
import {auth} from "../config/firebase";
import {PasswordInput, TextInput, Button, Modal, UnstyledButton, Menu, Text, Divider} from "@mantine/core";
import "../styles/LoginComponentStyles.css";
import {signInWithEmailAndPassword} from "firebase/auth";
import {sendPasswordResetEmail} from "firebase/auth";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {useDisclosure} from "@mantine/hooks";
import "../styles/LoginComponentStyles.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {DefaultAlertTime, QuickAlertTime} from "../config/globals.tsx";
import {toast} from "react-toastify";
import {updateProfile} from "firebase/auth";
import {getFirestore, collection, addDoc} from "firebase/firestore";
import {AiOutlineMenu} from "react-icons/ai";
import {IconLogout, IconUsers} from "@tabler/icons-react";
import {Link} from "react-router-dom";

interface LoginComponentProps {
  userPhotoURL: string;
}

function LoginComponent({userPhotoURL}: LoginComponentProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth >= 768);

  const [opened, {open, close}] = useDisclosure(false);

  const [loggedIn, setLoggedIn] = useState(false);

  const [section, setSection] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const db = getFirestore();
  const usersCollection = collection(db, "users");

  const handleLogin = () => {

    if (!validateEmail(email)) {
      toast.error('Niepoprawny email!', {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }



    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  }

  const handleRegister = () => {

    if (!validateName(firstName)) {
      toast.error('Niepoprawne imię!', {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    if (!validateName(lastName)) {
      toast.error('Niepoprawne nazwisko!', {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Niepoprawny email!', {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Hasło musi zawierać co najmniej 8 znaków, jedną małą literę, jedną dużą literę, jedną cyfrę i jeden znak specjalny!', {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

   

    if (password !== repeatPassword) {
      toast.error('Hasła nie są takie same!', {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
        const userDocData = {
          displayName: firstName + " " + lastName,
          email: email,
        };

        await addDoc(usersCollection, userDocData);

        updateProfile(userCredential.user, {
          displayName: firstName + " " + lastName,
        }).then(() => {
          console.log("User profile updated");
        }).catch((error) => {
          console.error("Error while updating user profile: ", error);
        });
      }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(errorCode, errorMessage);
        }
      );
    }
  }

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
        // console.log("User logged in");
      } else {
        setLoggedIn(false);
        // console.log("User logged out");
      }
    });
  });

  useEffect(() => {
    setIsMobile(window.innerWidth >= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // funkcja do resetowania hasła
  const resetPassword = () => {

    if (!validateEmail(email)) {
      toast.error('Niepoprawny email!', {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.info('Wysłano link do zresetowania hasła!', {
          position: "top-center",
          autoClose: DefaultAlertTime,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        })
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error(errorMessage);
      });
  }

  const handleClose = () => {
    close();
    setEmail("");
    setPassword("");
    setRepeatPassword("");

    setTimeout(() => {
      setSection("login");
    }, 200);
  }

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  const validatePassword = (password: string) => {
    // eslint-disable-next-line no-useless-escape
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])([0-9a-zA-Z@#$%^&+=!]){8,}$/;
    return re.test(password);
  }

  const validateName = (name: string) => {
    // eslint-disable-next-line no-useless-escape
    const re = /^[a-zA-Z]+$/;
    return re.test(name);
  }

  return (
    <>
      <Menu
        width={200}
        position="bottom-end"
        transitionProps={{transition: 'pop-top-right'}}
        offset={20}
        classNames={{
          dropdown: 'dropdownMenu',
          item: 'dropdownItem',
        }}
      >
        <Menu.Target>
          <UnstyledButton className="login-button">
            <AiOutlineMenu size={40}/>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Profil</Menu.Label>
          <Menu.Item onClick={open}>
            {loggedIn ? (
              <div className="accountDetails">
                <img src={userPhotoURL} alt="User Profile" className="user-avatar" />
                <Text>{auth.currentUser?.displayName}</Text>
              </div>
            ) : (
              <div className="loginMenuButton">
                <FontAwesomeIcon icon={faUser}/>
                <Text size={"sm"} style={{width: "100%"}}>Zaloguj się</Text>
              </div>
            )}
          </Menu.Item>
          {loggedIn ? (
            <>
              {isMobile ?
                <Menu.Item
                  color={"blue"}
                  icon={<IconUsers/>}
                >
                  <Link to="/family">
                    <Text>Rodzina</Text>
                  </Link>
                </Menu.Item>
              : ""}
              <Menu.Divider/>
              <Menu.Item
                color={"red"}
                icon={<IconLogout/>}
                onClick={() => setTimeout(() => auth.signOut(), 200)}
              >
                Wyloguj
              </Menu.Item>
            </>
          ) : ""}
        </Menu.Dropdown>
      </Menu>
      {loggedIn ? (
        <Modal
          opened={opened}
          onClose={handleClose}
          size={"lg"}
          title="Logowanie"
          classNames={{ inner: "modalInner", content: "modalContent", header: "modalHeader", body: "modalBody" }}
        >
          <h4>Użytkownik zalogowany</h4>
          <img src={userPhotoURL} alt="User Profile" className="userAvatarAuth"/>
          <p>{auth.currentUser?.displayName}</p>
        </Modal>
      ) : (
        <>
          {section === "login" && (
            <Modal
              opened={opened}
              onClose={handleClose}
              size={"md"}
              title="Logowanie"
              classNames={{ inner: "modalInner", content: "modalContent", header: "modalHeader", body: "modalBody" }}
            >
              <Auth onClose={() => handleClose()}/>
              <Divider my="xs" size="sm" label="Albo użyj emailu i hasła" labelPosition="center" variant={"dashed"} style={{width: "100%"}}/>
              <TextInput required type="text" placeholder="Email" className="authInput"
                         onChange={(e) => setEmail(e.target.value)}/>
              <PasswordInput required placeholder="Hasło" className="authInput"
                             onChange={(e) => setPassword(e.target.value)}/>

              <div className="area_button">
                <Button className="loginButton" color="blue" onClick={() => handleLogin()}>Zaloguj się</Button>
                <Button className="registerButton" color="dark"
                        onClick={() => setSection("register")}>Rejestracja</Button>
                <Button color="dark" onClick={() => setSection("resetPassword")}>
                  Zapomniałem hasła
                </Button>
              </div>
            </Modal>
          )}

          {section === "register" && (
            <Modal
              opened={opened}
              onClose={handleClose}
              size={"lg"}
              title="Rejestracja"
              classNames={{ inner: "modalInner", content: "modalContent", header: "modalHeader", body: "modalBody" }}
            >
              <TextInput
              
                type="text" required placeholder="Imię" className="authInput" onChange={(e) => setFirstName(e.target.value)}/>
              <TextInput
                type="text" required placeholder="Nazwisko" className="authInput"
                onChange={(e) => setLastName(e.target.value)}/>
              <TextInput type="text" required placeholder="Email" className="authInput"
                         onChange={(e) => setEmail(e.target.value)}/>
              <PasswordInput required placeholder="Hasło" className="authInput"
                             onChange={(e) => setPassword(e.target.value)}/>
              <PasswordInput required  placeholder="Powtórz hasło" className="authInput"
                             onChange={(e) => setRepeatPassword(e.target.value)}/>
              <div className="area_button">
                <Button className="registerButton" color="dark" onClick={() => setSection("login")}>Logowanie</Button>
                <Button className="loginButton" onClick={() => handleRegister()}>Zarejestruj się</Button>
                <Auth onClose={() => handleClose()}/>
              </div>
            </Modal>
          )}

          {section === "resetPassword" && (
            <Modal
              opened={opened}
              onClose={handleClose}
              size={"lg"}
              title="Zresetuj hasło"
              classNames={{ inner: "modalInner", content: "modalContent", header: "modalHeader", body: "modalBody" }}
            >
              <TextInput required type="text" placeholder="Email" className="authInput"
                         onChange={(e) => setEmail(e.target.value)}/>
              <Button
                color="blue"
                onClick={() => {
                  resetPassword();
                }}
              >
                Zresetuj hasło
              </Button>
            </Modal>
          )}
        </>
      )}
    </>
  );
}

export default LoginComponent;