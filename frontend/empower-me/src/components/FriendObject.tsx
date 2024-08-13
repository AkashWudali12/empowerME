import React from 'react';

interface ConnectionObjectProps {
  name: string;
  phone: string;
  imageUrl: string;
  id: string;
  clickerId: string;
}

const FriendObject: React.FC<ConnectionObjectProps> = ({ name, phone, imageUrl, id, clickerId }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-center flex-col">
          <div className="flex items-center mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-medium">{name}</h3>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium">{"Phone: " + phone}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendObject;
