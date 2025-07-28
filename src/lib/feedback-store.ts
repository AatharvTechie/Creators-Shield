
'use server';
import type { Feedback, FeedbackReply } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import connectToDatabase from './mongodb';
import Creator from '../models/Creator.js';
import mongoose from 'mongoose';

// Remove mockFeedback and all in-memory logic

export async function approveDisconnectForCreator(creatorId: string) {
  // Set disconnectApproved to true for this creator
  await Creator.updateOne({ _id: creatorId }, { $set: { disconnectApproved: true } });
}

export async function isDisconnectApproved(creatorId: string): Promise<boolean> {
  // TODO: Implement this with real DB if needed
  return false;
}

function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }
  return '';
}

export async function getAllFeedback(): Promise<any[]> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/feedback/list`);
  if (!res.ok) throw new Error('Failed to fetch feedback');
  return await res.json();
}

export async function getFeedbackForUser(creatorEmail: string): Promise<any[]> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/feedback/list?email=${encodeURIComponent(creatorEmail)}`);
  if (!res.ok) throw new Error('Failed to fetch feedback for user');
  return await res.json();
}

export async function addFeedback(data: any): Promise<any> {
  const baseUrl = getApiBaseUrl();
  console.log('addFeedback - Sending request:', data);
  
  const res = await fetch(`${baseUrl}/api/feedback/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('addFeedback - API error:', errorText);
    throw new Error(`Failed to submit feedback: ${errorText}`);
  }
  
  const result = await res.json();
  console.log('addFeedback - API response:', result);
  return result;
}

export async function addReplyToFeedback(feedbackId: string, reply: Omit<FeedbackReply, 'replyId' | 'timestamp'>, creatorId?: string): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const requestBody = { 
    feedbackId, 
    message: reply.message,
    creatorId: creatorId
  };
  console.log('addReplyToFeedback - Sending request:', requestBody);
  
  const res = await fetch(`${baseUrl}/api/feedback/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('addReplyToFeedback - API error:', errorText);
    throw new Error('Failed to reply to feedback');
  }
  const result = await res.json();
  console.log('addReplyToFeedback - API response:', result);
  return result;
}

export async function markFeedbackAsRead(feedbackId: string, creatorId?: string): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const requestBody = { feedbackId, creatorId };
  console.log('markFeedbackAsRead - Sending request:', requestBody);
  
  const res = await fetch(`${baseUrl}/api/feedback/mark-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('markFeedbackAsRead - API error:', errorText);
    throw new Error('Failed to mark feedback as read');
  }
  const result = await res.json();
  console.log('markFeedbackAsRead - API response:', result);
  return result;
}

export async function hasUnreadCreatorFeedback(email: string): Promise<boolean> {
  const docs = await getFeedbackForUser(email);
  if (!Array.isArray(docs) || docs.length === 0) return false;
  const feedbacks = docs[0].feedbacks || [];
  // Update this logic as per your feedback object structure
  // If you want to check for unread, you can add a field like isRead in feedback object
  // For now, just check if there is at least one feedback
  return feedbacks.length > 0;
}

export async function hasUnrepliedAdminFeedback(): Promise<boolean> {
  const feedbacks = await getAllFeedback();
  if (!Array.isArray(feedbacks)) return false;
  const hasUnreplied = feedbacks.some(f => f.response && f.response.length === 0);
  return hasUnreplied;
}

export async function getAllFeedbackFromDb(): Promise<any[]> {
  await connectToDatabase();
  // Get all feedback docs
  const feedbackDocs = await (await import('../models/Feedback.js')).default.find({}).lean();
  // For each feedback, get creator info and flatten feedbacks
  let allFeedbacks = [];
  for (const doc of feedbackDocs) {
    const creator = await Creator.findById.call(Creator, doc.creatorId).lean();
    for (const fb of doc.feedbacks) {
      const plainFeedback = {
        // Explicitly define each field to avoid MongoDB ObjectId issues
        title: typeof fb.title === 'string' ? fb.title : '',
        rating: typeof fb.rating === 'number' ? fb.rating : 0,
        tags: typeof fb.tags === 'string' ? fb.tags : '',
        description: typeof fb.description === 'string' ? fb.description : '',
        message: typeof fb.message === 'string' ? fb.message : '',
        type: typeof fb.type === 'string' ? fb.type : '',
        _id: fb._id && typeof fb._id === 'object' && fb._id.toString ? fb._id.toString() : (typeof fb._id === 'string' ? fb._id : ''),
        createdAt: fb.createdAt ? (typeof fb.createdAt === 'string' ? fb.createdAt : (fb.createdAt instanceof Date ? fb.createdAt.toISOString() : '')) : '',
        creatorId: doc.creatorId && typeof doc.creatorId === 'object' && doc.creatorId.toString ? doc.creatorId.toString() : (typeof doc.creatorId === 'string' ? doc.creatorId : ''),
        creatorName: creator && typeof creator === 'object' && 'name' in creator ? creator.name : '',
        creatorEmail: creator && typeof creator === 'object' && 'email' in creator ? creator.email : '',
        avatar: creator && typeof creator === 'object' && 'avatar' in creator ? creator.avatar : '',
        youtubeChannel: creator && typeof creator === 'object' && 'youtubeChannel' in creator ? creator.youtubeChannel : {},
        youtubeChannelId: creator && typeof creator === 'object' && 'youtubeChannelId' in creator ? creator.youtubeChannelId : '',
        // Convert reply object if it exists
        reply: fb.reply ? {
          message: fb.reply.message || '',
          repliedAt: fb.reply.repliedAt ? (typeof fb.reply.repliedAt === 'string' ? fb.reply.repliedAt : (fb.reply.repliedAt instanceof Date ? fb.reply.repliedAt.toISOString() : '')) : '',
        } : null,
        // Convert status and creatorRead to plain values
        status: typeof fb.status === 'string' ? fb.status : '',
        creatorRead: typeof fb.creatorRead === 'boolean' ? fb.creatorRead : false,
      };
      
      // Ensure all values are plain objects/strings/numbers
      const sanitizedFeedback = JSON.parse(JSON.stringify(plainFeedback));
      allFeedbacks.push(sanitizedFeedback);
    }
  }
  // Sort by createdAt descending
  allFeedbacks.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  return allFeedbacks;
}
