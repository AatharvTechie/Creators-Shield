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
  await connectToDatabase();
    console.log("✅ Database connected successfully");
    
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
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}
