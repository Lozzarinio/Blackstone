/**
 * Blackstone Database Schema
 * 
 * This file defines the structure of the Firestore collections
 * and documents used throughout the application.
 * 
 * In Firestore, there's no strict schema enforcement, but
 * this serves as documentation and reference for the expected
 * data structure.
 */

const schema = {
    // Users collection - stores user account information
    users: {
      // Document ID: user's UID from Firebase Auth
      userId: {
        email: "string", // User's email address
        firstName: "string",
        lastName: "string",
        teamName: "string", // Optional
        createdAt: "timestamp",
        updatedAt: "timestamp"
      }
    },
    
    // Tournaments collection - stores tournament information
    tournaments: {
      // Document ID: auto-generated
      tournamentId: {
        name: "string",
        date: "timestamp",
        location: {
            address: "string",     // Street address/house number
            city: "string",        // City/town
            county: "string",      // County (UK) or region
            postcode: "string",    // UK postcode or European postal code
            country: "string",     // Country name
            coordinates: {
              latitude: "number",
              longitude: "number"
          }
        },
        ownerId: "string", // Reference to the user who created the tournament
        ownerEmail: "string",
        description: "string",
        numberOfRounds: "number",
        format: "string", // "WTC", "GW", "UKTC", "Other"
        tournamentPackUrl: "string", // URL to external document
        createdAt: "timestamp",
        updatedAt: "timestamp",
        status: "string" // "upcoming", "inProgress", "completed"
      }
    },
    
    // Participants collection - stores tournament participation information
    participants: {
      // Document ID: auto-generated
      participantId: {
        tournamentId: "string", // Reference to tournament
        userId: "string", // Reference to user
        firstName: "string",
        lastName: "string",
        teamName: "string",
        faction: "string",
        armyList: "string", // Text of the army list
        listStatus: "string", // "submitted", "unsubmitted", "submittedWithErrors"
        participationStatus: "string", // "registered", "checkedIn", "dropped"
        createdAt: "timestamp",
        updatedAt: "timestamp"
      }
    },
    
    // Rounds collection - stores information about tournament rounds
    rounds: {
      // Document ID: auto-generated
      roundId: {
        tournamentId: "string", // Reference to tournament
        roundNumber: "number",
        status: "string", // "pending", "inProgress", "completed"
        startTime: "timestamp",
        endTime: "timestamp",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      }
    },
    
    // Pairings collection - stores pairings for tournament rounds
    pairings: {
      // Document ID: auto-generated
      pairingId: {
        tournamentId: "string", // Reference to tournament
        roundId: "string", // Reference to round
        player1Id: "string", // Reference to participant
        player2Id: "string", // Reference to participant
        tableNumber: "number",
        player1Score: "number", // Battle points for player 1
        player2Score: "number", // Battle points for player 2
        winner: "string", // "player1", "player2", "draw", null
        createdAt: "timestamp",
        updatedAt: "timestamp"
      }
    }
  };
  
  module.exports = schema;