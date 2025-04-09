## How To Use Our Website

To build a local working version of the site, first clone the code from our GitHub repository: https://github.com/neu-cs4530/spring25-team-project-spring25-project-group-109. If you do not already have npm and node.js installed on your computer, you can follow this tutorial: https://neu-se.github.io/CS4530-Spring-2025/tutorials/week1-getting-started. You will also need to install MongoDB, because this is how we store data for our website. The instructions to download the community edition are here: https://www.mongodb.com/docs/manual/administration/install-community/. Choose the correct version for your system and follow the instructions, including installing MongoDB Compass. For mac, once you open Compass, click on “add new connection” in the left sidebar, make sure the URI field contains mongodb://localhost:27017, and click on “Connect”.  For windows, in the Package dropdown, select msi. Then download and run the installer. Select the “Install MongoDB as a Service” checkbox and install. This will start MongoDB as a background service. Install “MongoDB Compass” if prompted. Verify if the MongoDB server is running using the Windows Services app. MongoDB should be started as part of the installation process, showing a connection to mongodb://localhost:27017. Going back to the cloned code, open a terminal window and navigate to the root directory of the repo. Then, install the dependencies for each directory by running the following commands cd client/, npm install, cd ../server, npm install. Next, you will need to set up the environment variables. Create a file called .env in ./client and add the following line: REACT_APP_SERVER_URL=http://localhost:8000. Then, create a file .env in ./server and add these three lines: MONGODB_URI=mongodb://127.0.0.1:27017, CLIENT_URL=http://localhost:3000, and PORT=8000. Finally, we will populate the database. In the server directory run npm run populate-db to populate the fake_so database with example data that follows the schema definition. If you want to delete all the data at any point, you can use npm run delete-db to delete all entries in the fake_so database. To start running the code run npm run start in both the server and client directories. The client will start a client on port 3000 and the server will take HTTP requests on https://localhost:8000, and execute them on the running database instance. You can send requests to the server using a tool like Postman. Tests can be run with cd server && npm run test. If you want to view the live site, it is deployed at cs4530-s25-109.onrender.com and the backend api is deployed at spring25-team-project-spring25-project.onrender.com. Click on the backend api link and wait for “hello world” to display on the screen; you should then be able to interact with the deployed site.

## Codebase Folder Structure

- `client`: Contains the frontend application code, responsible for the user interface and interacting with the backend. This directory includes all React components and related assets.
- `server`: Contains the backend application code, handling the logic, APIs, and database interactions. It serves requests from the client and processes data accordingly.
- `shared`: Contains all shared type definitions that are used by both the client and server. This helps maintain consistency and reduces duplication of code between the two folders. The type definitions are imported and shared within each folder's `types/types.ts` file.

## Database Architecture

The schemas for the database are documented in the directory `server/models/schema`.
A class diagram for the schema definition is shown below:

## Class Diagram
<img width="1420" alt="image" src="https://github.com/user-attachments/assets/02693c03-4bd2-4799-91b7-ccbf849e1174" />


## API Routes

### `/answer`

| Endpoint   | Method | Description      |
| ---------- | ------ | ---------------- |
| /addAnswer | POST   | Add a new answer |

### `/comment`

| Endpoint    | Method | Description       |
| ----------- | ------ | ----------------- |
| /addComment | POST   | Add a new comment |

### `/messaging`

| Endpoint     | Method | Description           |
| ------------ | ------ | --------------------- |
| /addMessage  | POST   | Add a new message     |
| /getMessages | GET    | Retrieve all messages |

### `/question`

| Endpoint          | Method | Description                     |
| ----------------- | ------ | ------------------------------- |
| /getQuestion      | GET    | Fetch questions by filter       |
| /getQuestionById/ | GET    | Fetch a specific question by ID |
| /addQuestion      | POST   | Add a new question              |
| /upvoteQuestion   | POST   | Upvote a question               |
| /downvoteQuestion | POST   | Downvote a question             |

### `/tag`

| Endpoint                            | Method | Description                                                  |
| ----------------------------------- | ------ | ------------------------------------------------------------ |
| /getTagsWithQuestionNumber          | GET    | Fetch tags along with the number of questions                |
| /getTagByName/                      | GET    | Fetch a specific tag by name                                 |
| /getMostRecentQuestionTags/:askedBy | GET    | Get the tags of the most recent question posted by this user |

### `/user`

| Endpoint            | Method | Description                           |
| ------------------- | ------ | ------------------------------------- |
| /signup             | POST   | Create a new user account             |
| /login              | POST   | Log in as a user                      |
| /resetPassword      | PATCH  | Reset user password                   |
| /getUser/           | GET    | Fetch user details by username        |
| /getUsers           | GET    | Fetch all users                       |
| /deleteUser/        | DELETE | Delete a user by username             |
| /updateBiography    | PATCH  | Update user biography                 |
| /updateProfilePhoto | PATCH  | Update user profile photo             |
| /uploadProfilePhoto | POST   | Upload a custom profile photo         |
| /follow             | PATCH  | Update user's following (add item)    |
| /unfollow           | PATCH  | Update user's following (remove item) |

### `/chat`

| Endpoint                    | Method | Description                                                                 |
| --------------------------- | ------ | --------------------------------------------------------------------------- |
| `/createChat`               | POST   | Create a new chat.                                                          |
| `/:chatId/addMessage`       | POST   | Add a new message to an existing chat.                                      |
| `/:chatId`                  | GET    | Retrieve a chat by its ID, optionally populating participants and messages. |
| `/:chatId/addParticipant`   | POST   | Add a new participant to an existing chat.                                  |
| `/getChatsByUser/:username` | GET    | Retrieve all chats for a specific user based on their username.             |

### `/games`

| Endpoint | Method | Description           |
| -------- | ------ | --------------------- |
| /create  | POST   | Create a new game     |
| /join    | POST   | Join an existing game |
| /leave   | POST   | Leave a game          |
| /games   | GET    | Retrieve all games    |

### `/store`

| Endpoint                  | Method | Description                 |
| ------------------------- | ------ | --------------------------- |
| /createStore              | POST   | Create a store object       |
| /getStoreByUser/:username | GET    | Get a user's store data     |
| /unlockFeature            | POST   | Unlock a feature with coins |

### `/badge`

| Endpoint                | Method | Description                                  |
| ----------------------- | ------ | -------------------------------------------- |
| /addBadge               | POST   | Create a new badge                           |
| /getBadges              | GET    | Gets all badges                              |
| /updateBadges:/username | PATCH  | updated badges for user based on their stats |

### `/collection`

| Endpoint                        | Method | Description                                                          |
| ------------------------------- | ------ | -------------------------------------------------------------------- |
| /createCollection               | POST   | Create a new collection                                              |
| /getCollectionsByUser/:username | GET    | Retrieve all collections for a specific user based on their username |

### `/features`

| Endpoint     | Method | Description       |
| ------------ | ------ | ----------------- |
| /getFeatures | GET    | Gets all features |

### `/notification `

| Endpoint                    | Method | Description                                      |
| --------------------------- | ------ | ------------------------------------------------ |
| /createNotification         | POST   | Create a new notification                        |
| /getNotifications/:username | GET    | Gets all notifications for user                  |
| /toggleSeen/:id             | PATCH  | Toggle the seen status of the given notification |

### `/videos`

| Endpoint                   | Method | Description                |
| -------------------------- | ------ | -------------------------- |
| /getYoutubeVideos/:askedBy | GET    | Get YouTube videos by user |

### `/feed`

| Endpoint                      | Method | Description                 |
| ------------------------------| ------ | --------------------------- |
| /getRecommendedFeed/:username | GET    | Get recommended feed by user|
