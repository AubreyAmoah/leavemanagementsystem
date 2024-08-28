import { useEffect, useState } from "react";
import { Auth } from "./components/auth";
import Dashboard from "./components/dashboard";
import { auth } from "./config/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import Loading from "./components/loading";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        return;
      }
      setUser(null);
    });
    return () => unsubscribe();
  }, []);
  return (
    <div className="relative h-screen">
      <h1>
        <marquee>Remotown Leave Management System</marquee>
      </h1>
      {user === null ? <Auth /> : <Dashboard />}
    </div>
  );
}

export default App;
