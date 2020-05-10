import { NowRequest, NowResponse } from "@now/node";
import JWT from "jsonwebtoken";
import { signInOrSignUp } from "./_utils/db";

interface DecodedToken {
  nickname: string;
  email: string;
}

export default async (req: NowRequest, res: NowResponse) => {
  try {
    const secret = new Buffer(process.env.AUTH0_KEY, "base64").toString();

    const token = req.headers.authorization.replace("Bearer ", "");
    const decodedToken: DecodedToken = JWT.verify(token, secret, {
      issuer: "https://booksyapp.eu.auth0.com/",
      algorithms: ["RS256"],
    }) as DecodedToken;

    const username = decodedToken.nickname;
    const email = decodedToken.email;
    const result = await signInOrSignUp(email, username);

    res.json({ success: true, accessToken: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
