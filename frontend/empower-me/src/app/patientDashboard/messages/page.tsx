"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FriendObject from '../../../components/FriendObject';

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Connection {
  name: string;
  imageUrl: string;
  phoneNumber: string;
  language: string;
  id: string;
  clickerId: string;
}

export default function ConnectionsDirectoryPage() { // Named the function as ConnectionsDirectoryPage
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [currentConnections, setCurrentConnections] = useState<string[]>([]);
  const [connectionsTsx, changeConnectionsTsx] = useState<JSX.Element>(<h1>{""}</h1>);

  const logout = () => {
    localStorage.setItem("sessionToken", "");
    router.push("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");

    if (!token) {
      router.push("/");
    } else {
      if (!patientId) {
        fetchData(token);
      }
      if (patientId && currentConnections.length === 0) {
        getConnections(patientId, "connections");
      }
      if (currentConnections.length > 0) {
        setConnections(currentConnections);
      }
    }
  }, [router, patientId, currentConnections]);

  const fetchData = async (token: string | null) => {
    const response = await fetch(backend_url + "check_session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken: token }),
    });
    if (response.ok) {
      const data = await response.json();
      setPatientId(data["pid"]);
      addUserToSQL(data["pid"]);
    } else {
      logout();
    }
  };

  const addUserToSQL = async (id: string) => {
    const response = await fetch(backend_url + "add_user_to_sql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      console.log("Could not add user " + id + " to SQL");
    }
  };

  const getConnections = async (id: string, columnName: string) => {
    const response = await fetch(backend_url + "get_ids_from_column", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, column: columnName }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data["ids"].length > 0) {
        setCurrentConnections(data["ids"]);
      }
    }
  };

  const getUserData = async (idLst: string[]) => {
    const response = await fetch(backend_url + "get_user_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idLst, namespace: "patientsInfo" }),
    });
    if (response.ok) {
      const data = await response.json();
      return data["userInfo"];
    }
    return [];
  };

  const setConnections = async (topMatches: string[]) => {
    const connections: Connection[] = [];
    const dataForMatches = await getUserData(topMatches);
    for (const match of dataForMatches) {
      const dataToUse = JSON.parse(match);
      const toAdd: Connection = {
        name: dataToUse["firstName"] + " " + dataToUse["lastName"],
        imageUrl: "./placeholder-user.jpg",
        phoneNumber: dataToUse["phoneNumber"],
        language: dataToUse["languageSpoken"],
        id: dataToUse["id"],
        clickerId: patientId,
      };
      connections.push(toAdd);
    }

    changeConnectionsTsx(
      <div>
        <h1 className="text-3xl font-bold mb-8">Connections</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {connections.map((connection, index) => (
            <FriendObject
              key={index}
              name={connection.name}
              phone={connection.phoneNumber}
              imageUrl={connection.imageUrl}
              id={connection.id}
              clickerId={connection.clickerId}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex space-x-8 items-start mt-4">
      <div className="flex-1 space-y-12">{connectionsTsx}</div>
      <div style={{ width: "100px" }}>
        <div className="bg-gray-100 p-4">
          <div className="grid grid-cols-1">
            <Link href="/patientDashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
