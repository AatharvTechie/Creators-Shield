import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import Creator from '@/models/Creator.js';
import { NextResponse } from 'next/server';

export async function GET(req: any) {
  await connectToDatabase();
  // Get all feedback docs
  const feedbackDocs = await Feedback.find({}).lean();
  // For each feedback, get creator info and flatten feedbacks
  let allFeedbacks = [];
  for (const doc of feedbackDocs) {
    const creator = await Creator.findById.call(Creator, doc.creatorId).lean().exec();
    const creatorName = creator && typeof creator === 'object' && 'name' in creator ? creator.name : '';
    const creatorEmail = creator && typeof creator === 'object' && 'email' in creator ? creator.email : '';
    const avatar = creator && typeof creator === 'object' && 'avatar' in creator ? creator.avatar : '';
    const youtubeChannel = creator && typeof creator === 'object' && 'youtubeChannel' in creator ? creator.youtubeChannel : {};
    const youtubeChannelId = creator && typeof creator === 'object' && 'youtubeChannelId' in creator ? creator.youtubeChannelId : '';

    for (const fb of doc.feedbacks) {
      // Convert all MongoDB objects to plain objects - don't spread the original object
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
        creatorName: creatorName,
        creatorEmail: creatorEmail,
        avatar: avatar,
        youtubeChannel: youtubeChannel,
        youtubeChannelId: youtubeChannelId,
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
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
  return NextResponse.json(allFeedbacks);
} 