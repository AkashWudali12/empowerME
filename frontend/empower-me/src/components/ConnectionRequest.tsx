import React, { useState } from 'react';

// const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL
// change to heroku server after dev testing
const backend_url = "http://127.0.0.1:5000/"

interface ConnectionRequestProps {
  name: string;
  phone: string;
  imageUrl: string;
  id: string;
  clickerId: string;
  onStatusChange: () => void;  // Add this prop
}

const ConnectionRequest: React.FC<ConnectionRequestProps> = ({ name, phone, imageUrl, id, clickerId, onStatusChange }) => {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');

  const handleAccept = async () => {
    const response = await fetch(backend_url + "handle_connection_request", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "status":"accept", "sender_id":clickerId, "receiver_id":id})
    });
    if (response.ok) {
      setStatus('accepted');
      console.log("handled request");
      onStatusChange();  // Trigger re-render
    }
  };

  const handleDecline = async () => {
    const response = await fetch(backend_url + "handle_connection_request", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "status":"decline", "sender_id":clickerId, "receiver_id":id})
    });
    if (response.ok) {
      setStatus('declined');
      console.log("handled request");
      onStatusChange();  // Trigger re-render
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center p-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-lg font-medium">{name}</h3>
        </div>
      </div>
      <div className="bg-gray-100 px-4 py-3 text-right">
        <button
          className={`font-medium py-2 px-4 rounded mr-2 ${
            status === 'accepted' ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          onClick={handleAccept}
          disabled={status !== 'pending'}
        >
          Accept
        </button>
        <button
          className={`font-medium py-2 px-4 rounded ${
            status === 'declined' ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'
          } text-white`}
          onClick={handleDecline}
          disabled={status !== 'pending'}
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default ConnectionRequest;
