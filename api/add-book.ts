import { NowRequest, NowResponse } from "@now/node";
import { getOrCreateGoogleBook, GoogleBook } from "./_utils/db";

export default async (req: NowRequest, res: NowResponse) => {
  try {
    const book: GoogleBook = req.body;
    const id = await getOrCreateGoogleBook(book);

    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
