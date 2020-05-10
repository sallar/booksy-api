import faunadb from "faunadb";

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNA_ADMIN_SECRET,
});

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
