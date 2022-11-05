import {connection} from 'websocket'
import ISocket from '../../../engine/interfaces/net/ISocket'
import IDatagram from '../../../engine/interfaces/net/IDatagram'
import * as sv from '../../../engine/sv'
import * as net from '../../../engine/net'
import * as def from '../../../engine/def'
import * as websocket from 'websocket'
import * as wrtc from 'wrtc'
import { QConnectStatus } from '../../../engine/interfaces/net/INetworkDriver'

export const name = "webrtc"
export var initialized = false
export var available = true

const TIME_TO_CONNECT = 3000

type WebRtcDriver = {
  rtc: wrtc.RTCPeerConnection,
  signaling: connection,
  sock: ISocket
}

export const state = {
  acceptSockets: []
}

// not implemented client specific functions
export const connect = async (host: string): Promise<QConnectStatus> => {
  return 'failed'
}
export const checkForResend = (): number => {
  return 0
}

export const acceptNewConnection = (connection: connection) => {
  state.acceptSockets.push(connection)
}
const tryJson = (str, def) => {
  try { 
    return JSON.parse(str) 
    
  }
  catch (err) {
    return def
  }
}

export const init = function()
{
  return true
}


// Listening is performed by webs and passes control to here.
export const listen = function()
{
}

export const registerWithMaster = () => {
}

export const close = (sock: ISocket) => {
	if (sock.driverdata == null)
		return;
  sock.driverdata.rtc.close()
  sock.driverdata = null
}
const createDriver = (socket: ISocket, signaling: connection) => {  
  const driver = {
    rtc: createRtc(signaling, socket),
    signaling,
    sock: socket
  }  
  signaling.on('message', onSignalingReceive(driver))

  driver.rtc.init()
  
  return driver
}

export const checkNewConnections = (): ISocket => {
	if (state.acceptSockets.length === 0)
		return;
  console.log('Pulling new connection....');
	var sock = net.newQSocket();
	var connection = state.acceptSockets.shift();
	sock.driverdata = createDriver(sock, connection);
	sock.receiveMessage = [];
	sock.address = connection.socket.remoteAddress;
	connection.data_socket = sock;
	
	return sock;
};

const onSignalingReceive = (driver: WebRtcDriver) => (message) => {
  console.log("Received signal " + JSON.stringify(message))
	if (message.type !== 'utf8')
		return;

  const msg = tryJson(message.utf8Data, {type: 'none'})
  if (msg.type === 'offer') {
    console.log("Received offer...")
    driver.rtc.acceptOffer(msg.data)
  } else if (msg.type === 'answer') {
    console.log("Received answer...")
    driver.rtc.answer(msg.data);
  } else if (msg.type === 'candidate') {
    console.log("Received ICE candidate... with connection status " + driver.rtc.connectionState())
    console.log("dcanduidate: " +JSON.stringify( msg.data))
    driver.rtc.addCandidate(msg.data)
  } else {
    console.log('Unrecognized Signaling message type.');
  }
}

export const getMessage = (sock: ISocket) => {
	if (sock.driverdata == null)
		return -1;
  if (sock.driverdata.rtc.connectionState() === 'closed')
    return -1;
	if (sock.receiveMessage.length === 0)
		return 0;
	// var src = sock.receiveMessage.shift(), dest = new Uint8Array(net.state.message.data);
	// net.state.message.cursize = src.length - 1;
	// var i;
	// for (i = 1; i < src.length; ++i)
	// 	dest[i - 1] = src[i];
	// return src[0];
	var buffer = sock.receiveMessage.shift()
	var message = new Uint8Array(buffer, 1, buffer.byteLength - 1)
	net.state.message.cursize = message.length;
	(new Uint8Array(net.state.message.data)).set(message);
	return message[0];
}

export const sendMessage = (sock: ISocket, data: IDatagram) => {
	if (sock.driverdata == null)
		return -1;
  if (sock.driverdata.rtc.connectionState() === 'closed')
    return -1;
	var src = new Uint8Array(data.data), dest = Buffer.alloc(data.cursize + 1), i;
	dest[0] = 1;
	var i;
	for (i = 0; i < data.cursize; ++i)
		dest[i + 1] = src[i];
	sock.driverdata.rtc.sendBytes(dest);
	return 1;
}

export const sendUnreliableMessage = (sock: ISocket, data: IDatagram) => {
	if (sock.driverdata == null)
		return -1;
  if (sock.driverdata.rtc.connectionState() === 'closed')
		return -1;
	var src = new Uint8Array(data.data), dest = Buffer.alloc(data.cursize + 1), i;
	dest[0] = 2;
	var i;
	for (i = 0; i < data.cursize; ++i)
		dest[i + 1] = src[i];
	sock.driverdata.rtc.sendBytes(dest);
	return 1;
};

export const canSendMessage = (sock: ISocket) => {
  return sock.driverdata &&
    sock.driverdata.rtc.connectionState() === 'connected'
};

const createRtc = (signaling: connection, sock: ISocket) => {
  let rtcDataChannel = null
  let rtcPeer: null | RTCPeerConnection = null

	const sendSignal = (obj: any) => {
		if (signaling.closeReasonCode !== -1) debugger
		console.log ('signal: sending ' + obj.type)
		signaling.send(JSON.stringify(obj))
	}

  const closePeer = () => {
    rtcPeer.close();
  };

  const init = () => {
    rtcPeer = new wrtc.RTCPeerConnection({
      iceServers: []
    })
  
    rtcPeer.addEventListener('connectionstatechange', () => {
      if (rtcPeer.connectionState === 'closed') {
        rtcPeer.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange);
        net.close(sock)
      }
    })
	
		rtcPeer.addEventListener('icecandidate', (event) => {
			if (event.candidate) {
				sendSignal({
					type: "candidate",
					data: event.candidate
				});
			}
		})
  
    rtcDataChannel = rtcPeer.createDataChannel('quake', {
      ordered: false,
      maxRetransmits: 0
    })

    rtcDataChannel.addEventListener('message', (event => {
      sock.receiveMessage.push(event.data)
    }));
    // const dataChannel = rtcPeer.createDataChannel('quake', {
    //   ordered: false,
    //   maxRetransmits: 0
    // })
  
    // dataChannel.addEventListener('message', (event) => {
    //   sock.receiveMessage.push(event.data)
    // })
  
    let connectionTimer = setTimeout(() => {
      if (rtcPeer.iceConnectionState !== 'connected'
        && rtcPeer.iceConnectionState !== 'completed') {
        net.close(sock)
        console.log("Could not connect")
      }
    }, TIME_TO_CONNECT);
    let reconnectionTimer = null
    const onIceConnectionStateChange = () => {
      if (rtcPeer.iceConnectionState === 'connected'
        || rtcPeer.iceConnectionState === 'completed') {
        if (connectionTimer) {
          clearTimeout(connectionTimer);
          connectionTimer = null;
        }
        clearTimeout(reconnectionTimer);
        reconnectionTimer = null;
      } else if (rtcPeer.iceConnectionState === 'disconnected'
        || rtcPeer.iceConnectionState === 'failed') {
        if (!connectionTimer && !reconnectionTimer) {
          net.close(sock)
          console.log("Closing peer connection due to disconnection")
        }
      }
    };
    
    return rtcPeer!.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    })
      .then((offer) => {
        rtcPeer!.setLocalDescription(offer)
        sendSignal({
          type: "offer",
          data: offer
        });
      })
  }

  return {
    init,
    answer: (sdp) => {
			if (!rtcPeer) return Promise.reject('Connection hasn\'t started')
      rtcPeer.setRemoteDescription(new wrtc.RTCSessionDescription(sdp))
    },
    acceptOffer: (sdp) => {
      rtcPeer.setRemoteDescription(new wrtc.RTCSessionDescription(sdp))
      return rtcPeer.createAnswer(sdp)
        .then((answerSdp) => {
          rtcPeer.setLocalDescription(answerSdp)
          sendSignal({
            type: "answer",
            data: answerSdp
          });
          return answerSdp
        })
        .catch(err => {
          console.log("Error creating answer: " + err)
          closePeer()
        })
    },
    addCandidate: (candidate) => {
      return rtcPeer.addIceCandidate(new wrtc.RTCIceCandidate(candidate)) 
        .catch(err => {
          console.log("signaling state: " + rtcPeer.signalingState)
          console.log("Error adding ice candidate: " + err)
          closePeer()
        })
    },
    sendBytes: (bytes) => {
			if (!rtcDataChannel) {
        return Promise.reject('Connection isn\'t ready for transfer')
      }
      return rtcDataChannel.send(bytes)
    },
    connectionState: () => {
      if (!rtcDataChannel)  return 'connecting' 
      if (rtcDataChannel.readyState === 'closed')  return 'closed' 
       return rtcPeer.connectionState !== 'connected'
        ? rtcPeer.connectionState
        : rtcDataChannel.readyState !== 'open' ? 'connecting' : 'connected'
    },
    close: closePeer
  }
}