import connectToDatabase from './mongodb';
import Creator from '../models/Creator.js';
import Reactivation from '../models/Reactivation.js';
import type { User } from './types';
import { sendAccountReactivationEmail } from './services/backend-services';

export async function getAllUsers(): Promise<User[]> {
  await connectToDatabase();
  // @ts-ignore
  const creators = await Creator.find({}).lean();
  return creators.map((creator: any) => ({
    id: creator._id.toString(),
    uid: creator._id.toString(),
    name: creator.name,
    displayName: creator.displayName || creator.name, // Use updated displayName if available
    email: creator.email,
    image: creator.avatar || null,
    role: 'creator',
    joinDate: creator.createdAt ? new Date(creator.createdAt).toISOString() : '',
    platformsConnected: creator.youtubeChannel ? ['youtube'] : [],
    youtubeChannelId: creator.youtubeChannel?.id,
    status: creator.status || 'active',
    avatar: creator.avatar,
    legalFullName: undefined,
    address: undefined,
    phone: undefined,
    accessToken: undefined,
    youtubeChannel: creator.youtubeChannel,
  }));
}

export async function getUserByEmail(email: string) {
  await connectToDatabase();
  // @ts-ignore
  const user = await Creator.findOne({ email }); // Remove .lean() to return full doc with _id
  console.log('getUserByEmail result:', { email, hasUser: !!user, youtubeChannelId: user?.youtubeChannelId, hasYouTubeChannel: !!user?.youtubeChannel });
  return user;
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended' | 'deactivated') {
  await connectToDatabase();
  
  console.log('🔄 updateUserStatus called:', { userId, status });
  
  const updateData: any = { status };
  
  // If suspending, add timestamp. If activating, remove timestamp
  if (status === 'suspended') {
    updateData.suspensionTimestamp = new Date();
  } else if (status === 'active') {
    updateData.suspensionTimestamp = null;
  }
  
  // If deactivating, add timestamp. If activating, remove timestamp
  if (status === 'deactivated') {
    updateData.deactivationTimestamp = new Date();
  } else if (status === 'active') {
    updateData.deactivationTimestamp = null;
  }
  
  console.log('📝 Update data:', updateData);
  
  // @ts-ignore
  const result = await Creator.updateOne({ _id: userId }, { $set: updateData });
  console.log('📊 Database update result:', result);
  
  return result;
}

export async function checkSuspensionStatus(userId: string) {
  await connectToDatabase();
  // @ts-ignore
  const creator = await Creator.findById(userId);
  
  console.log('🔍 Checking suspension status for user:', {
    id: creator?._id.toString(),
    name: creator?.name,
    email: creator?.email,
    status: creator?.status,
    suspensionTimestamp: creator?.suspensionTimestamp
  });
  
  if (!creator || creator.status !== 'suspended') {
    console.log('❌ User not suspended:', {
      exists: !!creator,
      status: creator?.status
    });
    return { isSuspended: false, timeRemaining: null };
  }
  
  if (!creator.suspensionTimestamp) {
    console.log('⚠️ User suspended but no timestamp');
    return { isSuspended: true, timeRemaining: null };
  }
  
  const suspensionTime = new Date(creator.suspensionTimestamp);
  const currentTime = new Date();
  const timeDiff = suspensionTime.getTime() + (24 * 60 * 60 * 1000) - currentTime.getTime(); // 24 hours
  
  console.log('⏰ Suspension time calculation:', {
    suspensionTime: suspensionTime.toISOString(),
    currentTime: currentTime.toISOString(),
    timeDiff: timeDiff,
    timeDiffHours: Math.floor(timeDiff / (1000 * 60 * 60))
  });
  
  if (timeDiff <= 0) {
    // Suspension has expired, automatically reactivate and send email
    console.log('✅ Suspension expired, automatically reactivating user');
    await updateUserStatus(userId, 'active');
    
    // Send reactivation email
    try {
      await sendAccountReactivationEmail({
        to: creator.email,
        creatorName: creator.displayName || creator.name || 'Creator',
        reactivationTime: new Date().toLocaleString()
      });
      console.log('✅ Reactivation email sent to:', creator.email);
    } catch (emailError) {
      console.error('❌ Failed to send reactivation email:', emailError);
    }
    
    return { isSuspended: false, timeRemaining: null };
  }
  
  console.log('✅ User is suspended and countdown is active');
  return { 
    isSuspended: true, 
    timeRemaining: timeDiff 
  };
}

export async function checkDeactivationStatus(userId: string) {
  await connectToDatabase();
  // @ts-ignore
  const creator = await Creator.findById(userId);
  
  if (!creator || creator.status !== 'deactivated') {
    return { isDeactivated: false };
  }
  
  return { 
    isDeactivated: true,
    hasReactivationRequest: !!creator.reactivationRequest?.requestedAt,
    reactivationStatus: creator.reactivationRequest?.status || 'none'
  };
}

export async function submitReactivationRequest(userId: string, reason: string, explanation: string, req?: Request) {
  await connectToDatabase();
  
  console.log('📝 Submitting reactivation request:', { userId, reason, explanation });
  
  // First, let's check if the user exists and is deactivated
  console.log('🔍 Looking for user with ID:', userId);
  console.log('🔍 User ID type:', typeof userId);
  
  // Try to find user by ID
  // @ts-ignore
  let existingUser = await Creator.findById(userId);
  
  if (!existingUser) {
    console.log('🔍 User not found by ID, trying alternative methods...');
    
    // Try to find user by email from JWT token
    try {
      // Get token from request headers
      const authHeader = req?.headers?.authorization;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.email;
        console.log('🔍 Trying to find user by email from token:', userEmail);
        
        // @ts-ignore
        existingUser = await Creator.findOne({ email: userEmail });
        if (existingUser) {
          console.log('✅ User found by email:', {
            id: existingUser._id.toString(),
            name: existingUser.name,
            email: existingUser.email,
            status: existingUser.status,
          });
          // Update userId to the correct one
          userId = existingUser._id.toString();
        }
      }
    } catch (tokenError) {
      console.error('❌ Error parsing token:', tokenError);
    }
  }
  
  console.log('🔍 Final user check:', existingUser ? {
    id: existingUser._id.toString(),
    name: existingUser.name,
    email: existingUser.email,
    status: existingUser.status,
  } : 'User not found');
  
  if (!existingUser) {
    throw new Error('User not found');
  }
  
  if (existingUser.status !== 'deactivated') {
    throw new Error('User is not deactivated');
  }
  
  // Check if user already has a pending reactivation request
  // @ts-ignore
  const existingRequest = await Reactivation.findOne({
    creatorId: userId,
    status: 'pending'
  });
  
  if (existingRequest) {
    console.log('⚠️ User already has a pending reactivation request');
    throw new Error('You already have a pending reactivation request');
  }
  
  // Create new reactivation request in separate collection
  const reactivationRequest = new Reactivation({
    creatorId: userId,
    displayName: existingUser.name,
    email: existingUser.email,
    avatar: existingUser.avatar,
    requestDate: new Date(),
    status: 'pending',
    reason: reason,
    explanation: explanation
  });
  
  console.log('📋 Reactivation request data to save:', {
    creatorId: reactivationRequest.creatorId,
    displayName: reactivationRequest.displayName,
    email: reactivationRequest.email,
    requestDate: reactivationRequest.requestDate,
    status: reactivationRequest.status,
    reason: reactivationRequest.reason,
    explanation: reactivationRequest.explanation
  });
  
  try {
    // @ts-ignore
    const result = await reactivationRequest.save();
    
    console.log('📊 Database save result:', result);
    
    // Also update the Creator model to mark that user has a reactivation request
    // @ts-ignore
    await Creator.updateOne(
      { _id: userId },
      { 
        $set: { 
          reactivationRequest: {
            requestedAt: new Date(),
            reason: reason,
            explanation: explanation,
            status: 'pending'
          }
        }
      }
    );
    
    console.log('✅ Reactivation request saved successfully');
    
    return result;
  } catch (dbError) {
    console.error('❌ Database error while saving reactivation request:', dbError);
    throw new Error('Failed to save reactivation request to database. Please try again.');
  }
}

export async function updateReactivationStatus(userId: string, status: 'approved' | 'rejected') {
  await connectToDatabase();
  
  console.log('🔄 Updating reactivation status:', { userId, status });
  
  // First, let's check the current state of the user
  // @ts-ignore
  const currentUser = await Creator.findById(userId);
  console.log('🔍 Current user state:', {
    id: currentUser._id.toString(),
    name: currentUser.name,
    email: currentUser.email,
    status: currentUser.status,
    approvalTimestamp: currentUser.approvalTimestamp,
    reactivationRequest: currentUser.reactivationRequest
  });
  
  // Update the Reactivation collection
  // @ts-ignore
  const reactivationResult = await Reactivation.updateOne(
    { creatorId: userId, status: 'pending' },
    { $set: { status } }
  );
  
  console.log('📊 Reactivation update result:', reactivationResult);
  
  // Update the Creator model
  const updateData: any = {
    'reactivationRequest.status': status
  };
  
  if (status === 'approved') {
    // Don't immediately activate, set approval timestamp for 24-hour countdown
    updateData.approvalTimestamp = new Date();
    // Keep status as deactivated for now
    console.log('✅ Setting approval timestamp:', updateData.approvalTimestamp);
  } else if (status === 'rejected') {
    updateData.approvalTimestamp = null;
    console.log('❌ Clearing approval timestamp');
  }
  
  // @ts-ignore
  const creatorResult = await Creator.updateOne({ _id: userId }, { $set: updateData });
  
  console.log('📊 Creator update result:', creatorResult);
  
  // Verify the update
  // @ts-ignore
  const updatedUser = await Creator.findById(userId);
  console.log('✅ Updated user state:', {
    id: updatedUser._id.toString(),
    name: updatedUser.name,
    email: updatedUser.email,
    status: updatedUser.status,
    approvalTimestamp: updatedUser.approvalTimestamp,
    reactivationRequest: updatedUser.reactivationRequest
  });
  
  return { reactivationResult, creatorResult };
}

export async function checkApprovalStatus(userId: string) {
  await connectToDatabase();
  // @ts-ignore
  const creator = await Creator.findById(userId);
  
  console.log('🔍 Checking approval status for user:', {
    id: creator?._id.toString(),
    name: creator?.name,
    email: creator?.email,
    status: creator?.status,
    approvalTimestamp: creator?.approvalTimestamp,
    reactivationRequest: creator?.reactivationRequest
  });
  
  if (!creator || creator.status !== 'deactivated' || !creator.approvalTimestamp) {
    console.log('❌ User not eligible for approval check:', {
      exists: !!creator,
      status: creator?.status,
      hasApprovalTimestamp: !!creator?.approvalTimestamp
    });
    return { isApproved: false, timeRemaining: null };
  }
  
  const approvalTime = new Date(creator.approvalTimestamp);
  const currentTime = new Date();
  const timeDiff = approvalTime.getTime() + (24 * 60 * 60 * 1000) - currentTime.getTime(); // 24 hours
  
  console.log('⏰ Time calculation:', {
    approvalTime: approvalTime.toISOString(),
    currentTime: currentTime.toISOString(),
    timeDiff: timeDiff,
    timeDiffHours: Math.floor(timeDiff / (1000 * 60 * 60))
  });
  
  if (timeDiff <= 0) {
    // 24 hours have passed, automatically reactivate
    console.log('✅ 24 hours passed, automatically reactivating user');
    await updateUserStatus(userId, 'active');
    return { isApproved: false, timeRemaining: null };
  }
  
  console.log('✅ User is approved and countdown is active');
  return { 
    isApproved: true, 
    timeRemaining: timeDiff 
  };
}

export async function getReactivationRequests() {
  await connectToDatabase();
  
  console.log('🔍 Fetching reactivation requests from Reactivation collection');
  
  // Get all pending reactivation requests from Reactivation collection
  // @ts-ignore
  const reactivationRequests = await Reactivation.find({ status: 'pending' }).lean();
  
  console.log('🔍 Found reactivation requests:', reactivationRequests.length);
  reactivationRequests.forEach((request: any, index: number) => {
    console.log(`📝 Reactivation Request ${index + 1}:`, {
      id: request._id.toString(),
      creatorId: request.creatorId.toString(),
      displayName: request.displayName,
      email: request.email,
      requestDate: request.requestDate,
      reason: request.reason,
      explanation: request.explanation,
      status: request.status
    });
  });
  
  return reactivationRequests.map((request: any) => ({
    id: request._id.toString(),
    name: request.displayName,
    email: request.email,
    requestedAt: request.requestDate ? 
      new Date(request.requestDate).toISOString() : 
      new Date().toISOString(),
    reason: request.reason || 'No reason provided',
    explanation: request.explanation || 'No explanation provided',
    creatorId: request.creatorId.toString()
  }));
}

export async function updateUser(userId: string, update: Partial<any>) {
  console.log('🔄 updateUser called with:', { userId, update });
  await connectToDatabase();
  // @ts-ignore
  const result = await Creator.updateOne({ _id: userId }, { $set: update });
  console.log('📝 Database update result:', result);
  return result;
}

export async function updateUserWithUnset(userId: string, unsetFields: string[], setFields: Partial<any> = {}) {
  await connectToDatabase();
  const unsetObj: Record<string, string> = {};
  unsetFields.forEach(field => { unsetObj[field] = ""; });
  // @ts-ignore
  return Creator.updateOne({ _id: userId }, { $unset: unsetObj, $set: setFields });
}

export async function getUserById(userId: string) {
  await connectToDatabase();
  // Check if userId is a valid ObjectId
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return undefined;
  }
  // @ts-ignore
  const creator = await Creator.findById(userId).lean();
  
  if (!creator) return undefined;
  
  return {
    id: creator._id.toString(),
    uid: creator._id.toString(),
    name: creator.name,
    displayName: creator.name,
    email: creator.email,
    image: creator.avatar || null,
    role: 'creator',
    joinDate: creator.createdAt ? new Date(creator.createdAt).toISOString() : '',
    platformsConnected: creator.youtubeChannel ? ['youtube'] : [],
    youtubeChannelId: creator.youtubeChannel?.id,
    status: creator.status || 'active',
    avatar: creator.avatar,
    legalFullName: undefined,
    address: undefined,
    phone: undefined,
    accessToken: undefined,
    youtubeChannel: creator.youtubeChannel,
  };
} 