/**
 * Script to populate the Firestore database with initial test data
 * 
 * Run with: node scripts/populateDatabase.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount;

try {
  serviceAccount = JSON.parse(serviceAccountJson);
  
  // The private key might need fixing
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key
      .replace(/\\n/g, '\n')
      .replace(/\\\\n/g, '\n'); // Handle double-escaped newlines
  }
} catch (error) {
  console.error('Error parsing service account JSON:', error);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();

// Sample data
const sampleData = {
  tournaments: [
    {
      name: "Warhammer 40K Regional Championship",
      date: admin.firestore.Timestamp.fromDate(new Date("2025-06-15")),
      location: {
        address: "123 Gaming Street",
        city: "London",
        county: "Greater London",
        postcode: "W1 1AA",
        country: "United Kingdom",
        coordinates: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      },
      ownerId: "demo-organizer",
      ownerEmail: "organizer@example.com",
      description: "Join us for the regional Warhammer 40K championship! Bring your best army and compete for glory and prizes.",
      numberOfRounds: 5,
      format: "WTC",
      tournamentPackUrl: "https://example.com/tournament-pack.pdf",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "upcoming"
    },
    {
      name: "Age of Sigmar Open",
      date: admin.firestore.Timestamp.fromDate(new Date("2025-07-22")),
      location: {
        address: "456 Tabletop Avenue",
        city: "Manchester",
        county: "Greater Manchester",
        postcode: "M1 1AA",
        country: "United Kingdom",
        coordinates: {
          latitude: 53.4808,
          longitude: -2.2426
        }
      },
      ownerId: "demo-organizer",
      ownerEmail: "organizer@example.com",
      description: "The biggest Age of Sigmar event in the North! All armies and experience levels welcome.",
      numberOfRounds: 4,
      format: "GW",
      tournamentPackUrl: "https://example.com/aos-pack.pdf",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "upcoming"
    },
    {
      name: "40K Team Tournament",
      date: admin.firestore.Timestamp.fromDate(new Date("2025-05-10")),
      location: {
        address: "789 Wargame Road",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B1 1AA",
        country: "United Kingdom",
        coordinates: {
          latitude: 52.4862,
          longitude: -1.8904
        }
      },
      ownerId: "demo-organizer",
      ownerEmail: "organizer@example.com",
      description: "Form a team of 3 players and compete in this exciting team-based tournament!",
      numberOfRounds: 6,
      format: "UKTC",
      tournamentPackUrl: "https://example.com/team-pack.pdf",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "inProgress"
    }
  ],
  users: [
    {
      id: "demo-player1",
      email: "player1@example.com",
      firstName: "John",
      lastName: "Doe",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: "demo-player2",
      email: "player2@example.com",
      firstName: "Jane",
      lastName: "Smith",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: "demo-organizer",
      email: "organizer@example.com",
      firstName: "Tournament",
      lastName: "Organizer",
      isOrganizer: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  participants: [
    {
      userId: "demo-player1",
      tournamentId: "tournament1", // Will be replaced with actual ID
      firstName: "John",
      lastName: "Doe",
      teamName: "The Space Marines",
      faction: "Adeptus Astartes",
      armyList: "HQ: Captain with power sword and bolt pistol\nTroops: 5x Intercessors with auto bolt rifles\nTroops: 5x Intercessors with auto bolt rifles\nElites: Redemptor Dreadnought with macro plasma incinerator",
      listStatus: "submitted",
      participationStatus: "checkedIn",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      userId: "demo-player2",
      tournamentId: "tournament1", // Will be replaced with actual ID
      firstName: "Jane",
      lastName: "Smith",
      teamName: "Eldar Craftworld",
      faction: "Aeldari",
      armyList: "HQ: Farseer with singing spear\nTroops: 10x Guardians with shuriken catapults\nTroops: 5x Rangers with ranger long rifles\nFast Attack: 5x Swooping Hawks with lasblasters",
      listStatus: "submitted",
      participationStatus: "checkedIn",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ]
};

// Function to add collections to Firestore
async function populateDatabase() {
  try {
    console.log('Starting database population...');
    
    // Add tournaments
    console.log('Adding tournaments...');
    const tournamentIds = {};
    
    for (const [index, tournament] of sampleData.tournaments.entries()) {
      const tournamentRef = db.collection('tournaments').doc();
      await tournamentRef.set(tournament);
      tournamentIds[`tournament${index + 1}`] = tournamentRef.id;
      console.log(`Added tournament: ${tournament.name} with ID: ${tournamentRef.id}`);
    }
    
    // Add users
    console.log('Adding users...');
    for (const user of sampleData.users) {
      const userId = user.id;
      const userData = { ...user };
      delete userData.id; // Remove id from the data object
      
      await db.collection('users').doc(userId).set(userData);
      console.log(`Added user: ${user.firstName} ${user.lastName} with ID: ${userId}`);
    }
    
    // Add participants
    console.log('Adding participants...');
    for (const participant of sampleData.participants) {
      // Replace the placeholder tournamentId with the actual ID
      const tournamentId = tournamentIds[participant.tournamentId];
      const participantData = {
        ...participant,
        tournamentId
      };
      
      const participantRef = db.collection('participants').doc();
      await participantRef.set(participantData);
      console.log(`Added participant: ${participant.firstName} ${participant.lastName} for tournament: ${tournamentId}`);
    }
    
    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Run the population function
populateDatabase().then(() => {
  console.log('Script execution completed.');
  process.exit(0);
}).catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});