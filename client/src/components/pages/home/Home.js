import { Link } from "react-router-dom";
import Products from "../../products";
import LogoImg from "../../../assets/logo-berries-small-bottom.png";
import { useEffect, useState } from "react";

function Home() {
  const [isAtmosphereOn, setIsAtmosphereOn] = useState(false);
  const [isMessageDisplayed, setIsMessageDisplayed] = useState(false);

  useEffect(() => {
    const userMessageON = document.getElementById("ON");
    const userMessageOFF = document.getElementById("OFF");

    if (userMessageON && userMessageOFF) {
      userMessageON.style.opacity =
        isAtmosphereOn && isMessageDisplayed ? "1" : "0";
      userMessageOFF.style.opacity =
        !isAtmosphereOn && isMessageDisplayed ? "1" : "0";
    }

    const timeoutId = setTimeout(() => {
      setIsMessageDisplayed(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isAtmosphereOn, isMessageDisplayed]);

  const toggleAtmosphere = () => {
    setIsAtmosphereOn((prevState) => !prevState);
    setIsMessageDisplayed(true);
  };

  return (
    <div id="home-container">
      <div className="atmosphere-sun" id="flare2"></div>
      <div className="atmosphere-sun" id="flare3"></div>
      <div
        className="user-message-pop-up"
        id="ON"
        style={{
          opacity: isMessageDisplayed && isAtmosphereOn ? "1" : "0",
          transition: "opacity 0.75s ease-in-out",
        }}
      >
        Atmosphere effect is ON
      </div>
      <div
        className="user-message-pop-up"
        id="OFF"
        style={{
          opacity: isMessageDisplayed && !isAtmosphereOn ? "1" : "0",
          transition: "opacity 0.75s ease-in-out",
        }}
      >
        Atmosphere effect is OFF
      </div>
      <nav id="logo-group">
        <Link id="logout" to="/">
          Logout
        </Link>
        <div class="logo">
          <img
            src={LogoImg}
            onClick={toggleAtmosphere}
            alt="Berries Project Logo"
          />
        </div>
      </nav>
      <Products />
      <footer>
        <span>© Svitlana Lynne [2024]. All rights reserved.</span>
        <p>
          <span>Attributions:</span>
          <a href="https://www.freepik.com/free-vector/colorful-cartoon-berries-icons-collection_9586037.htm#query=berries&position=8&from_view=search&track=sph">
            Image by macrovector
          </a>{" "}
          <a href="https://www.freepik.com/free-vector/set-watercolor-isolated-raspberries-with-leaves-clipart-white-background_68509348.htm#page=2&query=berries&position=31&from_view=search&track=sph">
            Image by tohamina
          </a>
          on Freepik
        </p>
      </footer>
    </div>
  );
}

export default Home;
