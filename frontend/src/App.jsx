import './App.css';
import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from 'react';

const App = () => {
  const videoRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const scannerRef = useRef(null);
  // const API_URL = import.meta.env.VITE_API_URL;
  const API_URL = "https://backend-production-0e90.up.railway.app";
  console.log("API_URL:", API_URL);
  const [message, setMessage] = useState("");

  const initializeScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }

    const scanner = new QrScanner(videoRef.current, (result) => {
      console.log("Scanned Data: ", result.data);

      if (!/^TUPM-\d{2}-\d{4}$/.test(result.data)) {
        setMessage("Invalid QR Code format.");
        setShowPopup(true);
        return;
      }
  
      setScannedData(result.data);
      
      // try {
      //   const response = await fetch(`${API_URL}/check-registration`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ student_id: result.data }),
      //   });

      //   const data = await response.json();

      //   if (data.exists) {
      //     setMessage("⚠️ Already Registered!");
      //   } else {
      //     await fetch(`${API_URL}/register`, {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({ student_id: result.data }),
      //     })
      //   }
      // } catch (error) {
      //   setMessage("❌ Error connecting to server.");
      //   console.error("Server Error:", error);
      // }
      fetch(`${API_URL}/check-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: result.data }),
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.exists) {
          setMessage("⚠️ Already Registered!");
        } else {
          fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: result.data }),
          })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setMessage("✅ Registration Successful!");
            } else {
              setMessage("❌ Registration Failed!");
            }
          })
          .catch((error) => {
            setMessage("❌ Error registering student.");
            console.error("Register Error:", error);
          });
        }
        setShowPopup(true);
        scanner.stop();
      })
      .catch((error) => {
        setMessage("❌ Error connecting to server.");
        console.error("Server Error:", error);
        setShowPopup(true);
      });
    }, {
      highlightScanRegion: true,
      highlightCodeOutline: true,
    });

    scanner.start();
    scannerRef.current = scanner;
  };

  useEffect(() => {
    initializeScanner();

    return () => {
        // Cleanup on component unmount
        scannerRef.current.stop();
        scannerRef.current = null;
    };
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    if (scannerRef.current) {
      scannerRef.current.start();
    }
  };

  return(
    <>
      <div className='p-4 h-[25vh] flex items-center justify-center md:h-[20vh]'>
        <p className='text-3xl font-bold md:text-6xl'>General Assembly Registration</p>
      </div>

      <div className='bg-gray-300 w-[100%] h-[60vh] md:w-[70%] md:h-[60vh] rounded-md flex items-center justify-center'>
        <video ref={videoRef} className='w-full h-full object-cover bg-gray-200'></video>
      </div>

      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50">
          <div className="bg-[#333] m-8 rounded-md shadow-md text-center w-104 h-48 flex flex-col items-center justify-center">
            <p className='text-3xl font-medium'>{message}</p>
            <button onClick={handleClosePopup} className="mt-4 px-6 py-2 text-white rounded-md">Close</button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
