import { useLocation, useNavigate } from "react-router-dom";

// Firebase Authentication
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Firebase Database
import { db } from "../firebase.config";

// Firebase Firestore
import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

// Icons
import googleIcon from "../assets/svg/googleIcon.svg";

// React Toastify
import { toast } from "react-toastify";

function OAuth() {
  const navigate = useNavigate();

  const location = useLocation();

  const onGoogleClick = async () => {
    try {
      const auth = getAuth();

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      // Check for user
      const docRef = doc(db, "users", user.uid);

      const docSnap = await getDoc(docRef);

      // If user, doesn't exists, create user
      if (!docSnap.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }

      navigate("/");
    } catch (error) {
      toast.error("Could not authorize with Google");
    }
  };

  return (
    <div className="socialLogin">
      <p>Sign {location.pathname === "/sign-up" ? "up" : "in"} with </p>

      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img src={googleIcon} alt="google" className="socialIconImg" />
      </button>
    </div>
  );
}

export default OAuth;
