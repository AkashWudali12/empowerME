"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConnectionObject from './ConnectionObject';
import ConnectionRequest from './ConnectionRequest';
import { ChatBox } from './ChatBox';
import Link from 'next/link';


interface Connection {
  name: string;
  imageUrl: string;
  phoneNumber: string;
  language: string;
  id: string;
  clickerId: string;
}

export function ConnectionsDirectory() {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [topMatches, setTopMatches] = useState<string[]>([]);
  const [currentRequests, setCurrentRequests] = useState<string[]>([]);
  const [connectionsTsx, changeConnectionsTsx] = useState<JSX.Element>(<h1>""</h1>);
  const [requestsTsx, changeRequestsTsx] = useState<JSX.Element>(<h1>""</h1>);
  const [updateFlag, setUpdateFlag] = useState(false);  // State to trigger re-renders

  console.log("updateFlag:", updateFlag)

  const logout = () => {
    localStorage.setItem("sessionToken", "");
    router.push("/")
  };

  useEffect(() => {
    console.log("patientID:", patientId);
    console.log("topMatches:", topMatches);
    console.log("current requests:", currentRequests);

    const token = localStorage.getItem("sessionToken");

    console.log("Token being checked:", token)

    if (token === null || !token) {
      router.push("/");
    } 
    else {
      if (patientId === "") {
        console.log("getting patient id");
        fetchData(token);
      }
      if (patientId !== "") {
        if (topMatches.length === 0) {
          getTopMatches(patientId, 10);
        }
        getFriendRequests(patientId, "requests");
      }
      if (topMatches.length > 0) {
        console.log("adding connections with matches " + topMatches);
        setConnections(topMatches);
      }
      if (currentRequests.length > 0) {
        console.log("adding friend requests from " + currentRequests);
        setRequests(currentRequests);
      }
    }
  }, [router, patientId, topMatches, updateFlag]);  // Re-run effect when updateFlag changes

  const onStatusChange = () => {
    setUpdateFlag((prevFlag) => !prevFlag);  // Toggle updateFlag to trigger re-render
  };

  const fetchData = async (token: string | null) => {
    const response = await fetch("http://127.0.0.1:5000/check_session", {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "sessionToken": token })
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
    const response = await fetch("http://127.0.0.1:5000/add_user_to_sql", {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "id": id })
    });
    if (response.ok) {
      console.log("Successfully added user " + id + " to sql");
    } else {
      console.log("Could not add user " + id + " to sql");
    }
  };

  const getFriendRequests = async (id: string, columnName: string) => {
    const friendRequestUrl = "http://127.0.0.1:5000/get_ids_from_column";
    const response = await fetch(friendRequestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ "id":id, "column":columnName })
    });
    if(response.ok) {
      const data = await response.json();
      console.log("curr requests methods:", data);
      setCurrentRequests(data["ids"]);
    }
  };

  const getUserData = async (idLst: string[]) => {
    const patientDataUrl = "get_user_data";
    const response = await fetch("http://127.0.0.1:5000/" + patientDataUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ "idLst":idLst, "namespace":"patientsInfo" })
    });
    if (response.ok) {
      const data = await response.json();
      return data["userInfo"];
    } else {
      return [];
    }
  };

  const getTopMatches = async (q: number[] | string, k: number) => {
    var url: string = "";
    const payload = {"query":q, "k":k, "namespace":"patientsInfo"};
    if (typeof q === "string") {
      url = "http://127.0.0.1:5000/get_matches_from_id";
    } else {
      url = "http://127.0.0.1:5000/get_matches_from_vector";
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const data = await response.json();
      setTopMatches(data["matches"]);
    }
  };

  const setConnections = async (topMatches: string[]) => {
    let connections: Connection[] = [];
    const dataForMatches = await getUserData(topMatches);
    for (let i = 0; i < dataForMatches.length; i++) {
      const dataToUse = JSON.parse(dataForMatches[i]);
      console.log("Data being used for connections:", dataToUse, typeof dataToUse);
      const name = dataToUse["firstName"] + " " + dataToUse["lastName"];
      const phoneNumber = dataToUse["phoneNumber"];
      const language = dataToUse["languageSpoken"];
      const pictureUrl = "placeholder-user.jpg";
      const id = dataToUse["id"];
      const toAdd: Connection = { name: name, imageUrl: pictureUrl, phoneNumber: phoneNumber, language: language, id: id, clickerId: patientId };
      connections.push(toAdd);
    }

    changeConnectionsTsx((
      <div>
        <h1 className="text-3xl font-bold mb-8">Connections</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {connections.map((connection, index) => (
            <ConnectionObject
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
    ));
  };

  const setRequests = async (userRequests: string[]) => {
    let connectionRequests: Connection[] = [];
    const dataForMatches = await getUserData(userRequests);
    for (let i = 0; i < dataForMatches.length; i++) {
      const dataToUse = JSON.parse(dataForMatches[i]);
      console.log("Data being used for requests:", dataToUse, typeof dataToUse);
      const name = dataToUse["firstName"] + " " + dataToUse["lastName"];
      const phoneNumber = dataToUse["phoneNumber"];
      const language = dataToUse["languageSpoken"];
      const pictureUrl = "placeholder-user.jpg";
      const id = dataToUse["id"];
      console.log(name, phoneNumber, language, pictureUrl, id);
      const toAdd: Connection = { name: name, imageUrl: pictureUrl, phoneNumber: phoneNumber, language: language, id: id, clickerId: patientId };
      connectionRequests.push(toAdd);
    }

    changeRequestsTsx((
      <div>
        <h1 className="text-3xl font-bold mb-8">Pending Requests</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {connectionRequests.map((connectionReq, index) => (
            <ConnectionRequest
              key={index}
              name={connectionReq.name}
              phone={connectionReq.phoneNumber}
              imageUrl={connectionReq.imageUrl}
              id={connectionReq.id}
              clickerId={connectionReq.clickerId}
              onStatusChange={onStatusChange}  // Pass the callback
            />
          ))}
        </div>
      </div>
    ));
  };

  const chatDirections = (
    <div className="flex items-center justify-center">
      <div className='grid grid-cols-1'>
        <h1 className="text-3xl font-bold mb-8 flex items-center justify-center" >Describe your situation and find people similar to you</h1>
        <h3 className="flex items-center justify-center">By default we show the top 10 connections based on your EHR data</h3>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex space-x-8">
      <div className="flex-1 space-y-12">
        {chatDirections}
        {connectionsTsx}
        {requestsTsx}
        <div className="pt-12">
          <ChatBox />
        </div>
      </div>
      <div style={{ width: '100px' }}>
        <div className="bg-gray-100 p-4">
          <div className='grid grid-cols-1'>
            <Link href="/patientDashboard/messages">
                My Connections
            </Link>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectionsDirectory;
