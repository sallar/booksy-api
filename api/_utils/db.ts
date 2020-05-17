import faunadb from "faunadb";

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNA_ADMIN_SECRET,
});

export interface GoogleBook {
  id: string;
  [key: string]: any;
}

const signUp = (email: string, username: string) => {
  return q.Create(q.Collection("users"), {
    data: {
      email,
      username,
    },
  });
};

const signIn = (userRef: faunadb.Expr) => {
  return q.Let(
    {
      userToken: q.Let(
        { userRef },
        q.Do(q.Create(q.Tokens(), { instance: q.Var("userRef") }))
      ),
    },
    q.Do(q.Select(["secret"], q.Var("userToken")))
  );
};

export const signInOrSignUp = (
  email: string,
  username: string
): Promise<string> => {
  return client.query(
    q.If(
      // Condition:
      q.IsEmpty(q.Match(q.Index("users_by_email"), email)),
      // User does not exist:
      q.Let(
        {
          userRef: q.Select(["ref"], signUp(email, username)),
        },
        q.Do(signIn(q.Var("userRef")))
      ),
      // User does exist, sign in:
      q.Let(
        {
          userRef: q.Select(
            ["ref"],
            q.Get(q.Match(q.Index("users_by_email"), email))
          ),
        },
        q.Do(signIn(q.Var("userRef")))
      )
    )
  );
};

const createBook = ({ id, ...data }: GoogleBook) => {
  return q.Create(q.Collection("books"), {
    data: {
      googleBookId: id,
      ...data,
    },
  });
};

export const getOrCreateGoogleBook = (book: GoogleBook) => {
  return client.query(
    q.If(
      q.IsEmpty(q.Match(q.Index("books_by_googleBookId"), book.id)),
      q.Let(
        {
          bookRef: q.Select(["ref"], createBook(book)),
        },
        q.Do(q.Select(["id"], q.Var("bookRef")))
      ),
      q.Let(
        {
          bookRef: q.Select(
            ["ref"],
            q.Get(q.Match(q.Index("books_by_googleBookId"), book.id))
          ),
        },
        q.Do(q.Select(["id"], q.Var("bookRef")))
      )
    )
  );
};
