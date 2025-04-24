# Google Meet Clone

A real-time video chat application built using WebRTC, WebSockets, and React.

## Overview

This project is a simplified clone of Google Meet, allowing users to create and join video calls. It implements peer-to-peer video calling using WebRTC technology with WebSocket signaling.

## Features

- Create and join video meetings with a unique meeting ID
- Real-time video and audio communication
- Camera selection (switch between available cameras)
- Responsive design for desktop and mobile devices
- End call functionality

## Technologies Used

### Frontend (web)
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Vite as the build tool

### Backend
- Node.js with TypeScript
- WebSockets for signaling
- HTTPS server for secure connections

## Technical Approach

### WebRTC Implementation

The application uses a peer-to-peer connection model with WebRTC:

1. **Signaling Process**:
   - When a user creates a meeting, they become the "sender"
   - When another user joins with the meeting ID, they become the "receiver"
   - WebSockets are used for the signaling process to exchange SDP offers/answers and ICE candidates

2. **Media Handling**:
   - `getUserMedia` API is used to access the user's camera and microphone
   - Users can select from available video input devices
   - Video streams are displayed using HTML5 video elements

3. **Connection Establishment**:
   - ICE candidates are exchanged via WebSockets for NAT traversal
   - SDP offers and answers are exchanged to establish media capabilities

### Component Structure

- `WebsocketContext`: Provides WebSocket connection to components
- `CallPage`: Manages the video call interface and WebRTC connection
- `HomePage`: Handles meeting creation and joining
- `webRTCUtils`: Contains utility functions for WebRTC operations

## Running the Project

1. Clone the repository
2. Install dependencies:
   ```
   # Backend
   cd backend
   npm install

   # Frontend
   cd web
   npm install
   ```

3. Start the backend server:
   ```
   cd backend
   npm start
   ```

4. Start the frontend development server:
   ```
   cd web
   npm run dev
   ```

5. Access the application at `https://localhost:5173`

## Security Considerations

- The application uses HTTPS for secure connections
- Self-signed certificates for development 
- No persistence of meeting data - all communication is transient

## Features to be added

- Add audio mute/unmute functionality
- Implement screen sharing
- Add chat functionality
- Improve error handling and connection recovery
- Implement user authentication
- Add recording functionality

## License

This project is for educational purposes only.s