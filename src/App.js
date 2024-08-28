import { Auth } from "./components/auth";
import Dashboard from "./components/dashboard";
import { auth } from "./config/firebase.config";

function App() {
  return (
    <div className="relative h-screen">
      <h1>
        <marquee>Remotown Leave Management System</marquee>
      </h1>
      {!auth.currentUser && <Auth />}

      {auth.currentUser && <Dashboard />}
    </div>
  );
}

export default App;
