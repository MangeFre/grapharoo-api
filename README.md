# grapharoo-api

The API of the Grapharoo project

## How to run

In this moment, the API can be run in your environment (hopefully). Just follow these steps.

1. Open this in Visual Studio Code.
2. Run NPM install to get all your dependencies.
3. For development, run the npm dev command like so:

```node
npm run dev
```

This will use nodemon to monitor important files and refresh the server if they change.

### How to test

To run the test suite in the "test" folder, first make sure you have the api set up and running.

1. Open a new terminal, leaving the other one open to keep the nodemon process alive.
2. run npm test

```node
npm test
```

The tests right now truly test the API in its full flow, from the request to the response. Therefor, you need a DB set up (the DB the API uses). If you do not have that, some tests will fail.

#### ELI5: Ol' Reddit Switch-a-roo

As the user CedarWolf [wrote in a response](https://www.reddit.com/r/explainlikeimfive/comments/17140d/eli5_ol_reddit_switcharoo/c8186iz?utm_source=share&utm_medium=web2x&context=3), 7 years ago:
'In posts and comment threads on subreddits like [r/pics](https://www.reddit.com/r/pics/), there's an old joke where someone will post a picture of themselves with someone easily recognizable or famous. Then, invariably, someone will reply "Wow, {famous person's name}, I didn't know you were {at location, redditor's username, etc}. But who's that person you met today?"

Basically, the setup assumes that the famous person is the redditor, instead of the redditor meeting someone famous.

Eventually, a guy named [jun2san](www.reddit.com/user/jun2san) started making fun of this joke in his own way. He started saying "Ahhhh, the old reddit switch-a-roo" as a reply to this tired joke and linking back to his own comments each time, thus creating an unbroken chain back to his very first comment.

The chain caught on, as clever things on reddit do, and as more users started doing it themselves, the chain started branching. Some people started messing up the fun by intentionally editing their replies to break the chain, or started linking directly to the last post in the chain. Also, with so many branches, no one really knew which one to link to anymore.

So [PurpleSfinx](https://www.reddit.com/user/PurpleSfinx) created [r/switcharoo](https://www.reddit.com/r/switcharoo/), to keep the chain organized. Each new link in the chain is posted to the subreddit, and then the next link can be linked to the previous piece of the chain. This helps keep the chain organized and it grows day by day, making the journey to the original post even more of a quest.'

##### What does grapharoo do?

Grapharoo aims to provide a way of solving the long chain of links. The API will be used by a dedicated UI to handle queries against the Reddit API, probably with the use of [snoowrap](https://github.com/not-an-aardvark/snoowrap).

To be continued!
