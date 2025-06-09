import { SignJWT, jwtVerify } from "jose"

// Secret key for JWT signing and verification
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "your-super-secret-jwt-key-here-make-it-long-and-secure"
  return new TextEncoder().encode(secret)
}

// Generate access token
export async function generateTokens(user) {
  try {
    console.log("Generating token for user:", user._id.toString())

    const accessToken = await new SignJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      instagramUsername: user.instagramUsername,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") // 7 days expiration
      .sign(getJwtSecretKey())

    console.log("Token generated successfully:", accessToken.substring(0, 20) + "...")
    return { accessToken }
  } catch (error) {
    console.error("Token generation error:", error)
    throw new Error("Failed to generate authentication tokens")
  }
}

// Verify token - returns payload directly
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey())
    console.log("Token verified successfully:", payload)
    return payload
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}
