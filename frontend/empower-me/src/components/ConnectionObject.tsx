import React, { useState } from 'react';

// const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL
// change to heroku server after dev testing
const backend_url = "http://127.0.0.1:5000/"

interface ConnectionObjectProps {
  name: string;
  phone: string;
  imageUrl: string;
  id: string;
  clickerId: string;
}

const ConnectionObject: React.FC<ConnectionObjectProps> = ({ name, phone, imageUrl, id, clickerId }) => {
  const [buttonText, setButtonText] = useState("Connect");
  const [buttonStyle, setButtonStyle] = useState("bg-blue-500 hover:bg-blue-600 text-white");

  const sendConnectionRequest = async () => {
    const response = await fetch(backend_url + "send_connection_in_sql", {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "sender_id": clickerId, "receiver_id": id })
    });

    if (response.ok) {
      console.log("Connection request sent from " + clickerId + " to " + id);
      setButtonText("Pending");
      setButtonStyle("bg-gray-200 text-gray-700 cursor-not-allowed");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
      <div className="flex items-center p-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-lg font-medium">{name}</h3>
        </div>
      </div>
      </div>
      <div className="bg-gray-100 px-4 py-3 text-right">
        <button
          className={`${buttonStyle} font-medium py-2 px-4 rounded`}
          onClick={sendConnectionRequest}
          disabled={buttonText === "Pending"}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ConnectionObject;