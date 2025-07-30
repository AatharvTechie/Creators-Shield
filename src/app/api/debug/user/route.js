import connectToDatabase from "@/lib/mongodb";
import Creator from "@/models/Creator.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  
  console.log("🔍 DEBUG USER API CALLED with email:", email);
  
  if (!email) {
    return Response.json({ error: "Missing email parameter" }, { status: 400 });
  }
  
  try {
    await connectToDatabase();
    console.log("✅ Database connected successfully");
    
    // Check if user exists
    const user = await Creator.findOne({ email }).lean();
    console.log("🔍 User found:", !!user);
    
    // Get total user count
    const totalUsers = await Creator.countDocuments();
    console.log("📊 Total users in database:", totalUsers);
    
    // Get all emails for comparison
    const allEmails = await Creator.find({}).select('email name').lean();
    console.log("📋 All emails in database:", allEmails.map(u => ({ email: u.email, name: u.name })));
    
    // Check for case-insensitive match
    const caseInsensitiveUser = await Creator.findOne({ 
      email: { $regex: email, $options: 'i' } 
    }).lean();
    
    return Response.json({
      requestedEmail: email,
      userFound: !!user,
      totalUsers: totalUsers,
      allEmails: allEmails.map(u => u.email),
      caseInsensitiveMatch: !!caseInsensitiveUser,
      caseInsensitiveEmail: caseInsensitiveUser?.email,
      userData: user || null
    });
  } catch (error) {
    console.error("❌ Database error:", error);
    return Response.json({ error: "Database error", details: error.message }, { status: 500 });
  }
} 