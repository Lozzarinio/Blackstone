import { db } from '../firebase/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';

// Tournament Services
export const getTournament = async (tournamentId) => {
  try {
    const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
    if (tournamentDoc.exists()) {
      return { id: tournamentDoc.id, ...tournamentDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching tournament:', error);
    throw error;
  }
};

export const getActiveTournaments = async () => {
  try {
    const tournamentsQuery = query(
      collection(db, 'tournaments'),
      where('status', 'in', ['upcoming', 'inProgress']),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(tournamentsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Add document ID to the returned object
      return {
        id: doc.id,
        ...data,
        // We don't convert the date here, will handle it in the component
      };
    });
  } catch (error) {
    console.error('Error fetching active tournaments:', error);
    throw error;
  }
};

// Participant Services
export const getParticipantProfile = async (userId, tournamentId) => {
  try {
    const participantsQuery = query(
      collection(db, 'participants'),
      where('userId', '==', userId),
      where('tournamentId', '==', tournamentId)
    );
    
    const snapshot = await getDocs(participantsQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  } catch (error) {
    console.error('Error fetching participant profile:', error);
    throw error;
  }
};

export const updateParticipantProfile = async (participantId, profileData) => {
  try {
    await updateDoc(doc(db, 'participants', participantId), {
      ...profileData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating participant profile:', error);
    throw error;
  }
};

export const submitArmyList = async (participantId, armyList) => {
  try {
    await updateDoc(doc(db, 'participants', participantId), {
      armyList,
      listStatus: 'submitted',
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error submitting army list:', error);
    throw error;
  }
};

export const updateParticipationStatus = async (participantId, status) => {
  try {
    await updateDoc(doc(db, 'participants', participantId), {
      participationStatus: status,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating participation status:', error);
    throw error;
  }
};

// Roster Services
export const getTournamentRoster = async (tournamentId) => {
  try {
    const participantsQuery = query(
      collection(db, 'participants'),
      where('tournamentId', '==', tournamentId)
    );
    
    const snapshot = await getDocs(participantsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tournament roster:', error);
    throw error;
  }
};

// Pairings Services
export const getRoundPairings = async (tournamentId, roundNumber) => {
  try {
    // First, get the round document
    const roundsQuery = query(
      collection(db, 'rounds'),
      where('tournamentId', '==', tournamentId),
      where('roundNumber', '==', roundNumber)
    );
    
    const roundSnapshot = await getDocs(roundsQuery);
    
    if (roundSnapshot.empty) {
      return [];
    }
    
    const roundId = roundSnapshot.docs[0].id;
    
    // Then, get the pairings for this round
    const pairingsQuery = query(
      collection(db, 'pairings'),
      where('tournamentId', '==', tournamentId),
      where('roundId', '==', roundId),
      orderBy('tableNumber', 'asc')
    );
    
    const pairingsSnapshot = await getDocs(pairingsQuery);
    
    // Get all the participant IDs from the pairings
    const participantIds = [];
    pairingsSnapshot.docs.forEach(doc => {
      const pairing = doc.data();
      participantIds.push(pairing.player1Id, pairing.player2Id);
    });
    
    // Fetch all participant details in one batch
    const participantsQuery = query(
      collection(db, 'participants'),
      where('id', 'in', participantIds)
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    
    // Create a map of participant IDs to their details
    const participantsMap = {};
    participantsSnapshot.docs.forEach(doc => {
      const participant = doc.data();
      participantsMap[doc.id] = participant;
    });
    
    // Build the pairings with player details
    return pairingsSnapshot.docs.map(doc => {
      const pairing = doc.data();
      return {
        id: doc.id,
        ...pairing,
        player1: participantsMap[pairing.player1Id],
        player2: participantsMap[pairing.player2Id]
      };
    });
  } catch (error) {
    console.error('Error fetching round pairings:', error);
    throw error;
  }
};

// Placings Services
export const getTournamentPlacings = async (tournamentId) => {
  try {
    const participantsQuery = query(
      collection(db, 'participants'),
      where('tournamentId', '==', tournamentId)
    );
    
    const snapshot = await getDocs(participantsQuery);
    
    if (snapshot.empty) {
      return [];
    }
    
    const participants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by number of wins, then by total battle points
    participants.sort((a, b) => {
      // First, sort by number of wins (descending)
      const winsA = a.wins || 0;
      const winsB = b.wins || 0;
      
      if (winsB !== winsA) {
        return winsB - winsA;
      }
      
      // If wins are equal, sort by total battle points (descending)
      const bpA = a.totalBattlePoints || 0;
      const bpB = b.totalBattlePoints || 0;
      
      return bpB - bpA;
    });
    
    // Add rank to each participant
    return participants.map((participant, index) => ({
      ...participant,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error fetching tournament placings:', error);
    throw error;
  }
};

// User Services
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    console.log("Fetching user profile for ID:", userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    console.log("User document exists:", userDoc.exists());
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("User document data:", data);
      return { id: userDoc.id, ...data };
    } else {
      console.log("No user document found");
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUserEvents = async (userId) => {
  try {
    // First, get all participants entries for this user
    const participantsQuery = query(
      collection(db, 'participants'),
      where('userId', '==', userId)
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    
    if (participantsSnapshot.empty) {
      return [];
    }
    
    // Extract tournament IDs
    const tournamentIds = participantsSnapshot.docs.map(doc => doc.data().tournamentId);
    
    // Fetch all these tournaments
    const tournaments = [];
    
    // Firebase doesn't support 'in' queries with more than 10 items, so we'll do it in batches if needed
    const batches = [];
    for (let i = 0; i < tournamentIds.length; i += 10) {
      batches.push(tournamentIds.slice(i, i + 10));
    }
    
    for (const batch of batches) {
      const tournamentsQuery = query(
        collection(db, 'tournaments'),
        where('__name__', 'in', batch)
      );
      
      const tournamentsSnapshot = await getDocs(tournamentsQuery);
      
      tournamentsSnapshot.docs.forEach(doc => {
        tournaments.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    return tournaments;
  } catch (error) {
    console.error('Error fetching user events:', error);
    throw error;
  }
};

export const registerForTournament = async (userId, tournamentId, playerData) => {
  try {
    // Check if the user is already registered for this tournament
    const existingQuery = query(
      collection(db, 'participants'),
      where('userId', '==', userId),
      where('tournamentId', '==', tournamentId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // User is already registered
      return { success: false, message: 'You are already registered for this tournament.' };
    }
    
    // Register the user for the tournament
    const participantRef = await addDoc(collection(db, 'participants'), {
      userId,
      tournamentId,
      ...playerData,
      listStatus: 'unsubmitted',
      participationStatus: 'registered',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { 
      success: true, 
      participantId: participantRef.id,
      message: 'Successfully registered for the tournament!' 
    };
  } catch (error) {
    console.error('Error registering for tournament:', error);
    throw error;
  }
};

// Organiser Services

// Check if a user is an organiser
export const checkIfUserIsOrganiser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().isOrganiser === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking if user is organiser:', error);
    return false;
  }
};

// Make a user an organiser
export const makeUserOrganiser = async (userId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      isOrganiser: true,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error making user an organiser:', error);
    throw error;
  }
};

// Get tournaments created by a specific organiser
export const getUserCreatedTournaments = async (userId) => {
  try {
    const tournamentsQuery = query(
      collection(db, 'tournaments'),
      where('ownerId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(tournamentsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user created tournaments:', error);
    throw error;
  }
};

// Create a new tournament
export const createTournament = async (tournamentData) => {
  try {
    const tournamentRef = await addDoc(collection(db, 'tournaments'), {
      ...tournamentData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return tournamentRef.id;
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
};

// Update an existing tournament
export const updateTournament = async (tournamentId, tournamentData) => {
  try {
    await updateDoc(doc(db, 'tournaments', tournamentId), {
      ...tournamentData,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating tournament:', error);
    throw error;
  }
};

// Update tournament status (upcoming, inProgress, completed)
export const updateTournamentStatus = async (tournamentId, status) => {
  try {
    await updateDoc(doc(db, 'tournaments', tournamentId), {
      status,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating tournament status:', error);
    throw error;
  }
};

// Generate pairings for a round
export const generatePairings = async (tournamentId, roundNumber, pairingMethod = 'random') => {
  try {
    // First, get all checked-in participants
    const participantsQuery = query(
      collection(db, 'participants'),
      where('tournamentId', '==', tournamentId),
      where('participationStatus', '==', 'checkedIn')
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    const participants = participantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (participants.length < 2) {
      throw new Error('Not enough participants to generate pairings');
    }
    
    // Create a round document
    const roundRef = await addDoc(collection(db, 'rounds'), {
      tournamentId,
      roundNumber,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: new Date(),
      endTime: null
    });
    
    // Logic for different pairing methods would go here
    // For now, we'll just implement random pairings
    
    // Shuffle the participants array
    let shuffledParticipants = [...participants];
    for (let i = shuffledParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledParticipants[i], shuffledParticipants[j]] = [shuffledParticipants[j], shuffledParticipants[i]];
    }
    
    // Create pairings
    const pairings = [];
    for (let i = 0; i < shuffledParticipants.length; i += 2) {
      if (i + 1 < shuffledParticipants.length) {
        // Two participants for a pairing
        const pairingRef = await addDoc(collection(db, 'pairings'), {
          tournamentId,
          roundId: roundRef.id,
          player1Id: shuffledParticipants[i].id,
          player2Id: shuffledParticipants[i + 1].id,
          tableNumber: (i / 2) + 1,
          player1Score: null,
          player2Score: null,
          winner: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        pairings.push({
          id: pairingRef.id,
          tableNumber: (i / 2) + 1,
          player1: shuffledParticipants[i],
          player2: shuffledParticipants[i + 1]
        });
      } else {
        // One participant left without a pairing (bye)
        const pairingRef = await addDoc(collection(db, 'pairings'), {
          tournamentId,
          roundId: roundRef.id,
          player1Id: shuffledParticipants[i].id,
          player2Id: null,
          tableNumber: (i / 2) + 1,
          player1Score: null,
          player2Score: null,
          winner: 'player1', // Automatic win for the player with a bye
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        pairings.push({
          id: pairingRef.id,
          tableNumber: (i / 2) + 1,
          player1: shuffledParticipants[i],
          player2: null
        });
      }
    }
    
    // Update round status to inProgress
    await updateDoc(doc(db, 'rounds', roundRef.id), {
      status: 'inProgress',
      updatedAt: new Date()
    });
    
    return pairings;
  } catch (error) {
    console.error('Error generating pairings:', error);
    throw error;
  }
};

// Record match result
export const recordMatchResult = async (pairingId, player1Score, player2Score) => {
  try {
    let winner = null;
    
    if (player1Score > player2Score) {
      winner = 'player1';
    } else if (player2Score > player1Score) {
      winner = 'player2';
    } else {
      winner = 'draw';
    }
    
    await updateDoc(doc(db, 'pairings', pairingId), {
      player1Score,
      player2Score,
      winner,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error recording match result:', error);
    throw error;
  }
};

// Complete a round
export const completeRound = async (roundId) => {
  try {
    await updateDoc(doc(db, 'rounds', roundId), {
      status: 'completed',
      endTime: new Date(),
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error completing round:', error);
    throw error;
  }
};

// Add participant to tournament
export const addParticipant = async (tournamentId, participantData) => {
  try {
    const participantRef = await addDoc(collection(db, 'participants'), {
      tournamentId,
      ...participantData,
      listStatus: 'unsubmitted',
      participationStatus: 'registered',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return participantRef.id;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
};

// Remove participant from tournament
export const removeParticipant = async (participantId) => {
  try {
    await deleteDoc(doc(db, 'participants', participantId));
    return true;
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
};

// Bulk check-in participants
export const checkInAllParticipants = async (tournamentId) => {
  try {
    const participantsQuery = query(
      collection(db, 'participants'),
      where('tournamentId', '==', tournamentId),
      where('participationStatus', '==', 'registered')
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    
    const batch = writeBatch(db);
    participantsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        participationStatus: 'checkedIn',
        updatedAt: new Date()
      });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error checking in all participants:', error);
    throw error;
  }
};