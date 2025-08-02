import connectToDatabase from "@/lib/mongodb";
import Creator from "@/models/Creator";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  
  console.log("🔍 GET-USER API CALLED with email:", email);
  
  if (!email) {
    console.log("❌ Missing email parameter");
    return Response.json({ error: "Missing email" }, { status: 400 });
  }
  
  try {
    console.log("🔌 Attempting to connect to database...");
    await connectToDatabase();
    console.log("✅ Database connected successfully");
    
    console.log("🔍 Querying database for user...");
    const user = await Creator.findOne({ email }).lean();
    console.log("🔍 Database query result:", user ? "User found" : "User not found");
    
    if (!user) {
      console.log("❌ User not found in database for email:", email);
      
      // Let's also check if there are any users in the database
      const totalUsers = await Creator.countDocuments();
      console.log("📊 Total users in database:", totalUsers);
      
      // Check for similar emails (case insensitive)
      const similarUsers = await Creator.find({ 
        email: { $regex: email, $options: 'i' } 
      }).select('email').lean();
      console.log("🔍 Similar emails found:", similarUsers.map(u => u.email));
      
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log("✅ User found:", {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan
    });
    
    return Response.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      youtubeChannelId: user.youtubeChannelId,
      youtubeChannel: user.youtubeChannel,
      disconnectApproved: user.disconnectApproved,
      plan: user.plan,
      planExpiry: user.planExpiry
    });
  } catch (error) {
    console.error("❌ Database error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return Response.json({ 
          error: "Database connection failed" 
        }, { status: 500 });
      }
      if (error.message.includes('MongoNetworkError')) {
        return Response.json({ 
          error: "Database network error" 
        }, { status: 500 });
      }
      if (error.message.includes('MongoServerSelectionError')) {
        return Response.json({ 
          error: "Database server selection error" 
        }, { status: 500 });
      }
    }
    
    return Response.json({ 
      error: "Database error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
